<?php

namespace App\Controller\Api;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Controlador para endpoints públicos que necesitan los usuarios autenticados
 */
#[Route('/api/public')]
#[IsGranted('ROLE_USER')]
class PublicController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    /**
     * GET /api/public/profesores
     * Obtener lista de profesores para selección en formularios
     */
    #[Route('/profesores', name: 'api_public_profesores', methods: ['GET'])]
    public function getProfesores(): JsonResponse
    {
        $profesores = $this->userRepository->findByRole('ROLE_PROFESOR', true);

        return $this->json([
            'data' => array_map(function($profesor) {
                return [
                    'id' => $profesor->getId(),
                    'nombre' => $profesor->getNombre(),
                    'apellidos' => $profesor->getApellidos(),
                    'email' => $profesor->getEmail(),
                    'departamento' => $profesor->getDepartamento(),
                    'especialidad' => $profesor->getEspecialidad()
                ];
            }, $profesores)
        ]);
    }

    /**
     * GET /api/public/estudiantes
     * Obtener lista de estudiantes (para tribunales, etc.)
     */
    #[Route('/estudiantes', name: 'api_public_estudiantes', methods: ['GET'])]
    public function getEstudiantes(): JsonResponse
    {
        $estudiantes = $this->userRepository->findByRole('ROLE_ESTUDIANTE', true);

        return $this->json([
            'data' => array_map(function($estudiante) {
                return [
                    'id' => $estudiante->getId(),
                    'nombre' => $estudiante->getNombre(),
                    'apellidos' => $estudiante->getApellidos(),
                    'email' => $estudiante->getEmail()
                ];
            }, $estudiantes)
        ]);
    }
}