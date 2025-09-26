<?php

namespace App\Controller\Api;

use App\Entity\Tribunal;
use App\Entity\User;
use App\Repository\TribunalRepository;
use App\Repository\UserRepository;
use App\Service\NotificacionService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/tribunales')]
#[IsGranted('ROLE_PROFESOR')]
class TribunalController extends AbstractController
{
    public function __construct(
        private TribunalRepository $tribunalRepository,
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private NotificacionService $notificacionService
    ) {}

    /**
     * GET /api/tribunales
     * Listar tribunales según permisos del usuario
     */
    #[Route('', name: 'api_tribunales_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $roles = $user->getRoles();
        $page = max(1, $request->query->getInt('page', 1));
        $perPage = min(50, max(1, $request->query->getInt('per_page', 10)));
        $activo = $request->query->get('activo', 'true') === 'true';

        // Determinar qué tribunales puede ver según su rol
        $tribunales = match(true) {
            in_array('ROLE_ADMIN', $roles) => 
                $this->tribunalRepository->findAllPaginated($page, $perPage, $activo),
            in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles) => 
                $this->tribunalRepository->findByMiembro($user, $page, $perPage, $activo),
            default => 
                $this->tribunalRepository->findByMiembro($user, $page, $perPage, $activo)
        };

        // Transformar los tribunales para incluir información del usuario actual
        $tribunalesTransformados = [];
        foreach ($tribunales['data'] as $tribunal) {
            $tribunalArray = $this->serializer->normalize($tribunal, null, ['groups' => ['tribunal:read', 'user:basic']]);
            $tribunalArray['miembros'] = $tribunal->getMiembrosConUsuario($user);
            $tribunalesTransformados[] = $tribunalArray;
        }

        return $this->json([
            'data' => $tribunalesTransformados,
            'meta' => [
                'total' => $tribunales['total'],
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($tribunales['total'] / $perPage)
            ]
        ]);
    }

    /**
     * POST /api/tribunales
     * Crear nuevo tribunal (cualquier profesor puede crear un tribunal y se convierte en presidente)
     */
    #[Route('', name: 'api_tribunales_create', methods: ['POST'])]
    #[IsGranted('ROLE_PROFESOR')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Datos JSON inválidos'], 400);
        }

        // Validar campos requeridos
        $requiredFields = ['nombre', 'vocal', 'secretario'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->json(['error' => "Campo '{$field}' requerido"], 400);
            }
        }

        // Obtener el usuario actual como presidente
        /** @var User $currentUser */
        $currentUser = $this->getUser();

        // Recoger todos los IDs de miembros (excluyendo valores vacíos para suplentes opcionales)
        $ids = array_filter([
            $currentUser->getId(), // presidente es el usuario actual
            $data['vocal'],
            $data['secretario'],
            $data['suplente1'] ?? null,
            $data['suplente2'] ?? null
        ]);

        if (count($ids) !== count(array_unique($ids))) {
            return $this->json(['error' => 'Los miembros del tribunal deben ser diferentes'], 400);
        }

        // Buscar y validar usuarios
        $secretario = $this->userRepository->find($data['secretario']);
        $vocal = $this->userRepository->find($data['vocal']);

        // Suplentes opcionales
        $suplente1 = isset($data['suplente1']) && !empty($data['suplente1']) ? $this->userRepository->find($data['suplente1']) : null;
        $suplente2 = isset($data['suplente2']) && !empty($data['suplente2']) ? $this->userRepository->find($data['suplente2']) : null;

        if (!$secretario || !in_array('ROLE_PROFESOR', $secretario->getRoles())) {
            return $this->json(['error' => 'Secretario no válido o no es profesor'], 400);
        }
        if (!$vocal || !in_array('ROLE_PROFESOR', $vocal->getRoles())) {
            return $this->json(['error' => 'Vocal no válido o no es profesor'], 400);
        }

        if ($suplente1 && !in_array('ROLE_PROFESOR', $suplente1->getRoles())) {
            return $this->json(['error' => 'Suplente 1 no válido o no es profesor'], 400);
        }
        if ($suplente2 && !in_array('ROLE_PROFESOR', $suplente2->getRoles())) {
            return $this->json(['error' => 'Suplente 2 no válido o no es profesor'], 400);
        }

        // Verificar que no existe tribunal con el mismo nombre activo
        $tribunalExistente = $this->tribunalRepository->findOneBy([
            'nombre' => $data['nombre'],
            'activo' => true
        ]);
        
        if ($tribunalExistente) {
            return $this->json(['error' => 'Ya existe un tribunal activo con ese nombre'], 400);
        }

        // Crear tribunal
        $tribunal = new Tribunal();
        $tribunal->setNombre($data['nombre']);
        $tribunal->setPresidente($currentUser); // El usuario actual es el presidente
        $tribunal->setSecretario($secretario);
        $tribunal->setVocal($vocal);
        if ($suplente1) {
            $tribunal->setSuplente1($suplente1);
        }
        if ($suplente2) {
            $tribunal->setSuplente2($suplente2);
        }
        $tribunal->setDescripcion($data['descripcion'] ?? '');
        $tribunal->setActivo(true);

        // Validar entidad
        $errors = $this->validator->validate($tribunal);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->persist($tribunal);
        $this->entityManager->flush();

        // Notificar a los miembros del tribunal
        $miembros = array_filter([$currentUser, $secretario, $vocal, $suplente1, $suplente2]);
        foreach ($miembros as $miembro) {
            $rol = match($miembro) {
                $currentUser => 'Presidente',
                $secretario => 'Secretario',
                $vocal => 'Vocal',
                $suplente1 => 'Suplente 1',
                $suplente2 => 'Suplente 2',
                default => 'Miembro'
            };

            $this->notificacionService->crearNotificacion(
                $miembro,
                'Asignado a Tribunal',
                "Has sido asignado como {$rol} del tribunal '{$tribunal->getNombre()}'.",
                'info',
                [
                    'tipo_evento' => 'tribunal_asignado',
                    'tribunal_id' => $tribunal->getId(),
                    'rol' => $rol
                ],
                true
            );
        }

        return $this->json($tribunal, 201, [], ['groups' => ['tribunal:read', 'user:basic']]);
    }

    /**
     * GET /api/tribunales/{id}
     * Ver tribunal específico
     */
    #[Route('/{id}', name: 'api_tribunales_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $tribunal = $this->tribunalRepository->find($id);

        if (!$tribunal) {
            return $this->json(['error' => 'Tribunal no encontrado'], 404);
        }

        // Verificar permisos
        $this->denyAccessUnlessGranted('tribunal_view', $tribunal);

        /** @var User $user */
        $user = $this->getUser();

        // Serializar el tribunal
        $tribunalArray = $this->serializer->normalize($tribunal, null, ['groups' => ['tribunal:read', 'user:basic', 'defensa:basic']]);

        // Añadir información adicional
        $tribunalArray['miembrosConUsuario'] = $tribunal->getMiembrosConUsuario($user);

        return $this->json($tribunalArray, 200);
    }

    /**
     * PUT /api/tribunales/{id}
     * Actualizar tribunal
     */
    #[Route('/{id}', name: 'api_tribunales_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $tribunal = $this->tribunalRepository->find($id);
        
        if (!$tribunal) {
            return $this->json(['error' => 'Tribunal no encontrado'], 404);
        }

        // Verificar permisos
        $this->denyAccessUnlessGranted('tribunal_edit', $tribunal);

        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Datos JSON inválidos'], 400);
        }

        // Actualizar campos permitidos
        if (isset($data['nombre'])) {
            // Verificar que no existe otro tribunal con el mismo nombre
            $tribunalExistente = $this->tribunalRepository->findOneBy([
                'nombre' => $data['nombre'],
                'activo' => true
            ]);
            
            if ($tribunalExistente && $tribunalExistente->getId() !== $tribunal->getId()) {
                return $this->json(['error' => 'Ya existe un tribunal activo con ese nombre'], 400);
            }
            
            $tribunal->setNombre($data['nombre']);
        }

        if (isset($data['descripcion'])) {
            $tribunal->setDescripcion($data['descripcion']);
        }

        // Solo admin puede cambiar miembros del tribunal
        /** @var User $user */
        $user = $this->getUser();
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            if (isset($data['presidente_id'])) {
                $presidente = $this->userRepository->find($data['presidente_id']);
                if ($presidente && in_array('ROLE_PROFESOR', $presidente->getRoles())) {
                    $tribunal->setPresidente($presidente);
                }
            }
            
            if (isset($data['secretario_id'])) {
                $secretario = $this->userRepository->find($data['secretario_id']);
                if ($secretario && in_array('ROLE_PROFESOR', $secretario->getRoles())) {
                    $tribunal->setSecretario($secretario);
                }
            }
            
            if (isset($data['vocal_id'])) {
                $vocal = $this->userRepository->find($data['vocal_id']);
                if ($vocal && in_array('ROLE_PROFESOR', $vocal->getRoles())) {
                    $tribunal->setVocal($vocal);
                }
            }
        }

        // Validar
        $errors = $this->validator->validate($tribunal);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->flush();

        return $this->json($tribunal, 200, [], ['groups' => ['tribunal:read', 'user:basic']]);
    }

    /**
     * PUT /api/tribunales/{id}/estado
     * Activar/Desactivar tribunal
     */
    #[Route('/{id}/estado', name: 'api_tribunales_toggle_estado', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function toggleEstado(int $id, Request $request): JsonResponse
    {
        $tribunal = $this->tribunalRepository->find($id);
        
        if (!$tribunal) {
            return $this->json(['error' => 'Tribunal no encontrado'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['activo'])) {
            return $this->json(['error' => 'Campo "activo" requerido'], 400);
        }

        $nuevoEstado = $data['activo'];

        // Verificar si puede desactivarse
        if (!$nuevoEstado) {
            $defensasPendientes = $this->entityManager->getRepository('App\Entity\Defensa')
                ->count(['tribunal' => $tribunal, 'estado' => 'programada']);
                
            if ($defensasPendientes > 0) {
                return $this->json([
                    'error' => 'No se puede desactivar el tribunal. Tiene defensas programadas pendientes.'
                ], 400);
            }
        }

        $tribunal->setActivo($nuevoEstado);
        $this->entityManager->flush();

        // Notificar cambio de estado a los miembros
        $mensaje = $nuevoEstado 
            ? "El tribunal '{$tribunal->getNombre()}' ha sido activado."
            : "El tribunal '{$tribunal->getNombre()}' ha sido desactivado.";

        $miembros = array_filter([
            $tribunal->getPresidente(),
            $tribunal->getSecretario(),
            $tribunal->getVocal(),
            $tribunal->getSuplente1(),
            $tribunal->getSuplente2()
        ]);
        foreach ($miembros as $miembro) {
            if ($miembro) {
                $this->notificacionService->crearNotificacion(
                    $miembro,
                    'Cambio de Estado de Tribunal',
                    $mensaje,
                    $nuevoEstado ? 'success' : 'warning'
                );
            }
        }

        return $this->json([
            'id' => $tribunal->getId(),
            'activo' => $tribunal->isActivo(),
            'updated_at' => $tribunal->getUpdatedAt()->format('c')
        ]);
    }

    /**
     * GET /api/tribunales/{id}/disponibilidad
     * Consultar disponibilidad del tribunal para fechas
     */
    #[Route('/{id}/disponibilidad', name: 'api_tribunales_disponibilidad', methods: ['GET'])]
    public function disponibilidad(int $id, Request $request): JsonResponse
    {
        $tribunal = $this->tribunalRepository->find($id);
        
        if (!$tribunal) {
            return $this->json(['error' => 'Tribunal no encontrado'], 404);
        }

        $this->denyAccessUnlessGranted('tribunal_view', $tribunal);

        $fechaInicio = $request->query->get('fecha_inicio');
        $fechaFin = $request->query->get('fecha_fin');

        if (!$fechaInicio || !$fechaFin) {
            return $this->json(['error' => 'Parámetros fecha_inicio y fecha_fin requeridos'], 400);
        }

        try {
            $inicio = new \DateTime($fechaInicio);
            $fin = new \DateTime($fechaFin);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Formato de fecha inválido'], 400);
        }

        // Obtener defensas programadas en el rango
        $defensas = $this->entityManager->getRepository('App\Entity\Defensa')
            ->createQueryBuilder('d')
            ->where('d.tribunal = :tribunal')
            ->andWhere('d.fechaDefensa BETWEEN :inicio AND :fin')
            ->andWhere('d.estado != :cancelada')
            ->setParameter('tribunal', $tribunal)
            ->setParameter('inicio', $inicio)
            ->setParameter('fin', $fin)
            ->setParameter('cancelada', 'cancelada')
            ->getQuery()
            ->getResult();

        $ocupado = [];
        foreach ($defensas as $defensa) {
            $ocupado[] = [
                'fecha' => $defensa->getFechaDefensa()->format('c'),
                'tfg' => $defensa->getTfg()->getTitulo(),
                'estudiante' => $defensa->getTfg()->getEstudiante()->getNombreCompleto(),
                'aula' => $defensa->getAula()
            ];
        }

        return $this->json([
            'tribunal' => [
                'id' => $tribunal->getId(),
                'nombre' => $tribunal->getNombre()
            ],
            'periodo' => [
                'inicio' => $inicio->format('c'),
                'fin' => $fin->format('c')
            ],
            'defensas_programadas' => $ocupado,
            'total_defensas' => count($ocupado)
        ]);
    }

    /**
     * GET /api/tribunales/profesores-disponibles
     * Listar profesores disponibles para formar tribunales
     */
    #[Route('/profesores-disponibles', name: 'api_tribunales_profesores_disponibles', methods: ['GET'])]
    #[IsGranted('ROLE_PROFESOR')]
    public function profesoresDisponibles(): JsonResponse
    {
        $profesores = $this->userRepository->findByRole('ROLE_PROFESOR', true); // Activos

        $profesoresData = [];
        foreach ($profesores as $profesor) {
            $tribunalesActivos = $this->tribunalRepository->countTribunalesActivosByProfesor($profesor);
            
            $profesoresData[] = [
                'id' => $profesor->getId(),
                'nombre_completo' => $profesor->getNombreCompleto(),
                'email' => $profesor->getEmail(),
                'departamento' => $profesor->getDepartamento(),
                'especialidad' => $profesor->getEspecialidad(),
                'tribunales_activos' => $tribunalesActivos,
                'disponible' => $tribunalesActivos < 3 // Límite configurable
            ];
        }

        return $this->json([
            'data' => $profesoresData,
            'meta' => [
                'total' => count($profesoresData)
            ]
        ]);
    }

    /**
     * DELETE /api/tribunales/{id}
     * Eliminar tribunal (solo admin)
     */
    #[Route('/{id}', name: 'api_tribunales_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $tribunal = $this->tribunalRepository->find($id);
        
        if (!$tribunal) {
            return $this->json(['error' => 'Tribunal no encontrado'], 404);
        }

        // Verificar que no tiene defensas asociadas
        $defensasCount = $this->entityManager->getRepository('App\Entity\Defensa')
            ->count(['tribunal' => $tribunal]);
            
        if ($defensasCount > 0) {
            return $this->json([
                'error' => 'No se puede eliminar el tribunal. Tiene defensas asociadas.'
            ], 400);
        }

        $this->entityManager->remove($tribunal);
        $this->entityManager->flush();

        return $this->json(['message' => 'Tribunal eliminado correctamente']);
    }
}