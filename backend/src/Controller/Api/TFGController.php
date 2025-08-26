<?php

namespace App\Controller\Api;

use App\Entity\TFG;
use App\Entity\User;
use App\Repository\TFGRepository;
use App\Repository\UserRepository;
use App\Service\NotificacionService;
use App\Dto\TFGCreateDto;
use App\Dto\TFGUpdateDto;
use App\Dto\TFGEstadoUpdateDto;
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
     * Devuelve TFGs según el rol del usuario autenticado con paginación mejorada
     */
    #[Route('/mis-tfgs', name: 'api_tfgs_mis_tfgs', methods: ['GET'])]
    public function misTfgs(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $roles = $user->getRoles();
        
        // Validar y sanitizar parámetros de paginación
        $page = max(1, $request->query->getInt('page', 1));
        $perPage = min(50, max(1, $request->query->getInt('per_page', 10)));
        
        // Parámetros de filtrado opcionales
        $estado = $request->query->get('estado');
        $search = $request->query->get('search');
        $sortBy = $request->query->get('sort_by', 'created_at');
        $sortOrder = $request->query->get('sort_order', 'DESC');
        
        // Validar parámetros de ordenamiento
        $allowedSortFields = ['created_at', 'updated_at', 'titulo', 'estado'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }
        
        if (!in_array(strtoupper($sortOrder), ['ASC', 'DESC'])) {
            $sortOrder = 'DESC';
        }

        // Determinar qué TFGs puede ver según su rol
        $result = match(true) {
            in_array('ROLE_ADMIN', $roles) => $this->tfgRepository->findAllPaginated(
                $page, $perPage, $estado, $search, $sortBy, $sortOrder
            ),
            in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles) => $this->tfgRepository->findByTribunal(
                $user, $page, $perPage, $estado, $search, $sortBy, $sortOrder
            ),
            in_array('ROLE_PROFESOR', $roles) => $this->tfgRepository->findByTutorOrCotutor(
                $user, $page, $perPage, $estado, $search, $sortBy, $sortOrder
            ),
            in_array('ROLE_ESTUDIANTE', $roles) => $this->tfgRepository->findByEstudiante(
                $user, $page, $perPage, $estado, $search, $sortBy, $sortOrder
            ),
            default => ['data' => [], 'total' => 0]
        };

        $totalPages = ceil($result['total'] / $perPage);
        
        return $this->json([
            'data' => $result['data'],
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $result['total'],
                'total_pages' => $totalPages,
                'has_next' => $page < $totalPages,
                'has_previous' => $page > 1,
                'from' => (($page - 1) * $perPage) + 1,
                'to' => min($page * $perPage, $result['total'])
            ],
            'links' => [
                'first' => $this->generatePaginationUrl($request, 1),
                'last' => $this->generatePaginationUrl($request, $totalPages),
                'prev' => $page > 1 ? $this->generatePaginationUrl($request, $page - 1) : null,
                'next' => $page < $totalPages ? $this->generatePaginationUrl($request, $page + 1) : null,
            ]
        ], 200, [], ['groups' => ['tfg:read', 'user:basic']]);
    }

    /**
     * POST /api/tfgs
     * Crear nuevo TFG (solo estudiantes) con validación DTO
     */
    #[Route('', name: 'api_tfgs_create', methods: ['POST'])]
    #[IsGranted('ROLE_ESTUDIANTE')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Datos JSON inválidos'], 400);
        }

        // Crear DTO para validación
        $dto = new TFGCreateDto();
        $dto->titulo = $data['titulo'] ?? '';
        $dto->descripcion = $data['descripcion'] ?? '';
        $dto->resumen = $data['resumen'] ?? '';
        $dto->palabras_clave = $data['palabras_clave'] ?? [];
        $dto->tutor_id = $data['tutor_id'] ?? null;
        $dto->cotutor_id = $data['cotutor_id'] ?? null;
        $dto->fecha_inicio = $data['fecha_inicio'] ?? null;
        $dto->fecha_fin_estimada = $data['fecha_fin_estimada'] ?? null;

        // Validar DTO
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'error' => 'Datos de entrada inválidos',
                'violations' => $this->formatValidationErrors($errors)
            ], 400);
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
        $tfg->setTitulo($dto->titulo);
        $tfg->setDescripcion($dto->descripcion);
        $tfg->setResumen($dto->resumen);
        $tfg->setPalabrasClave($dto->palabras_clave);
        $tfg->setEstudiante($estudiante);
        $tfg->setEstado('borrador');

        // Asignar fechas si se proporcionan
        if ($dto->fecha_inicio) {
            $tfg->setFechaInicio(new \DateTime($dto->fecha_inicio));
        }
        if ($dto->fecha_fin_estimada) {
            $tfg->setFechaFinEstimada(new \DateTime($dto->fecha_fin_estimada));
        }

        // Asignar tutor
        if ($dto->tutor_id) {
            $tutor = $this->userRepository->find($dto->tutor_id);
            if (!$tutor || !in_array('ROLE_PROFESOR', $tutor->getRoles())) {
                return $this->json(['error' => 'Tutor no válido'], 400);
            }
            $tfg->setTutor($tutor);
        }

        // Asignar cotutor si se proporciona
        if ($dto->cotutor_id) {
            $cotutor = $this->userRepository->find($dto->cotutor_id);
            if (!$cotutor || !in_array('ROLE_PROFESOR', $cotutor->getRoles())) {
                return $this->json(['error' => 'Cotutor no válido'], 400);
            }
            $tfg->setCotutor($cotutor);
        }

        // Validar entidad final
        $entityErrors = $this->validator->validate($tfg);
        if (count($entityErrors) > 0) {
            return $this->json([
                'error' => 'Error de validación de entidad',
                'violations' => $this->formatValidationErrors($entityErrors)
            ], 400);
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
     * Actualizar TFG con validación DTO
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

        // Crear DTO para validación
        $dto = new TFGUpdateDto();
        $dto->titulo = $data['titulo'] ?? $tfg->getTitulo();
        $dto->descripcion = $data['descripcion'] ?? $tfg->getDescripcion();
        $dto->resumen = $data['resumen'] ?? $tfg->getResumen();
        $dto->palabras_clave = $data['palabras_clave'] ?? $tfg->getPalabrasClave();

        // Validar DTO
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'error' => 'Datos de entrada inválidos',
                'violations' => $this->formatValidationErrors($errors)
            ], 400);
        }

        /** @var User $user */
        $user = $this->getUser();
        $roles = $user->getRoles();

        // Solo permitir actualizar ciertos campos según el rol
        if (in_array('ROLE_ESTUDIANTE', $roles)) {
            $tfg->setTitulo($dto->titulo);
            $tfg->setDescripcion($dto->descripcion);
            $tfg->setResumen($dto->resumen);
            $tfg->setPalabrasClave($dto->palabras_clave);
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

        // Validar entidad actualizada
        $entityErrors = $this->validator->validate($tfg);
        if (count($entityErrors) > 0) {
            return $this->json([
                'error' => 'Error de validación de entidad',
                'violations' => $this->formatValidationErrors($entityErrors)
            ], 400);
        }

        $this->entityManager->flush();

        return $this->json($tfg, 200, [], ['groups' => ['tfg:read', 'user:basic']]);
    }

    /**
     * PUT /api/tfgs/{id}/estado
     * Cambiar estado del TFG con validación DTO
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
        
        if (!$data) {
            return $this->json(['error' => 'Datos JSON inválidos'], 400);
        }

        // Crear DTO para validación
        $dto = new TFGEstadoUpdateDto();
        $dto->estado = $data['estado'] ?? '';
        $dto->comentario = $data['comentario'] ?? '';

        // Validar DTO
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'error' => 'Datos de entrada inválidos',
                'violations' => $this->formatValidationErrors($errors)
            ], 400);
        }

        // Validar transición de estado
        if (!$tfg->canTransitionTo($dto->estado)) {
            return $this->json([
                'error' => "No se puede cambiar de '{$tfg->getEstado()}' a '{$dto->estado}'"
            ], 400);
        }

        $estadoAnterior = $tfg->getEstado();
        $tfg->setEstado($dto->estado);

        // Actualizar fecha de finalización si se aprueba
        if ($dto->estado === 'aprobado' && !$tfg->getFechaFinReal()) {
            $tfg->setFechaFinReal(new \DateTime());
        }

        $this->entityManager->flush();

        // Crear notificación para el estudiante
        $this->notificacionService->crearNotificacion(
            $tfg->getEstudiante(),
            'Estado de TFG actualizado',
            "Tu TFG '{$tfg->getTitulo()}' ha cambiado de estado: {$estadoAnterior} → {$dto->estado}" . 
            ($dto->comentario ? "\n\nComentario: {$dto->comentario}" : ''),
            $this->getTipoNotificacionPorEstado($dto->estado)
        );

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

    /**
     * Generar URL de paginación manteniendo parámetros de consulta
     */
    private function generatePaginationUrl(Request $request, int $page): string
    {
        $params = $request->query->all();
        $params['page'] = $page;
        
        return $request->getPathInfo() . '?' . http_build_query($params);
    }

    /**
     * Formatear errores de validación para respuesta JSON
     */
    private function formatValidationErrors($errors): array
    {
        $violations = [];
        foreach ($errors as $error) {
            $violations[] = [
                'field' => $error->getPropertyPath(),
                'message' => $error->getMessage(),
                'invalid_value' => $error->getInvalidValue()
            ];
        }
        return $violations;
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