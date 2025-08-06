<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Gesdinet\JWTRefreshTokenBundle\Service\RefreshToken;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;

#[Route('/api/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager
    ) {}

    /**
     * Login endpoint - maneja la autenticación JWT automáticamente
     */
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json([
                'message' => 'Credenciales inválidas',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->isActive()) {
            return $this->json([
                'message' => 'Usuario desactivado',
            ], Response::HTTP_FORBIDDEN);
        }

        // El token JWT se genera automáticamente por LexikJWTAuthenticationBundle
        // Este método se ejecuta después del éxito de la autenticación
        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'nombre' => $user->getNombre(),
                'apellidos' => $user->getApellidos(),
                'roles' => $user->getRoles(),
                'nombreCompleto' => $user->getNombreCompleto(),
            ],
            'message' => 'Autenticación exitosa',
        ]);
    }

    /**
     * Obtener información del usuario actual
     */
    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'nombre' => $user->getNombre(),
                'apellidos' => $user->getApellidos(),
                'dni' => $user->getDni(),
                'telefono' => $user->getTelefono(),
                'universidad' => $user->getUniversidad(),
                'departamento' => $user->getDepartamento(),
                'especialidad' => $user->getEspecialidad(),
                'roles' => $user->getRoles(),
                'nombreCompleto' => $user->getNombreCompleto(),
                'isActive' => $user->isActive(),
                'createdAt' => $user->getCreatedAt()?->format('Y-m-d\TH:i:s\Z'),
            ]
        ]);
    }

    /**
     * Cambiar contraseña
     */
    #[Route('/change-password', name: 'change_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
            return $this->json([
                'message' => 'Faltan datos requeridos'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Verificar contraseña actual
        if (!$this->passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
            return $this->json([
                'message' => 'Contraseña actual incorrecta'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validar nueva contraseña
        if (strlen($data['newPassword']) < 6) {
            return $this->json([
                'message' => 'La nueva contraseña debe tener al menos 6 caracteres'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Cambiar contraseña
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['newPassword']);
        $user->setPassword($hashedPassword);
        
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Contraseña actualizada correctamente'
        ]);
    }

    /**
     * Actualizar perfil del usuario
     */
    #[Route('/profile', name: 'update_profile', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        // Campos que el usuario puede actualizar
        $allowedFields = ['nombre', 'apellidos', 'telefono', 'universidad', 'departamento', 'especialidad'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $setter = 'set' . ucfirst($field);
                if (method_exists($user, $setter)) {
                    $user->$setter($data[$field]);
                }
            }
        }

        // Validar campos requeridos
        if (empty($user->getNombre()) || empty($user->getApellidos())) {
            return $this->json([
                'message' => 'Nombre y apellidos son obligatorios'
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'nombre' => $user->getNombre(),
                'apellidos' => $user->getApellidos(),
                'dni' => $user->getDni(),
                'telefono' => $user->getTelefono(),
                'universidad' => $user->getUniversidad(),
                'departamento' => $user->getDepartamento(),
                'especialidad' => $user->getEspecialidad(),
                'nombreCompleto' => $user->getNombreCompleto(),
            ]
        ]);
    }

    /**
     * Logout (invalidar token - opcional)
     */
    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // Con JWT stateless, el logout se maneja en el frontend
        // eliminando el token del storage local
        return $this->json([
            'message' => 'Logout exitoso'
        ]);
    }

    /**
     * Validar token (útil para verificar si el token sigue siendo válido)
     */
    #[Route('/validate', name: 'validate', methods: ['GET'])]
    public function validateToken(): JsonResponse
    {
        // Si llegamos aquí, el token es válido (middleware JWT ya lo validó)
        /** @var User $user */
        $user = $this->getUser();

        if (!$user->isActive()) {
            return $this->json([
                'message' => 'Usuario desactivado',
                'valid' => false
            ], Response::HTTP_FORBIDDEN);
        }

        return $this->json([
            'valid' => true,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'nombreCompleto' => $user->getNombreCompleto(),
            ]
        ]);
    }
}