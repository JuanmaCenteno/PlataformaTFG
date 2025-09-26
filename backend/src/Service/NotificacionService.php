<?php

namespace App\Service;

use App\Entity\Notificacion;
use App\Entity\User;
use App\Repository\NotificacionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Psr\Log\LoggerInterface;

class NotificacionService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private NotificacionRepository $notificacionRepository,
        private MailerInterface $mailer,
        private MessageBusInterface $messageBus,
        private LoggerInterface $logger,
        private string $appName = 'TFG Platform',
        private string $fromEmail = 'noreply@tfg-platform.com'
    ) {}

    /**
     * Crear una notificación en el sistema
     */
    public function crearNotificacion(
        User $usuario,
        string $titulo,
        string $mensaje,
        string $tipo = 'info',
        ?array $metadata = null,
        bool $enviarEmail = false
    ): Notificacion {
        try {
            $notificacion = new Notificacion();
            $notificacion->setUsuario($usuario);
            $notificacion->setTitulo($titulo);
            $notificacion->setMensaje($mensaje);
            $notificacion->setTipo($tipo);
            $notificacion->setMetadata($metadata ?? []);
            $notificacion->setEnviadaPorEmail($enviarEmail);

            $this->entityManager->persist($notificacion);
            $this->entityManager->flush();

            // Si se requiere envío por email, programarlo
            if ($enviarEmail && $usuario->getEmail()) {
                $this->enviarNotificacionPorEmail($notificacion);
            }

            $this->logger->info('Notificación creada', [
                'usuario_id' => $usuario->getId(),
                'tipo' => $tipo,
                'titulo' => $titulo
            ]);

            return $notificacion;

        } catch (\Exception $e) {
            $this->logger->error('Error creando notificación', [
                'error' => $e->getMessage(),
                'usuario_id' => $usuario->getId(),
                'titulo' => $titulo
            ]);
            throw $e;
        }
    }

    /**
     * Crear notificación masiva para múltiples usuarios
     */
    public function crearNotificacionMasiva(
        array $usuarios,
        string $titulo,
        string $mensaje,
        string $tipo = 'info',
        ?array $metadata = null,
        bool $enviarEmail = false
    ): array {
        $notificaciones = [];

        foreach ($usuarios as $usuario) {
            if ($usuario instanceof User) {
                $notificaciones[] = $this->crearNotificacion(
                    $usuario,
                    $titulo,
                    $mensaje,
                    $tipo,
                    $metadata,
                    $enviarEmail
                );
            }
        }

        return $notificaciones;
    }

    /**
     * Enviar notificación por email
     */
    public function enviarNotificacionPorEmail(Notificacion $notificacion): void
    {
        try {
            $usuario = $notificacion->getUsuario();
            
            if (!$usuario->getEmail()) {
                $this->logger->warning('Usuario sin email para notificación', [
                    'notificacion_id' => $notificacion->getId(),
                    'usuario_id' => $usuario->getId()
                ]);
                return;
            }

            $email = (new TemplatedEmail())
                ->from($this->fromEmail)
                ->to($usuario->getEmail())
                ->subject($this->appName . ' - ' . $notificacion->getTitulo())
                ->htmlTemplate('emails/notificacion.html.twig')
                ->context([
                    'usuario' => $usuario,
                    'notificacion' => $notificacion,
                    'app_name' => $this->appName
                ]);

            $this->mailer->send($email);

            // Marcar como enviada por email
            $notificacion->setEnviadaPorEmail(true);
            $this->entityManager->flush();

            $this->logger->info('Email de notificación enviado', [
                'notificacion_id' => $notificacion->getId(),
                'email' => $usuario->getEmail()
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error enviando email de notificación', [
                'error' => $e->getMessage(),
                'notificacion_id' => $notificacion->getId()
            ]);
        }
    }

    /**
     * Marcar notificación como leída
     */
    public function marcarComoLeida(Notificacion $notificacion): void
    {
        if (!$notificacion->isLeida()) {
            $notificacion->setLeida(true);
            $this->entityManager->flush();
        }
    }

    /**
     * Marcar todas las notificaciones de un usuario como leídas
     */
    public function marcarTodasComoLeidas(User $usuario): int
    {
        return $this->notificacionRepository->marcarTodasComoLeidas($usuario);
    }

    /**
     * Obtener notificaciones no leídas de un usuario
     */
    public function getNotificacionesNoLeidas(User $usuario, int $limite = 10): array
    {
        return $this->notificacionRepository->findNoLeidas($usuario, $limite);
    }

    /**
     * Contar notificaciones no leídas
     */
    public function contarNoLeidas(User $usuario): int
    {
        return $this->notificacionRepository->countNoLeidas($usuario);
    }

    /**
     * Obtener notificaciones paginadas de un usuario
     */
    public function getNotificacionesPaginadas(User $usuario, int $page = 1, int $perPage = 10): array
    {
        return $this->notificacionRepository->findPaginatedByUser($usuario, $page, $perPage);
    }

    /**
     * Eliminar notificaciones antiguas
     */
    public function limpiarNotificacionesAntiguas(int $diasAntiguedad = 90): int
    {
        $fecha = new \DateTime("-{$diasAntiguedad} days");
        return $this->notificacionRepository->deleteOlderThan($fecha);
    }

    // =====================================
    // MÉTODOS ESPECÍFICOS PARA TFG
    // =====================================

    /**
     * Notificación cuando se sube un TFG
     */
    public function notificarTfgSubido(User $estudiante, User $tutor, string $tituloTfg): void
    {
        $this->crearNotificacion(
            $tutor,
            'Nuevo TFG asignado',
            "El estudiante {$estudiante->getNombreCompleto()} ha subido el TFG '{$tituloTfg}' y necesita tu revisión.",
            'info',
            [
                'tipo_evento' => 'tfg_subido',
                'estudiante_id' => $estudiante->getId(),
                'titulo_tfg' => $tituloTfg
            ],
            true
        );
    }

    /**
     * Notificación cuando se aprueba un TFG
     */
    public function notificarTfgAprobado(User $estudiante, string $tituloTfg, ?string $comentario = null): void
    {
        $mensaje = "¡Felicidades! Tu TFG '{$tituloTfg}' ha sido aprobado para defensa.";
        if ($comentario) {
            $mensaje .= "\n\nComentario del tutor: {$comentario}";
        }

        $this->crearNotificacion(
            $estudiante,
            'TFG Aprobado para Defensa',
            $mensaje,
            'success',
            [
                'tipo_evento' => 'tfg_aprobado',
                'titulo_tfg' => $tituloTfg,
                'comentario' => $comentario
            ],
            true
        );
    }

    /**
     * Notificación cuando se programa una defensa
     */
    public function notificarDefensaProgramada(
        User $estudiante,
        string $tituloTfg,
        \DateTimeInterface $fechaDefensa,
        string $aula,
        array $tribunal
    ): void {
        $this->crearNotificacion(
            $estudiante,
            'Defensa Programada',
            "Tu defensa del TFG '{$tituloTfg}' ha sido programada para el " . 
            $fechaDefensa->format('d/m/Y \a \l\a\s H:i') . " en {$aula}.",
            'success',
            [
                'tipo_evento' => 'defensa_programada',
                'titulo_tfg' => $tituloTfg,
                'fecha_defensa' => $fechaDefensa->format('c'),
                'aula' => $aula,
                'tribunal' => $tribunal
            ],
            true
        );

        // Notificar también al tribunal
        foreach ($tribunal as $miembro) {
            if ($miembro instanceof User) {
                $this->crearNotificacion(
                    $miembro,
                    'Defensa Asignada',
                    "Se te ha asignado la defensa del TFG '{$tituloTfg}' de {$estudiante->getNombreCompleto()} " .
                    "programada para el " . $fechaDefensa->format('d/m/Y \a \l\a\s H:i') . " en {$aula}.",
                    'info',
                    [
                        'tipo_evento' => 'defensa_asignada',
                        'titulo_tfg' => $tituloTfg,
                        'estudiante_id' => $estudiante->getId(),
                        'fecha_defensa' => $fechaDefensa->format('c'),
                        'aula' => $aula
                    ],
                    true
                );
            }
        }
    }

    /**
     * Recordatorio de defensa (24h antes)
     */
    public function enviarRecordatorioDefensa(User $usuario, string $tituloTfg, \DateTimeInterface $fechaDefensa, string $aula): void
    {
        $this->crearNotificacion(
            $usuario,
            'Recordatorio: Defensa Mañana',
            "Recordatorio: La defensa del TFG '{$tituloTfg}' está programada para mañana " .
            $fechaDefensa->format('d/m/Y \a \l\a\s H:i') . " en {$aula}.",
            'warning',
            [
                'tipo_evento' => 'recordatorio_defensa',
                'titulo_tfg' => $tituloTfg,
                'fecha_defensa' => $fechaDefensa->format('c'),
                'aula' => $aula
            ],
            true
        );
    }

    /**
     * Notificación de calificación publicada
     */
    public function notificarCalificacionPublicada(User $estudiante, string $tituloTfg, float $calificacion): void
    {
        $this->crearNotificacion(
            $estudiante,
            'Calificación Publicada',
            "La calificación de tu TFG '{$tituloTfg}' ya está disponible: {$calificacion}/10",
            'success',
            [
                'tipo_evento' => 'calificacion_publicada',
                'titulo_tfg' => $tituloTfg,
                'calificacion' => $calificacion
            ],
            true
        );
    }

    /**
     * Notificación cuando se genera el acta de defensa
     */
    public function notificarActaGenerada(User $estudiante, string $tituloTfg): void
    {
        $this->crearNotificacion(
            $estudiante,
            'Acta de Defensa Disponible',
            "El acta de defensa de tu TFG '{$tituloTfg}' ya está disponible para descarga.",
            'success',
            [
                'tipo_evento' => 'acta_generada',
                'titulo_tfg' => $tituloTfg
            ],
            true
        );
    }

    /**
     * Notificación cuando se solicitan cambios
     */
    public function notificarCambiosSolicitados(User $estudiante, string $tituloTfg, string $comentario): void
    {
        $this->crearNotificacion(
            $estudiante,
            'Cambios Solicitados en TFG',
            "Tu tutor ha solicitado cambios en el TFG '{$tituloTfg}'. Revisa los comentarios y realiza las modificaciones necesarias.\n\nComentario: {$comentario}",
            'warning',
            [
                'tipo_evento' => 'cambios_solicitados',
                'titulo_tfg' => $tituloTfg,
                'comentario' => $comentario
            ],
            true
        );
    }
}