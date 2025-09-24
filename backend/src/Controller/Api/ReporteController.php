<?php

namespace App\Controller\Api;

use App\Repository\TFGRepository;
use App\Repository\UserRepository;
use App\Repository\DefensaRepository;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/reportes')]
#[IsGranted('ROLE_ADMIN')]
class ReporteController extends AbstractController
{
    public function __construct(
        private TFGRepository $tfgRepository,
        private UserRepository $userRepository,
        private DefensaRepository $defensaRepository,
        private EntityManagerInterface $entityManager
    ) {}

    /**
     * GET /api/reportes/estadisticas
     * Estadísticas generales del sistema
     */
    #[Route('/estadisticas', name: 'api_reportes_estadisticas', methods: ['GET'])]
    public function estadisticas(): JsonResponse
    {
        // Estadísticas de TFGs por estado
        $tfgsPorEstado = $this->tfgRepository->getEstadisticasPorEstado();

        // Estadísticas de usuarios por role
        $usuariosPorRol = $this->userRepository->getEstadisticasPorRol();

        // Estadísticas de defensas
        $defensasStats = $this->defensaRepository->getEstadisticasDefensas();

        // Estadísticas generales
        $totalTFGs = $this->tfgRepository->count([]);
        $totalUsuarios = $this->userRepository->count([]);
        $totalDefensas = $this->defensaRepository->count([]);

        // TFGs por área (si tienes campo área/categoría)
        $tfgsPorArea = $this->tfgRepository->getEstadisticasPorArea();

        return $this->json([
            'resumen' => [
                'total_tfgs' => $totalTFGs,
                'total_usuarios' => $totalUsuarios,
                'total_defensas' => $totalDefensas,
                'tfgs_pendientes' => $tfgsPorEstado['en_revision'] ?? 0,
                'tfgs_completados' => $tfgsPorEstado['defendido'] ?? 0
            ],
            'tfgs_por_estado' => $tfgsPorEstado,
            'usuarios_por_rol' => $usuariosPorRol,
            'defensas_estadisticas' => $defensasStats,
            'tfgs_por_area' => $tfgsPorArea,
            'fecha_generacion' => new \DateTime()
        ]);
    }

    /**
     * GET /api/reportes/tfgs-por-estado
     * Reporte detallado de TFGs por estado
     */
    #[Route('/tfgs-por-estado', name: 'api_reportes_tfgs_por_estado', methods: ['GET'])]
    public function tfgsPorEstado(): JsonResponse
    {
        $estadisticas = $this->tfgRepository->getEstadisticasPorEstado();

        return $this->json([
            'data' => $estadisticas,
            'total' => array_sum($estadisticas),
            'fecha_generacion' => new \DateTime()
        ]);
    }

    /**
     * GET /api/reportes/tfgs-por-area
     * Reporte de TFGs por área de conocimiento
     */
    #[Route('/tfgs-por-area', name: 'api_reportes_tfgs_por_area', methods: ['GET'])]
    public function tfgsPorArea(): JsonResponse
    {
        $estadisticas = $this->tfgRepository->getEstadisticasPorArea();

        return $this->json([
            'data' => $estadisticas,
            'total' => array_sum($estadisticas),
            'fecha_generacion' => new \DateTime()
        ]);
    }

    /**
     * GET /api/reportes/export/pdf/{tipo}
     * Exportar reporte en PDF
     */
    #[Route('/export/pdf/{tipo}', name: 'api_reportes_export_pdf', methods: ['GET'])]
    public function exportPDF(string $tipo): Response
    {
        // Implementación básica - en producción usarías una librería como DOMPDF o TCPDF
        $data = match($tipo) {
            'estadisticas' => $this->getEstadisticasData(),
            'tfgs-estado' => $this->tfgRepository->getEstadisticasPorEstado(),
            'tfgs-area' => $this->tfgRepository->getEstadisticasPorArea(),
            default => []
        };

        // Por ahora devolver como JSON, luego implementar PDF real
        $response = new JsonResponse([
            'mensaje' => 'Exportación PDF no implementada aún',
            'tipo' => $tipo,
            'data' => $data
        ]);

        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * GET /api/reportes/export/excel/{tipo}
     * Exportar reporte en Excel
     */
    #[Route('/export/excel/{tipo}', name: 'api_reportes_export_excel', methods: ['GET'])]
    public function exportExcel(string $tipo): Response
    {
        // Implementación básica - en producción usarías PhpSpreadsheet
        $data = match($tipo) {
            'estadisticas' => $this->getEstadisticasData(),
            'tfgs-estado' => $this->tfgRepository->getEstadisticasPorEstado(),
            'tfgs-area' => $this->tfgRepository->getEstadisticasPorArea(),
            default => []
        };

        // Por ahora devolver como JSON, luego implementar Excel real
        $response = new JsonResponse([
            'mensaje' => 'Exportación Excel no implementada aún',
            'tipo' => $tipo,
            'data' => $data
        ]);

        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    private function getEstadisticasData(): array
    {
        return [
            'tfgs_por_estado' => $this->tfgRepository->getEstadisticasPorEstado(),
            'usuarios_por_rol' => $this->userRepository->getEstadisticasPorRol(),
            'defensas_estadisticas' => $this->defensaRepository->getEstadisticasDefensas(),
            'tfgs_por_area' => $this->tfgRepository->getEstadisticasPorArea()
        ];
    }
}