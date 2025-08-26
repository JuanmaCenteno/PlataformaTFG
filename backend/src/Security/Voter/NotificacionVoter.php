<?php

namespace App\Security\Voter;

use App\Entity\Notificacion;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class NotificacionVoter extends Voter
{
    // Permisos soportados
    public const VIEW = 'notificacion_view';
    public const EDIT = 'notificacion_edit';
    public const DELETE = 'notificacion_delete';
    public const MARK_READ = 'notificacion_mark_read';
    public const BROADCAST = 'notificacion_broadcast';
    public const VIEW_GLOBAL_STATS = 'notificacion_view_global_stats';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [
            self::VIEW,
            self::EDIT,
            self::DELETE,
            self::MARK_READ,
            self::BROADCAST,
            self::VIEW_GLOBAL_STATS
        ]) && ($subject instanceof Notificacion || $subject === null);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        
        // El usuario debe estar autenticado
        if (!$user instanceof User) {
            return false;
        }

        return match($attribute) {
            self::VIEW => $this->canView($subject, $user),
            self::EDIT => $this->canEdit($subject, $user),
            self::DELETE => $this->canDelete($subject, $user),
            self::MARK_READ => $this->canMarkRead($subject, $user),
            self::BROADCAST => $this->canBroadcast($user),
            self::VIEW_GLOBAL_STATS => $this->canViewGlobalStats($user),
            default => false,
        };
    }

    /**
     * ¿Puede ver esta notificación?
     */
    private function canView(?Notificacion $notificacion, User $user): bool
    {
        // Si no hay notificación específica, verificar si puede ver notificaciones en general
        if ($notificacion === null) {
            return true; // Cualquier usuario autenticado puede ver sus notificaciones
        }

        $roles = $user->getRoles();

        // Admin puede ver cualquier notificación
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // El usuario solo puede ver sus propias notificaciones
        return $notificacion->getUsuario() === $user;
    }

    /**
     * ¿Puede editar esta notificación?
     */
    private function canEdit(?Notificacion $notificacion, User $user): bool
    {
        if ($notificacion === null) {
            return false;
        }

        $roles = $user->getRoles();

        // Solo admin puede editar notificaciones
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Los usuarios normalmente no pueden editar notificaciones
        // Solo pueden marcarlas como leídas o eliminarlas
        return false;
    }

    /**
     * ¿Puede eliminar esta notificación?
     */
    private function canDelete(?Notificacion $notificacion, User $user): bool
    {
        if ($notificacion === null) {
            return false;
        }

        $roles = $user->getRoles();

        // Admin puede eliminar cualquier notificación
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // El usuario puede eliminar sus propias notificaciones
        return $notificacion->getUsuario() === $user;
    }

    /**
     * ¿Puede marcar como leída esta notificación?
     */
    private function canMarkRead(?Notificacion $notificacion, User $user): bool
    {
        if ($notificacion === null) {
            return false;
        }

        $roles = $user->getRoles();

        // Admin puede marcar cualquier notificación
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // El usuario puede marcar sus propias notificaciones
        return $notificacion->getUsuario() === $user;
    }

    /**
     * ¿Puede enviar notificaciones masivas?
     */
    private function canBroadcast(User $user): bool
    {
        $roles = $user->getRoles();

        // Solo admin puede enviar notificaciones masivas
        return in_array('ROLE_ADMIN', $roles);
    }

    /**
     * ¿Puede ver estadísticas globales?
     */
    private function canViewGlobalStats(User $user): bool
    {
        $roles = $user->getRoles();

        // Solo admin puede ver estadísticas globales
        return in_array('ROLE_ADMIN', $roles);
    }

    /**
     * Verifica permisos específicos por contexto
     */
    public function canUserPerformAction(?Notificacion $notificacion, User $user, string $action): bool
    {
        $roles = $user->getRoles();

        // Admin siempre puede realizar acciones administrativas
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        return match($action) {
            // Acciones que cualquier usuario puede hacer con sus propias notificaciones
            'view_own' => $notificacion === null || $notificacion->getUsuario() === $user,
            'mark_own_read' => $notificacion && $notificacion->getUsuario() === $user,
            'delete_own' => $notificacion && $notificacion->getUsuario() === $user,
            'cleanup_own' => true, // Cualquier usuario puede limpiar sus notificaciones
            
            // Acciones que solo admin puede hacer
            'broadcast' => in_array('ROLE_ADMIN', $roles),
            'view_global_stats' => in_array('ROLE_ADMIN', $roles),
            'cleanup_system' => in_array('ROLE_ADMIN', $roles),
            'export_data' => in_array('ROLE_ADMIN', $roles),
            'manage_email_queue' => in_array('ROLE_ADMIN', $roles),
            
            default => false,
        };
    }

    /**
     * Verifica si el usuario puede ver notificaciones de un tipo específico
     */
    public function canViewNotificationType(User $user, string $tipo): bool
    {
        $roles = $user->getRoles();

        // Admin puede ver notificaciones de cualquier tipo
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Tipos de notificaciones restringidas por rol
        $restrictedTypes = [
            'sistema' => ['ROLE_ADMIN'],
            'mantenimiento' => ['ROLE_ADMIN'],
            'auditoria' => ['ROLE_ADMIN']
        ];

        if (isset($restrictedTypes[$tipo])) {
            return !empty(array_intersect($roles, $restrictedTypes[$tipo]));
        }

        // Otros tipos de notificaciones pueden ser vistas por cualquier usuario
        return true;
    }

    /**
     * Determina qué acciones puede realizar el usuario
     */
    public function getAvailableActions(User $user, ?Notificacion $notificacion = null): array
    {
        $roles = $user->getRoles();
        $actions = [];

        // Acciones básicas para usuarios normales
        $actions[] = 'view_own_notifications';
        $actions[] = 'mark_own_read';
        $actions[] = 'delete_own';
        $actions[] = 'cleanup_own';

        // Acciones adicionales para admin
        if (in_array('ROLE_ADMIN', $roles)) {
            $actions = array_merge($actions, [
                'view_all_notifications',
                'broadcast',
                'view_global_stats',
                'cleanup_system',
                'export_data',
                'manage_email_queue',
                'edit_notifications',
                'delete_any'
            ]);
        }

        // Acciones específicas para profesores/presidentes
        if (in_array('ROLE_PROFESOR', $roles) || in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            // Los profesores podrían tener acciones específicas en el futuro
            // Por ejemplo, enviar notificaciones a sus estudiantes
        }

        return $actions;
    }

    /**
     * Verifica límites de notificaciones por usuario
     */
    public function canCreateMoreNotifications(User $user): bool
    {
        $roles = $user->getRoles();

        // Admin no tiene límites
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Los usuarios normales no pueden crear notificaciones directamente
        // Solo reciben notificaciones del sistema
        return false;
    }

    /**
     * Verifica si puede acceder a notificaciones por email
     */
    public function canAccessEmailNotifications(User $user): bool
    {
        // Cualquier usuario con email válido puede recibir notificaciones por email
        return !empty($user->getEmail()) && $user->isActive();
    }

    /**
     * Determina la prioridad de notificaciones que puede ver
     */
    public function getMaxNotificationPriority(User $user): int
    {
        $roles = $user->getRoles();

        // Niveles de prioridad:
        // 1 = Normal, 2 = Alta, 3 = Crítica, 4 = Sistema
        return match(true) {
            in_array('ROLE_ADMIN', $roles) => 4,
            in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles) => 3,
            in_array('ROLE_PROFESOR', $roles) => 2,
            default => 1
        };
    }
}