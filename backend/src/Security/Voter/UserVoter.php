<?php

namespace App\Security\Voter;

use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class UserVoter extends Voter
{
    // Permisos soportados
    public const VIEW = 'user_view';
    public const EDIT = 'user_edit';
    public const DELETE = 'user_delete';
    public const CHANGE_PASSWORD = 'user_change_password';
    public const TOGGLE_STATUS = 'user_toggle_status';
    public const MANAGE_ROLES = 'user_manage_roles';
    public const VIEW_STATS = 'user_view_stats';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [
            self::VIEW,
            self::EDIT,
            self::DELETE,
            self::CHANGE_PASSWORD,
            self::TOGGLE_STATUS,
            self::MANAGE_ROLES,
            self::VIEW_STATS
        ]) && $subject instanceof User;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        
        // El usuario debe estar autenticado
        if (!$user instanceof User) {
            return false;
        }

        /** @var User $targetUser */
        $targetUser = $subject;

        return match($attribute) {
            self::VIEW => $this->canView($targetUser, $user),
            self::EDIT => $this->canEdit($targetUser, $user),
            self::DELETE => $this->canDelete($targetUser, $user),
            self::CHANGE_PASSWORD => $this->canChangePassword($targetUser, $user),
            self::TOGGLE_STATUS => $this->canToggleStatus($targetUser, $user),
            self::MANAGE_ROLES => $this->canManageRoles($targetUser, $user),
            self::VIEW_STATS => $this->canViewStats($targetUser, $user),
            default => false,
        };
    }

    /**
     * ¿Puede ver este usuario?
     */
    private function canView(User $targetUser, User $currentUser): bool
    {
        $roles = $currentUser->getRoles();

        // Admin puede ver cualquier usuario
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Usuarios pueden ver su propio perfil
        if ($targetUser === $currentUser) {
            return true;
        }

        // Profesores pueden ver información básica de estudiantes en sus TFGs
        if (in_array('ROLE_PROFESOR', $roles) || in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            return $this->isRelatedStudent($targetUser, $currentUser);
        }

        return false;
    }

    /**
     * ¿Puede editar este usuario?
     */
    private function canEdit(User $targetUser, User $currentUser): bool
    {
        $roles = $currentUser->getRoles();

        // Admin puede editar cualquier usuario
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Usuarios pueden editar su propio perfil (campos limitados)
        if ($targetUser === $currentUser) {
            return true;
        }

        return false;
    }

    /**
     * ¿Puede eliminar este usuario?
     */
    private function canDelete(User $targetUser, User $currentUser): bool
    {
        $roles = $currentUser->getRoles();

        // Solo admin puede eliminar usuarios
        if (!in_array('ROLE_ADMIN', $roles)) {
            return false;
        }

        // No puede eliminarse a sí mismo
        if ($targetUser === $currentUser) {
            return false;
        }

        // No puede eliminar otros admins (protección adicional)
        if (in_array('ROLE_ADMIN', $targetUser->getRoles())) {
            return false;
        }

        return true;
    }

    /**
     * ¿Puede cambiar la contraseña de este usuario?
     */
    private function canChangePassword(User $targetUser, User $currentUser): bool
    {
        $roles = $currentUser->getRoles();

        // Admin puede cambiar cualquier contraseña
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Usuarios pueden cambiar su propia contraseña
        if ($targetUser === $currentUser) {
            return true;
        }

        return false;
    }

    /**
     * ¿Puede activar/desactivar este usuario?
     */
    private function canToggleStatus(User $targetUser, User $currentUser): bool
    {
        $roles = $currentUser->getRoles();

        // Solo admin puede cambiar estados
        if (!in_array('ROLE_ADMIN', $roles)) {
            return false;
        }

        // No puede cambiar su propio estado
        if ($targetUser === $currentUser) {
            return false;
        }

        return true;
    }

    /**
     * ¿Puede gestionar los roles de este usuario?
     */
    private function canManageRoles(User $targetUser, User $currentUser): bool
    {
        $roles = $currentUser->getRoles();

        // Solo admin puede gestionar roles
        if (!in_array('ROLE_ADMIN', $roles)) {
            return false;
        }

        // No puede cambiar sus propios roles (por seguridad)
        if ($targetUser === $currentUser) {
            return false;
        }

        return true;
    }

    /**
     * ¿Puede ver estadísticas detalladas de este usuario?
     */
    private function canViewStats(User $targetUser, User $currentUser): bool
    {
        $roles = $currentUser->getRoles();

        // Admin puede ver estadísticas de cualquier usuario
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Usuarios pueden ver sus propias estadísticas
        if ($targetUser === $currentUser) {
            return true;
        }

        // Profesores pueden ver estadísticas básicas de sus estudiantes
        if (in_array('ROLE_PROFESOR', $roles) || in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            return $this->isRelatedStudent($targetUser, $currentUser);
        }

        return false;
    }

    /**
     * Verifica si el target user es un estudiante relacionado con el current user
     */
    private function isRelatedStudent(User $targetUser, User $currentUser): bool
    {
        // Solo si el target es estudiante
        if (!in_array('ROLE_ESTUDIANTE', $targetUser->getRoles())) {
            return false;
        }

        // Esta lógica debería consultar la base de datos para verificar
        // si el profesor actual es tutor del estudiante o está en su tribunal
        // Por simplicidad, devolvemos false aquí
        // En una implementación real, consultarías TFG y Tribunal entities
        
        return false;
    }

    /**
     * Verifica permisos específicos por contexto
     */
    public function canUserPerformAction(User $targetUser, User $currentUser, string $action): bool
    {
        $roles = $currentUser->getRoles();

        // Admin siempre puede (excepto acciones sobre sí mismo que están restringidas)
        if (in_array('ROLE_ADMIN', $roles)) {
            $selfRestrictedActions = ['delete_self', 'deactivate_self', 'remove_admin_role_self'];
            if (in_array($action, $selfRestrictedActions) && $targetUser === $currentUser) {
                return false;
            }
            return true;
        }

        return match($action) {
            // Cualquier usuario puede ver y editar su perfil básico
            'view_own_profile' => $targetUser === $currentUser,
            'edit_own_basic_info' => $targetUser === $currentUser,
            'change_own_password' => $targetUser === $currentUser,
            
            // Profesores pueden ver información básica de estudiantes relacionados
            'view_student_basic_info' => in_array('ROLE_PROFESOR', $roles) && 
                                        in_array('ROLE_ESTUDIANTE', $targetUser->getRoles()) &&
                                        $this->isRelatedStudent($targetUser, $currentUser),
            
            // Acciones administrativas - solo admin
            'create_user' => in_array('ROLE_ADMIN', $roles),
            'bulk_actions' => in_array('ROLE_ADMIN', $roles),
            'export_users' => in_array('ROLE_ADMIN', $roles),
            'view_system_stats' => in_array('ROLE_ADMIN', $roles),
            
            default => false,
        };
    }

    /**
     * Obtiene los campos que el usuario puede editar
     */
    public function getEditableFields(User $targetUser, User $currentUser): array
    {
        $roles = $currentUser->getRoles();

        // Admin puede editar todos los campos
        if (in_array('ROLE_ADMIN', $roles)) {
            return [
                'email',
                'nombre',
                'apellidos',
                'dni',
                'telefono',
                'universidad',
                'departamento',
                'especialidad',
                'roles',
                'is_active',
                'password'
            ];
        }

        // Usuario editando su propio perfil
        if ($targetUser === $currentUser) {
            return [
                'nombre',
                'apellidos',
                'telefono',
                'universidad',
                'departamento',
                'especialidad',
                'password'
            ];
        }

        return [];
    }

    /**
     * Verifica si el usuario puede realizar acciones en lote
     */
    public function canPerformBulkActions(User $currentUser): bool
    {
        return in_array('ROLE_ADMIN', $currentUser->getRoles());
    }

    /**
     * Verifica si el usuario puede exportar datos
     */
    public function canExportData(User $currentUser): bool
    {
        return in_array('ROLE_ADMIN', $currentUser->getRoles());
    }

    /**
     * Verifica si el usuario puede crear nuevos usuarios
     */
    public function canCreateUsers(User $currentUser): bool
    {
        return in_array('ROLE_ADMIN', $currentUser->getRoles());
    }

    /**
     * Verifica si el usuario puede ver estadísticas del sistema
     */
    public function canViewSystemStats(User $currentUser): bool
    {
        return in_array('ROLE_ADMIN', $currentUser->getRoles());
    }

    /**
     * Obtiene el nivel de acceso del usuario sobre otro usuario
     */
    public function getAccessLevel(User $targetUser, User $currentUser): string
    {
        $roles = $currentUser->getRoles();

        if (in_array('ROLE_ADMIN', $roles)) {
            return $targetUser === $currentUser ? 'admin_self' : 'admin_full';
        }

        if ($targetUser === $currentUser) {
            return 'self';
        }

        if ((in_array('ROLE_PROFESOR', $roles) || in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) 
            && $this->isRelatedStudent($targetUser, $currentUser)) {
            return 'related_student';
        }

        return 'none';
    }

    /**
     * Valida si una transición de rol es permitida
     */
    public function canChangeRoleFromTo(array $fromRoles, array $toRoles, User $currentUser): bool
    {
        // Solo admin puede cambiar roles
        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return false;
        }

        // No se puede quitar el rol de admin al último admin del sistema
        if (in_array('ROLE_ADMIN', $fromRoles) && !in_array('ROLE_ADMIN', $toRoles)) {
            // Aquí deberías verificar si quedan otros admins en el sistema
            // Por simplicidad, asumimos que sí está permitido
            return true;
        }

        // Todas las otras transiciones están permitidas para admin
        return true;
    }
}