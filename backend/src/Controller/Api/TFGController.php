<?php

namespace App\Controller\Api;

use App\Entity\TFG;
use App\Entity\User;
use App\Repository\TFGRepository;
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

#[Route('/api/tfgs')]
#[IsGranted('ROLE_USER')]
class TFGController extends AbstractController
{
    public function __construct(
        private TFGRepository $tfgRepository,
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private NotificacionService $notificacionService
    ) {}

    /**
     * GET /api/tfgs/mis-tfgs
     * Devuelve TFGs según el rol del usuario autenticado
     */
    #[Route('/mis-tfgs', name: 'api_tfgs_mis_tfgs', methods: ['GET'])]
    public function misTfgs(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $roles = $user->getRoles();
        $page = max(1, $request->query->getInt('page', 1));
        $perPage = min(50, max(1, $request->query->getInt('per_page', 10)));

        // Determinar qué TFGs puede ver según su rol
        $tfgs = match(true) {
            in_array('ROLE_ADMIN', $roles) => $this->tfgRepository->findAllPaginated($page, $perPage),
            in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles) => $this->tfgRepository->findByTribunal($user, $page, $perPage),
            in_array('ROLE_PROFESOR', $roles) => $this->tfgRepository->findByTutorOrCotutor($user, $page, $perPage),
            in_array('ROLE_ESTUDIANTE', $roles) => $this->tfgRepository->findByEstudiante($user, $page, $perPage),
            default => ['data' => [], 'total' => 0]
        };

        return $this->json([
            'data' => $tfgs['data'],
            'meta' => [
                'total' => $tfgs['total'],
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($tfgs['total'] / $perPage)
            ]
        ], 200, [], ['groups' => ['tfg:read', 'user:basic']]);
    }

    /**
     * POST /api/tfgs
     * Crear nuevo TFG (solo estudiantes)
     */
    #[Route('', name: 'api_tfgs_create', methods: ['POST'])]
    #[IsGranted('ROLE_ESTUDIANTE')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Datos JSON inválidos'], 400);
        }

        /** @var User $estudiante */
        $estudiante = $this->getUser();

        // Verificar que el estudiante no tenga ya un TFG activo
        $tfgExistente = $this->tfgRepository->findOneBy([
            'estudiante' => $estudiante,
            'estado' => ['borrador', 'revision', 'aprobado']
        ]);

        if ($tfgExistente) {
            return $this->json([
                'error' => 'Ya tienes un TFG activo. No puedes crear otro hasta completar el actual.'
            ], 400);
        }

        // Crear nueva entidad TFG
        $tfg = new TFG();
        $tfg->setTitulo($data['titulo'] ?? '');
        $tfg->setDescripcion($data['descripcion'] ?? '');
        $tfg->setResumen($data['resumen'] ?? '');
        $tfg->setPalabrasClave($data['palabras_clave'] ?? []);
        $tfg->setEstudiante($estudiante);
        $tfg->setEstado('borrador');

        // Asignar tutor si se proporciona
        if (!empty($data['tutor_id'])) {
            $tutor = $this->userRepository->find($data['tutor_id']);
            if (!$tutor || !in_array('ROLE_PROFESOR', $tutor->getRoles())) {
                return $this->json(['error' => 'Tutor no válido'], 400);
            }
            $tfg->setTutor($tutor);
        }

        // Asignar cotutor si se proporciona
        if (!empty($data['cotutor_id'])) {
            $cotutor = $this->userRepository->find($data['cotutor_id']);
            if (!$cotutor || !in_array('ROLE_PROFESOR', $cotutor->getRoles())) {
                return $this->json(['error' => 'Cotutor no válido'], 400);
            }
            $tfg->setCotutor($cotutor);
        }

        // Validar datos
        $errors = $this->validator->validate($tfg);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        // Guardar en base de datos
        $this->entityManager->persist($tfg);
        $this->entityManager->flush();

        // Crear notificación para el tutor
        if ($tfg->getTutor()) {
            $this->notificacionService->crearNotificacion(
                $tfg->getTutor(),
                'Nuevo TFG asignado',
                "Se te ha asignado el TFG '{$tfg->getTitulo()}' del estudiante {$estudiante->getNombreCompleto()}",
                'info'
            );
        }

        return $this->json($tfg, 201, [], ['groups' => ['tfg:read', 'user:basic']]);
    }

    /**
     * PUT /api/tfgs/{id}
     * Actualizar TFG (estudiante: solo propio, profesor: solo asignado, admin: todos)
     */
    #[Route('/{id}', name: 'api_tfgs_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $tfg = $this->tfgRepository->find($id);
        
        if (!$tfg) {
            return $this->json(['error' => 'TFG no encontrado'], 404);
        }

        // Verificar permisos
        $this->denyAccessUnlessGranted('tfg_edit', $tfg);

        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Datos JSON inválidos'], 400);
        }

        // Solo permitir actualizar ciertos campos según el rol
        /** @var User $user */
        $user = $this->getUser();
        $roles = $user->getRoles();

        // Estudiante solo puede editar metadatos básicos
        if (in_array('ROLE_ESTUDIANTE', $roles)) {
            if (isset($data['titulo'])) $tfg->setTitulo($data['titulo']);
            if (isset($data['descripcion'])) $tfg->setDescripcion($data['descripcion']);
            if (isset($data['resumen'])) $tfg->setResumen($data['resumen']);
            if (isset($data['palabras_clave'])) $tfg->setPalabrasClave($data['palabras_clave']);
        }

        // Profesor/Admin pueden actualizar más campos
        if (in_array('ROLE_PROFESOR', $roles) || in_array('ROLE_ADMIN', $roles)) {
            if (isset($data['fecha_fin_estimada'])) {
                $tfg->setFechaFinEstimada(new \DateTime($data['fecha_fin_estimada']));
            }
            if (isset($data['calificacion'])) {
                $tfg->setCalificacion($data['calificacion']);
            }
        }

        // Validar
        $errors = $this->validator->validate($tfg);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->flush();

        return $this->json($tfg, 200, [], ['groups' => ['tfg:read', 'user:basic']]);
    }

    /**
     * PUT /api/tfgs/{id}/estado
     * Cambiar estado del TFG (solo profesores y admin)
     */
    #[Route('/{id}/estado', name: 'api_tfgs_update_estado', methods: ['PUT'])]
    public function updateEstado(int $id, Request $request): JsonResponse
    {
        $tfg = $this->tfgRepository->find($id);
        
        if (!$tfg) {
            return $this->json(['error' => 'TFG no encontrado'], 404);
        }

        // Verificar permisos
        $this->denyAccessUnlessGranted('tfg_update_estado', $tfg);

        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['estado'])) {
            return $this->json(['error' => 'Estado requerido'], 400);
        }

        $nuevoEstado = $data['estado'];
        $comentario = $data['comentario'] ?? '';

        // Validar transición de estado
        if (!$tfg->canTransitionTo($nuevoEstado)) {
            return $this->json([
                'error' => "No se puede cambiar de '{$tfg->getEstado()}' a '{$nuevoEstado}'"
            ], 400);
        }

        $estadoAnterior = $tfg->getEstado();
        $tfg->setEstado($nuevoEstado);

        // Actualizar fecha de finalización si se aprueba
        if ($nuevoEstado === 'aprobado' && !$tfg->getFechaFinReal()) {
            $tfg->setFechaFinReal(new \DateTime());
        }

        $this->entityManager->flush();

        // Crear notificación para el estudiante
        $this->notificacionService->crearNotificacion(
            $tfg->getEstudiante(),
            'Estado de TFG actualizado',
            "Tu TFG '{$tfg->getTitulo()}' ha cambiado de estado: {$estadoAnterior} → {$nuevoEstado}" . 
            ($comentario ? "\n\nComentario: {$comentario}" : ''),
            $this->getTipoNotificacionPorEstado($nuevoEstado)
        );

        // Si hay comentario, crear un comentario en el TFG
        if ($comentario) {
            // TODO: Implementar sistema de comentarios
        }

        return $this->json([
            'id' => $tfg->getId(),
            'estado' => $tfg->getEstado(),
            'updated_at' => $tfg->getUpdatedAt()->format('c')
        ]);
    }

    /**
     * GET /api/tfgs/{id}
     * Ver detalle de un TFG específico
     */
    #[Route('/{id}', name: 'api_tfgs_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $tfg = $this->tfgRepository->find($id);
        
        if (!$tfg) {
            return $this->json(['error' => 'TFG no encontrado'], 404);
        }

        // Verificar permisos
        $this->denyAccessUnlessGranted('tfg_view', $tfg);

        return $this->json($tfg, 200, [], ['groups' => ['tfg:read', 'user:basic', 'tribunal:basic']]);
    }

    /**
     * DELETE /api/tfgs/{id}
     * Eliminar TFG (solo admin o estudiante propietario si está en borrador)
     */
    #[Route('/{id}', name: 'api_tfgs_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $tfg = $this->tfgRepository->find($id);
        
        if (!$tfg) {
            return $this->json(['error' => 'TFG no encontrado'], 404);
        }

        /** @var User $user */
        $user = $this->getUser();
        $roles = $user->getRoles();

        // Solo admin o estudiante propietario (y solo si está en borrador)
        if (!in_array('ROLE_ADMIN', $roles)) {
            if ($tfg->getEstudiante() !== $user || $tfg->getEstado() !== 'borrador') {
                return $this->json(['error' => 'No tienes permisos para eliminar este TFG'], 403);
            }
        }

        $this->entityManager->remove($tfg);
        $this->entityManager->flush();

        return $this->json(['message' => 'TFG eliminado correctamente'], 200);
    }

    private function getTipoNotificacionPorEstado(string $estado): string
    {
        return match($estado) {
            'aprobado' => 'success',
            'revision' => 'warning',
            'defendido' => 'success',
            default => 'info'
        };
    }
}