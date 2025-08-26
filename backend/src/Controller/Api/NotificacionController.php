<?php

namespace App\Controller\Api;

use App\Entity\Notificacion;
use App\Entity\User;
use App\Repository\NotificacionRepository;
use App\Service\NotificacionService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/notificaciones')]
#[IsGranted('ROLE_USER')]
class NotificacionController extends AbstractController
{
    public function __construct(
        private NotificacionRepository $notificacionRepository,
        private NotificacionService $notificacionService,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer
    ) {}

    /**
     * GET /api/notificaciones
     * Obtener notificaciones del usuario actual
     */
    #[Route('', name: 'api_notificaciones_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $page = max(1, $request->query->getInt('page', 1));
        $perPage = min(50, max(1, $request->query->getInt('per_page', 20)));
        $leida = $request->query->get('leida'); // null, 'true', 'false'
        $tipo = $request->query->get('tipo'); // info, warning, success, error

        $notificaciones = $this->notificacionRepository->findByUser($user, [
            'page' => $page,
            'per_page' => $perPage,
            'leida' => $leida === null ? null : ($leida === 'true'),
            'tipo' => $tipo
        ]);

        // Contar no leídas para el badge del frontend
        $noLeidas = $this->notificacionService->contarNoLeidas($user);

        return $this->json([
            'data' => $notificaciones['data'],
            'meta' => [
                'total' => $notificaciones['total'],
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($notificaciones['total'] / $perPage),
                'no_leidas' => $noLeidas
            ]
        ], 200, [], ['groups' => ['notificacion:read']]);
    }

    /**
     * GET /api/notificaciones/no-leidas
     * Obtener solo notificaciones no leídas (para dropdown/badge)
     */
    #[Route('/no-leidas', name: 'api_notificaciones_no_leidas', methods: ['GET'])]
    public function noLeidas(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $limite = min(20, max(1, $request->query->getInt('limite', 10)));

        $notificaciones = $this->notificacionService->getNotificacionesNoLeidas($user, $limite);
        $total = $this->notificacionService->contarNoLeidas($user);

        return $this->json([
            'data' => $notificaciones,
            'total_no_leidas' => $total,
            'hay_mas' => $total > $limite
        ], 200, [], ['groups' => ['notificacion:read']]);
    }

    /**
     * PUT /api/notificaciones/{id}/marcar-leida
     * Marcar una notificación como leída
     */
    #[Route('/{id}/marcar-leida', name: 'api_notificaciones_mark_read', methods: ['PUT'])]
    public function marcarLeida(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $notificacion = $this->notificacionRepository->find($id);
        
        if (!$notificacion) {
            return $this->json(['error' => 'Notificación no encontrada'], 404);
        }

        // Verificar que la notificación pertenece al usuario actual
        if ($notificacion->getUsuario() !== $user) {
            return $this->json(['error' => 'No tienes permiso para acceder a esta notificación'], 403);
        }

        // Marcar como leída solo si no lo está ya
        if (!$notificacion->isLeida()) {
            $this->notificacionService->marcarComoLeida($notificacion);
        }

        return $this->json([
            'id' => $notificacion->getId(),
            'leida' => true,
            'updated_at' => $notificacion->getUpdatedAt()->format('c')
        ]);
    }

    /**
     * PUT /api/notificaciones/marcar-todas-leidas
     * Marcar todas las notificaciones del usuario como leídas
     */
    #[Route('/marcar-todas-leidas', name: 'api_notificaciones_mark_all_read', methods: ['PUT'])]
    public function marcarTodasLeidas(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $actualizadas = $this->notificacionService->marcarTodasComoLeidas($user);

        return $this->json([
            'message' => 'Todas las notificaciones han sido marcadas como leídas',
            'actualizadas' => $actualizadas
        ]);
    }

    /**
     * DELETE /api/notificaciones/{id}
     * Eliminar una notificación específica
     */
    #[Route('/{id}', name: 'api_notificaciones_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $notificacion = $this->notificacionRepository->find($id);
        
        if (!$notificacion) {
            return $this->json(['error' => 'Notificación no encontrada'], 404);
        }

        // Verificar que la notificación pertenece al usuario actual
        if ($notificacion->getUsuario() !== $user) {
            return $this->json(['error' => 'No tienes permiso para eliminar esta notificación'], 403);
        }

        $this->entityManager->remove($notificacion);
        $this->entityManager->flush();

        return $this->json(['message' => 'Notificación eliminada correctamente']);
    }

    /**
     * DELETE /api/notificaciones/limpiar
     * Eliminar notificaciones antiguas del usuario
     */
    #[Route('/limpiar', name: 'api_notificaciones_cleanup', methods: ['DELETE'])]
    public function limpiar(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $tipo = $request->query->get('tipo', 'todas'); // todas, leidas, antiguas
        $diasAntiguedad = $request->query->getInt('dias', 30);

        $eliminadas = match($tipo) {
            'leidas' => $this->notificacionRepository->deleteReadByUser($user),
            'antiguas' => $this->notificacionRepository->deleteOldByUser($user, $diasAntiguedad),
            'todas' => $this->notificacionRepository->deleteAllByUser($user),
            default => 0
        };

        $mensaje = match($tipo) {
            'leidas' => 'Notificaciones leídas eliminadas',
            'antiguas' => "Notificaciones de más de {$diasAntiguedad} días eliminadas",
            'todas' => 'Todas las notificaciones eliminadas',
            default => 'Operación no válida'
        };

        return $this->json([
            'message' => $mensaje,
            'eliminadas' => $eliminadas
        ]);
    }

    /**
     * GET /api/notificaciones/estadisticas
     * Estadísticas de notificaciones del usuario
     */
    #[Route('/estadisticas', name: 'api_notificaciones_stats', methods: ['GET'])]
    public function estadisticas(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $stats = $this->notificacionRepository->getUserNotificationStats($user);

        return $this->json($stats);
    }

    /**
     * POST /api/notificaciones/test
     * Enviar notificación de prueba (solo para desarrollo/admin)
     */
    #[Route('/test', name: 'api_notificaciones_test', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function test(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $data = json_decode($request->getContent(), true);
        
        $titulo = $data['titulo'] ?? 'Notificación de Prueba';
        $mensaje = $data['mensaje'] ?? 'Esta es una notificación de prueba del sistema.';
        $tipo = $data['tipo'] ?? 'info';
        $enviarEmail = $data['enviar_email'] ?? false;

        $notificacion = $this->notificacionService->crearNotificacion(
            $user,
            $titulo,
            $mensaje,
            $tipo,
            ['tipo_evento' => 'test', 'timestamp' => time()],
            $enviarEmail
        );

        return $this->json([
            'message' => 'Notificación de prueba enviada',
            'notificacion' => $notificacion
        ], 201, [], ['groups' => ['notificacion:read']]);
    }

    /**
     * GET /api/notificaciones/tipos
     * Obtener tipos de notificaciones disponibles
     */
    #[Route('/tipos', name: 'api_notificaciones_types', methods: ['GET'])]
    public function tipos(): JsonResponse
    {
        return $this->json([
            'tipos' => [
                'info' => [
                    'label' => 'Información',
                    'color' => 'blue',
                    'icon' => 'info'
                ],
                'success' => [
                    'label' => 'Éxito',
                    'color' => 'green', 
                    'icon' => 'check'
                ],
                'warning' => [
                    'label' => 'Advertencia',
                    'color' => 'orange',
                    'icon' => 'warning'
                ],
                'error' => [
                    'label' => 'Error',
                    'color' => 'red',
                    'icon' => 'error'
                ]
            ]
        ]);
    }

    // =====================================
    // ENDPOINTS ADMINISTRATIVOS
    // =====================================

    /**
     * GET /api/notificaciones/admin/global-stats
     * Estadísticas globales de notificaciones (solo admin)
     */
    #[Route('/admin/global-stats', name: 'api_notificaciones_admin_stats', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function estadisticasGlobales(): JsonResponse
    {
        $stats = $this->notificacionRepository->getGlobalStats();

        return $this->json($stats);
    }

    /**
     * POST /api/notificaciones/admin/broadcast
     * Enviar notificación masiva (solo admin)
     */
    #[Route('/admin/broadcast', name: 'api_notificaciones_admin_broadcast', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function broadcast(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data || !isset($data['titulo']) || !isset($data['mensaje'])) {
            return $this->json(['error' => 'Título y mensaje son obligatorios'], 400);
        }

        $titulo = $data['titulo'];
        $mensaje = $data['mensaje'];
        $tipo = $data['tipo'] ?? 'info';
        $enviarEmail = $data['enviar_email'] ?? false;
        $filtroRol = $data['filtro_rol'] ?? null; // Enviar solo a usuarios con rol específico
        $soloActivos = $data['solo_activos'] ?? true;

        // Obtener usuarios destinatarios
        $usuarios = $this->entityManager->getRepository(User::class)->findAll();
        
        // Aplicar filtros
        $destinatarios = array_filter($usuarios, function(User $user) use ($filtroRol, $soloActivos) {
            if ($soloActivos && !$user->isActive()) {
                return false;
            }
            
            if ($filtroRol && !in_array($filtroRol, $user->getRoles())) {
                return false;
            }
            
            return true;
        });

        // Enviar notificaciones
        $notificaciones = $this->notificacionService->crearNotificacionMasiva(
            $destinatarios,
            $titulo,
            $mensaje,
            $tipo,
            [
                'tipo_evento' => 'broadcast',
                'enviado_por' => $this->getUser()->getId(),
                'timestamp' => time()
            ],
            $enviarEmail
        );

        return $this->json([
            'message' => 'Notificación masiva enviada',
            'destinatarios' => count($destinatarios),
            'notificaciones_creadas' => count($notificaciones)
        ]);
    }

    /**
     * GET /api/notificaciones/admin/pending-emails
     * Notificaciones pendientes de envío por email (solo admin)
     */
    #[Route('/admin/pending-emails', name: 'api_notificaciones_admin_pending_emails', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function pendingEmails(): JsonResponse
    {
        $pendientes = $this->notificacionRepository->findPendingEmails();

        return $this->json([
            'data' => $pendientes,
            'total' => count($pendientes)
        ], 200, [], ['groups' => ['notificacion:read', 'user:basic']]);
    }

    /**
     * DELETE /api/notificaciones/admin/cleanup-old
     * Limpiar notificaciones antiguas del sistema (solo admin)
     */
    #[Route('/admin/cleanup-old', name: 'api_notificaciones_admin_cleanup', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function cleanupOld(Request $request): JsonResponse
    {
        $diasAntiguedad = $request->query->getInt('dias', 90);
        
        $eliminadas = $this->notificacionService->limpiarNotificacionesAntiguas($diasAntiguedad);

        return $this->json([
            'message' => "Notificaciones de más de {$diasAntiguedad} días eliminadas",
            'eliminadas' => $eliminadas
        ]);
    }

    /**
     * GET /api/notificaciones/admin/export
     * Exportar notificaciones para análisis (solo admin)
     */
    #[Route('/admin/export', name: 'api_notificaciones_admin_export', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function export(Request $request): JsonResponse
    {
        $fechaInicio = $request->query->get('fecha_inicio');
        $fechaFin = $request->query->get('fecha_fin');
        $tipo = $request->query->get('tipo');
        $formato = $request->query->get('formato', 'json');

        try {
            $inicio = $fechaInicio ? new \DateTime($fechaInicio) : new \DateTime('-30 days');
            $fin = $fechaFin ? new \DateTime($fechaFin) : new \DateTime();
        } catch (\Exception $e) {
            return $this->json(['error' => 'Formato de fecha inválido'], 400);
        }

        $notificaciones = $this->notificacionRepository->findForExport($inicio, $fin, $tipo);

        $exportData = [];
        foreach ($notificaciones as $notif) {
            $exportData[] = [
                'ID' => $notif->getId(),
                'Usuario' => $notif->getUsuario()->getEmail(),
                'Nombre Usuario' => $notif->getUsuario()->getNombreCompleto(),
                'Tipo' => $notif->getTipo(),
                'Título' => $notif->getTitulo(),
                'Mensaje' => $notif->getMensaje(),
                'Leída' => $notif->isLeida() ? 'Sí' : 'No',
                'Email Enviado' => $notif->isEnviadaPorEmail() ? 'Sí' : 'No',
                'Fecha Creación' => $notif->getCreatedAt()->format('Y-m-d H:i:s'),
                'Metadata' => json_encode($notif->getMetadata())
            ];
        }

        return $this->json([
            'data' => $exportData,
            'total' => count($exportData),
            'periodo' => [
                'inicio' => $inicio->format('Y-m-d'),
                'fin' => $fin->format('Y-m-d')
            ],
            'formato' => $formato,
            'filename' => 'notificaciones_' . $inicio->format('Y-m-d') . '_' . $fin->format('Y-m-d') . '.' . $formato
        ]);
    }
}