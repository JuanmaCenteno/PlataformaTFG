<?php

namespace App\Controller\Api;

use App\Entity\User;
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
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/users')]
#[IsGranted('ROLE_ADMIN')]
class UserController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private UserPasswordHasherInterface $passwordHasher,
        private NotificacionService $notificacionService
    ) {}

    /**
     * GET /api/users
     * Listar todos los usuarios con filtros y paginación
     */
    #[Route('', name: 'api_users_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $perPage = min(50, max(1, $request->query->getInt('per_page', 10)));
        $role = $request->query->get('role');
        $activo = $request->query->get('activo');
        $search = $request->query->get('search');

        $usuarios = $this->userRepository->findWithFilters([
            'page' => $page,
            'per_page' => $perPage,
            'role' => $role,
            'activo' => $activo === null ? null : ($activo === 'true'),
            'search' => $search
        ]);

        return $this->json([
            'data' => $usuarios['data'],
            'meta' => [
                'total' => $usuarios['total'],
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($usuarios['total'] / $perPage)
            ],
            'filters' => [
                'roles_disponibles' => [
                    'ROLE_ESTUDIANTE' => 'Estudiante',
                    'ROLE_PROFESOR' => 'Profesor',
                    'ROLE_PRESIDENTE_TRIBUNAL' => 'Presidente Tribunal',
                    'ROLE_ADMIN' => 'Administrador'
                ]
            ]
        ], 200, [], ['groups' => ['user:read']]);
    }

    /**
     * POST /api/users
     * Crear nuevo usuario
     */
    #[Route('', name: 'api_users_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Datos JSON inválidos'], 400);
        }

        // Validar campos requeridos
        $requiredFields = ['email', 'password', 'nombre', 'apellidos', 'roles'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->json(['error' => "Campo '{$field}' requerido"], 400);
            }
        }

        // Verificar que no existe usuario con el mismo email
        $usuarioExistente = $this->userRepository->findOneBy(['email' => $data['email']]);
        if ($usuarioExistente) {
            return $this->json(['error' => 'Ya existe un usuario con este email'], 400);
        }

        // Verificar DNI único si se proporciona
        if (!empty($data['dni'])) {
            $dniExistente = $this->userRepository->findOneBy(['dni' => $data['dni']]);
            if ($dniExistente) {
                return $this->json(['error' => 'Ya existe un usuario con este DNI'], 400);
            }
        }

        // Crear usuario
        $usuario = new User();
        $usuario->setEmail($data['email']);
        $usuario->setNombre($data['nombre']);
        $usuario->setApellidos($data['apellidos']);
        $usuario->setRoles($data['roles']);

        // Campos opcionales
        if (isset($data['dni'])) $usuario->setDni($data['dni']);
        if (isset($data['telefono'])) $usuario->setTelefono($data['telefono']);
        if (isset($data['universidad'])) $usuario->setUniversidad($data['universidad']);
        if (isset($data['departamento'])) $usuario->setDepartamento($data['departamento']);
        if (isset($data['especialidad'])) $usuario->setEspecialidad($data['especialidad']);
        
        $usuario->setIsActive($data['is_active'] ?? true);

        // Hash password
        $hashedPassword = $this->passwordHasher->hashPassword($usuario, $data['password']);
        $usuario->setPassword($hashedPassword);

        // Validar entidad
        $errors = $this->validator->validate($usuario);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->persist($usuario);
        $this->entityManager->flush();

        // Notificar al nuevo usuario
        $this->notificacionService->crearNotificacion(
            $usuario,
            'Bienvenido al Sistema TFG',
            "Tu cuenta ha sido creada exitosamente. Ya puedes acceder al sistema con tu email: {$usuario->getEmail()}",
            'success',
            [
                'tipo_evento' => 'usuario_creado',
                'usuario_id' => $usuario->getId()
            ],
            true
        );

        return $this->json($usuario, 201, [], ['groups' => ['user:read']]);
    }

    /**
     * GET /api/users/{id}
     * Ver usuario específico
     */
    #[Route('/{id}', name: 'api_users_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $usuario = $this->userRepository->find($id);
        
        if (!$usuario) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Información adicional del usuario
        $estadisticas = $this->userRepository->getUserStats($usuario);

        $response = $this->serializer->serialize($usuario, 'json', ['groups' => ['user:detailed']]);
        $usuarioData = json_decode($response, true);
        $usuarioData['estadisticas'] = $estadisticas;

        return $this->json($usuarioData);
    }

    /**
     * PUT /api/users/{id}
     * Actualizar usuario
     */
    #[Route('/{id}', name: 'api_users_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $usuario = $this->userRepository->find($id);
        
        if (!$usuario) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Verificar permisos
        $this->denyAccessUnlessGranted('user_edit', $usuario);

        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Datos JSON inválidos'], 400);
        }

        // Campos actualizables
        if (isset($data['nombre'])) $usuario->setNombre($data['nombre']);
        if (isset($data['apellidos'])) $usuario->setApellidos($data['apellidos']);
        if (isset($data['telefono'])) $usuario->setTelefono($data['telefono']);
        if (isset($data['universidad'])) $usuario->setUniversidad($data['universidad']);
        if (isset($data['departamento'])) $usuario->setDepartamento($data['departamento']);
        if (isset($data['especialidad'])) $usuario->setEspecialidad($data['especialidad']);

        // Email solo si no existe otro usuario con el mismo
        if (isset($data['email']) && $data['email'] !== $usuario->getEmail()) {
            $existeEmail = $this->userRepository->findOneBy(['email' => $data['email']]);
            if ($existeEmail && $existeEmail !== $usuario) {
                return $this->json(['error' => 'Ya existe un usuario con este email'], 400);
            }
            $usuario->setEmail($data['email']);
        }

        // DNI solo si no existe otro usuario con el mismo
        if (isset($data['dni']) && $data['dni'] !== $usuario->getDni()) {
            if (!empty($data['dni'])) {
                $existeDni = $this->userRepository->findOneBy(['dni' => $data['dni']]);
                if ($existeDni && $existeDni !== $usuario) {
                    return $this->json(['error' => 'Ya existe un usuario con este DNI'], 400);
                }
            }
            $usuario->setDni($data['dni']);
        }

        // Roles (solo admin puede cambiar roles)
        if (isset($data['roles'])) {
            $usuario->setRoles($data['roles']);
        }

        // Estado activo
        if (isset($data['is_active'])) {
            $wasActive = $usuario->isActive();
            $usuario->setIsActive($data['is_active']);
            
            // Si se desactiva el usuario, notificar
            if ($wasActive && !$data['is_active']) {
                $this->notificacionService->crearNotificacion(
                    $usuario,
                    'Cuenta Desactivada',
                    'Tu cuenta ha sido desactivada. Contacta con el administrador si consideras que es un error.',
                    'warning',
                    ['tipo_evento' => 'usuario_desactivado'],
                    true
                );
            }
        }

        // Validar cambios
        $errors = $this->validator->validate($usuario);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->flush();

        return $this->json($usuario, 200, [], ['groups' => ['user:read']]);
    }

    /**
     * PUT /api/users/{id}/password
     * Cambiar contraseña de usuario
     */
    #[Route('/{id}/password', name: 'api_users_change_password', methods: ['PUT'])]
    public function changePassword(int $id, Request $request): JsonResponse
    {
        $usuario = $this->userRepository->find($id);
        
        if (!$usuario) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }

        $this->denyAccessUnlessGranted('user_change_password', $usuario);

        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['new_password'])) {
            return $this->json(['error' => 'Nueva contraseña requerida'], 400);
        }

        // Validar longitud mínima
        if (strlen($data['new_password']) < 6) {
            return $this->json(['error' => 'La contraseña debe tener al menos 6 caracteres'], 400);
        }

        // Hash nueva contraseña
        $hashedPassword = $this->passwordHasher->hashPassword($usuario, $data['new_password']);
        $usuario->setPassword($hashedPassword);

        $this->entityManager->flush();

        // Notificar al usuario
        $this->notificacionService->crearNotificacion(
            $usuario,
            'Contraseña Actualizada',
            'Tu contraseña ha sido cambiada exitosamente por un administrador.',
            'info',
            ['tipo_evento' => 'password_changed_by_admin'],
            true
        );

        return $this->json(['message' => 'Contraseña actualizada correctamente']);
    }

    /**
     * PUT /api/users/{id}/toggle-status
     * Activar/Desactivar usuario
     */
    #[Route('/{id}/toggle-status', name: 'api_users_toggle_status', methods: ['PUT'])]
    public function toggleStatus(int $id): JsonResponse
    {
        $usuario = $this->userRepository->find($id);
        
        if (!$usuario) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }

        $this->denyAccessUnlessGranted('user_toggle_status', $usuario);

        // No se puede desactivar a sí mismo
        if ($usuario === $this->getUser()) {
            return $this->json(['error' => 'No puedes desactivar tu propia cuenta'], 400);
        }

        $nuevoEstado = !$usuario->isActive();
        $usuario->setIsActive($nuevoEstado);

        $this->entityManager->flush();

        // Notificar al usuario
        $mensaje = $nuevoEstado ? 'Tu cuenta ha sido activada.' : 'Tu cuenta ha sido desactivada.';
        $tipo = $nuevoEstado ? 'success' : 'warning';

        $this->notificacionService->crearNotificacion(
            $usuario,
            'Cambio de Estado de Cuenta',
            $mensaje,
            $tipo,
            [
                'tipo_evento' => $nuevoEstado ? 'usuario_activado' : 'usuario_desactivado',
                'estado' => $nuevoEstado
            ],
            true
        );

        return $this->json([
            'id' => $usuario->getId(),
            'is_active' => $usuario->isActive(),
            'message' => $nuevoEstado ? 'Usuario activado' : 'Usuario desactivado'
        ]);
    }

    /**
     * DELETE /api/users/{id}
     * Eliminar usuario (soft delete)
     */
    #[Route('/{id}', name: 'api_users_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $usuario = $this->userRepository->find($id);
        
        if (!$usuario) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }

        $this->denyAccessUnlessGranted('user_delete', $usuario);

        // No se puede eliminar a sí mismo
        if ($usuario === $this->getUser()) {
            return $this->json(['error' => 'No puedes eliminar tu propia cuenta'], 400);
        }

        // Verificar si tiene TFGs, defensas, etc. asociados
        $conflictos = $this->userRepository->checkDeleteConflicts($usuario);
        
        if (!empty($conflictos)) {
            return $this->json([
                'error' => 'No se puede eliminar el usuario porque tiene datos asociados',
                'conflictos' => $conflictos
            ], 400);
        }

        // Soft delete - desactivar en lugar de eliminar
        $usuario->setIsActive(false);
        $usuario->setEmail($usuario->getEmail() . '_deleted_' . time());
        
        $this->entityManager->flush();

        return $this->json(['message' => 'Usuario eliminado correctamente']);
    }

    /**
     * GET /api/users/estadisticas
     * Estadísticas generales de usuarios
     */
    #[Route('/estadisticas', name: 'api_users_stats', methods: ['GET'])]
    public function estadisticas(): JsonResponse
    {
        $stats = $this->userRepository->getGeneralStats();
        
        return $this->json($stats);
    }

    /**
     * POST /api/users/bulk-action
     * Acciones en lote sobre usuarios
     */
    #[Route('/bulk-action', name: 'api_users_bulk_action', methods: ['POST'])]
    public function bulkAction(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['action']) || !isset($data['user_ids'])) {
            return $this->json(['error' => 'Acción y IDs de usuarios requeridos'], 400);
        }

        $action = $data['action'];
        $userIds = $data['user_ids'];
        $currentUser = $this->getUser();

        if (empty($userIds)) {
            return $this->json(['error' => 'No se seleccionaron usuarios'], 400);
        }

        $usuarios = $this->userRepository->findBy(['id' => $userIds]);
        $results = [];

        foreach ($usuarios as $usuario) {
            // No permitir acciones sobre uno mismo
            if ($usuario === $currentUser) {
                $results[] = [
                    'id' => $usuario->getId(),
                    'success' => false,
                    'message' => 'No puedes realizar acciones sobre tu propia cuenta'
                ];
                continue;
            }

            try {
                switch ($action) {
                    case 'activate':
                        $usuario->setIsActive(true);
                        $message = 'Usuario activado';
                        break;
                        
                    case 'deactivate':
                        $usuario->setIsActive(false);
                        $message = 'Usuario desactivado';
                        break;
                        
                    case 'reset_password':
                        $newPassword = 'temporal' . rand(1000, 9999);
                        $hashedPassword = $this->passwordHasher->hashPassword($usuario, $newPassword);
                        $usuario->setPassword($hashedPassword);
                        $message = "Contraseña restablecida: {$newPassword}";
                        
                        // Notificar nueva contraseña
                        $this->notificacionService->crearNotificacion(
                            $usuario,
                            'Contraseña Restablecida',
                            "Tu contraseña temporal es: {$newPassword}. Por favor, cámbiala al iniciar sesión.",
                            'warning',
                            ['tipo_evento' => 'password_reset'],
                            true
                        );
                        break;
                        
                    default:
                        $results[] = [
                            'id' => $usuario->getId(),
                            'success' => false,
                            'message' => 'Acción no válida'
                        ];
                        continue 2;
                }

                $results[] = [
                    'id' => $usuario->getId(),
                    'success' => true,
                    'message' => $message
                ];

            } catch (\Exception $e) {
                $results[] = [
                    'id' => $usuario->getId(),
                    'success' => false,
                    'message' => 'Error: ' . $e->getMessage()
                ];
            }
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Acción en lote completada',
            'results' => $results,
            'processed' => count($results),
            'successful' => count(array_filter($results, fn($r) => $r['success']))
        ]);
    }

    /**
     * GET /api/users/export
     * Exportar usuarios a CSV/Excel
     */
    #[Route('/export', name: 'api_users_export', methods: ['GET'])]
    public function export(Request $request): JsonResponse
    {
        $format = $request->query->get('format', 'csv');
        $filters = [
            'role' => $request->query->get('role'),
            'activo' => $request->query->get('activo'),
            'search' => $request->query->get('search')
        ];

        $usuarios = $this->userRepository->findForExport($filters);
        
        // Preparar datos para export
        $exportData = [];
        foreach ($usuarios as $usuario) {
            $exportData[] = [
                'ID' => $usuario->getId(),
                'Email' => $usuario->getEmail(),
                'Nombre Completo' => $usuario->getNombreCompleto(),
                'DNI' => $usuario->getDni(),
                'Teléfono' => $usuario->getTelefono(),
                'Universidad' => $usuario->getUniversidad(),
                'Departamento' => $usuario->getDepartamento(),
                'Especialidad' => $usuario->getEspecialidad(),
                'Roles' => implode(', ', $usuario->getRoles()),
                'Estado' => $usuario->isActive() ? 'Activo' : 'Inactivo',
                'Fecha Creación' => $usuario->getCreatedAt()?->format('Y-m-d H:i:s')
            ];
        }

        return $this->json([
            'data' => $exportData,
            'total' => count($exportData),
            'format' => $format,
            'filename' => 'usuarios_' . date('Y-m-d_H-i-s') . '.' . $format
        ]);
    }
}