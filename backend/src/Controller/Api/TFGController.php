<?php

namespace App\Controller\Api;

use App\Entity\TFG;
use App\Entity\User;
use App\Entity\Comentario;
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
use Vich\UploaderBundle\Handler\UploadHandler;
use Symfony\Component\HttpFoundation\File\UploadedFile;

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
        private NotificacionService $notificacionService,
        private UploadHandler $uploadHandler
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
     * GET /api/tfgs/asignados
     * Devuelve TFGs asignados como tutor o cotutor (para profesores)
     */
    #[Route('/asignados', name: 'api_tfgs_asignados', methods: ['GET'])]
    #[IsGranted('ROLE_PROFESOR')]
    public function asignados(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        // Parámetros de paginación
        $page = max(1, $request->query->getInt('page', 1));
        $perPage = min(50, max(1, $request->query->getInt('per_page', 10)));
        $estado = $request->query->get('estado');
        $search = $request->query->get('search');

        // Buscar TFGs donde el usuario es tutor o cotutor
        $result = $this->tfgRepository->findByTutorOrCotutor($user, $page, $perPage, $estado, $search);
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
        // Manejar tanto JSON como multipart/form-data
        if ($request->getContentTypeFormat() === 'json') {
            $data = json_decode($request->getContent(), true);
            if (!$data) {
                return $this->json(['error' => 'Datos JSON inválidos'], 400);
            }
        } else {
            // Para multipart/form-data, usar request->request->all()
            $data = $request->request->all();

            // Decodificar palabras_clave si viene como string JSON
            if (isset($data['palabras_clave']) && is_string($data['palabras_clave'])) {
                $palabrasClave = json_decode($data['palabras_clave'], true);
                if ($palabrasClave !== null) {
                    $data['palabras_clave'] = $palabrasClave;
                }
            }
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
        $dto->area_conocimiento = $data['area_conocimiento'] ?? null;
        $dto->tipo_tfg = $data['tipo_tfg'] ?? null;
        $dto->idioma = $data['idioma'] ?? 'español';

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
        $tfg->setAreaConocimiento($dto->area_conocimiento);
        $tfg->setTipoTFG($dto->tipo_tfg);
        $tfg->setIdioma($dto->idioma);
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

        // Manejar archivo si se proporciona
        $archivo = $request->files->get('archivo');
        if ($archivo) {
            try {
                // Validar archivo
                if (!$this->validateFile($archivo)) {
                    return $this->json(['error' => 'Archivo no válido. Solo se permiten archivos PDF de hasta 50MB'], 400);
                }

                // Usar VichUploader para manejar el archivo
                $tfg->setArchivoFile($archivo);
                $this->uploadHandler->upload($tfg, 'archivoFile');
                $tfg->setEstado('revision'); // Cambiar estado a revisión cuando se sube archivo
            } catch (\Exception $e) {
                return $this->json(['error' => 'Error al subir archivo: ' . $e->getMessage()], 400);
            }
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
        // Usar el método que carga todas las relaciones para que el voter funcione correctamente
        $tfg = $this->tfgRepository->findWithAllRelations($id);

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

    /**
     * GET /api/tfgs/{id}/comentarios
     * Obtener comentarios de un TFG específico
     */
    #[Route('/{id}/comentarios', name: 'api_tfg_comentarios', methods: ['GET'])]
    public function getComentarios(int $id): JsonResponse
    {
        // Usar el método que carga todas las relaciones para que el voter funcione correctamente
        $tfg = $this->tfgRepository->findWithAllRelations($id);

        if (!$tfg) {
            return $this->json(['error' => 'TFG no encontrado'], 404);
        }

        // Verificar permisos
        $this->denyAccessUnlessGranted('tfg_view', $tfg);

        $comentarios = $tfg->getComentarios()->toArray();

        return $this->json($comentarios, 200, [], ['groups' => ['comentario:read', 'user:basic']]);
    }

    /**
     * POST /api/tfgs/{id}/comentarios
     * Crear nuevo comentario para un TFG específico
     */
    #[Route('/{id}/comentarios', name: 'api_tfg_add_comentario', methods: ['POST'])]
    public function addComentario(int $id, Request $request): JsonResponse
    {
        $tfg = $this->tfgRepository->find($id);

        if (!$tfg) {
            return $this->json(['error' => 'TFG no encontrado'], 404);
        }

        // Verificar permisos
        $this->denyAccessUnlessGranted('tfg_view', $tfg);

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Datos JSON inválidos'], 400);
        }

        if (empty($data['comentario'])) {
            return $this->json(['error' => 'El comentario es obligatorio'], 400);
        }

        /** @var User $user */
        $user = $this->getUser();

        // Crear nuevo comentario
        $comentario = new Comentario();
        $comentario->setTfg($tfg);
        $comentario->setAutor($user);
        $comentario->setComentario($data['comentario']);

        // Establecer tipo de comentario si se proporciona
        if (!empty($data['tipo']) && in_array($data['tipo'], Comentario::TIPOS_VALIDOS)) {
            $comentario->setTipo($data['tipo']);
        }

        // Validar comentario
        $errors = $this->validator->validate($comentario);
        if (count($errors) > 0) {
            return $this->json([
                'error' => 'Error de validación',
                'violations' => $this->formatValidationErrors($errors)
            ], 400);
        }

        $this->entityManager->persist($comentario);
        $this->entityManager->flush();

        // Crear notificación para el estudiante
        $this->notificacionService->crearNotificacion(
            $tfg->getEstudiante(),
            'Nuevo comentario en tu TFG',
            "Se ha añadido un comentario a tu TFG '{$tfg->getTitulo()}'",
            'info'
        );

        return $this->json($comentario, 201, [], ['groups' => ['comentario:read', 'user:basic']]);
    }

    /**
     * Validar archivo PDF subido
     */
    private function validateFile(UploadedFile $file): bool
    {
        // Validar tamaño (máximo 50MB)
        if ($file->getSize() > 50 * 1024 * 1024) {
            return false;
        }

        // Validar tipo MIME
        $allowedMimeTypes = ['application/pdf'];
        if (!in_array($file->getMimeType(), $allowedMimeTypes)) {
            return false;
        }

        // Validar extensión
        $extension = strtolower($file->getClientOriginalExtension());
        if ($extension !== 'pdf') {
            return false;
        }

        return true;
    }
}