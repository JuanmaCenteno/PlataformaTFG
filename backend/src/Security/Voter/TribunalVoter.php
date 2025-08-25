<?php

namespace App\Security\Voter;

use App\Entity\Tribunal;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class TribunalVoter extends Voter
{
    // Permisos soportados
    public const VIEW = 'tribunal_view';
    public const EDIT = 'tribunal_edit';
    public const DELETE = 'tribunal_delete';
    public const MANAGE_MEMBERS = 'tribunal_manage_members';
    public const SCHEDULE_DEFENSE = 'tribunal_schedule_defense';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [
            self::VIEW,
            self::EDIT,
            self::DELETE,
            self::MANAGE_MEMBERS,
            self::SCHEDULE_DEFENSE
        ]) && $subject instanceof Tribunal;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        
        // El usuario debe estar autenticado
        if (!$user instanceof User) {
            return false;
        }

        /** @var Tribunal $tribunal */
        $tribunal = $subject;

        return match($attribute) {
            self::VIEW => $this->canView($tribunal, $user),
            self::EDIT => $this->canEdit($tribunal, $user),
            self::DELETE => $this->canDelete($tribunal, $user),
            self::MANAGE_MEMBERS => $this->canManageMembers($tribunal, $user),
            self::SCHEDULE_DEFENSE => $this->canScheduleDefense($tribunal, $user),
            default => false,
        };
    }

    /**
     * ¿Puede ver este tribunal?
     */
    private function canView(Tribunal $tribunal, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin puede ver cualquier tribunal
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Profesores pueden ver tribunales donde participan
        if (in_array('ROLE_PROFESOR', $roles) || in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            return $this->isUserInTribunal($tribunal, $user);
        }

        return false;
    }

    /**
     * ¿Puede editar este tribunal?
     */
    private function canEdit(Tribunal $tribunal, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin puede editar cualquier tribunal
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Solo el presidente del tribunal puede editar (datos básicos)
        if (in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            return $tribunal->getPresidente() === $user;
        }

        return false;
    }

    /**
     * ¿Puede eliminar este tribunal?
     */
    private function canDelete(Tribunal $tribunal, User $user): bool
    {
        $roles = $user->getRoles();

        // Solo admin puede eliminar tribunales
        return in_array('ROLE_ADMIN', $roles);
    }

    /**
     * ¿Puede gestionar miembros del tribunal?
     */
    private function canManageMembers(Tribunal $tribunal, User $user): bool
    {
        $roles = $user->getRoles();

        // Solo admin puede cambiar miembros
        return in_array('ROLE_ADMIN', $roles);
    }

    /**
     * ¿Puede programar defensas con este tribunal?
     */
    private function canScheduleDefense(Tribunal $tribunal, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin siempre puede
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Presidente de tribunal puede programar defensas
        if (in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            return $tribunal->getPresidente() === $user;
        }

        return false;
    }

    /**
     * Verifica si el usuario es miembro del tribunal
     */
    private function isUserInTribunal(Tribunal $tribunal, User $user): bool
    {
        return $tribunal->getPresidente() === $user ||
               $tribunal->getSecretario() === $user ||
               $tribunal->getVocal() === $user;
    }

    /**
     * Obtiene el rol del usuario en el tribunal
     */
    public function getUserRoleInTribunal(Tribunal $tribunal, User $user): ?string
    {
        if ($tribunal->getPresidente() === $user) {
            return 'presidente';
        }
        if ($tribunal->getSecretario() === $user) {
            return 'secretario';
        }
        if ($tribunal->getVocal() === $user) {
            return 'vocal';
        }
        return null;
    }

    /**
     * Verifica si el tribunal está disponible para nueva defensa
     */
    public function isTribunalAvailable(Tribunal $tribunal, \DateTimeInterface $fecha): bool
    {
        // El tribunal debe estar activo
        if (!$tribunal->isActivo()) {
            return false;
        }

        // Verificar que no tenga otra defensa a la misma hora
        // Esta lógica se implementaría consultando defensas existentes
        return true;
    }

    /**
     * Verifica permisos específicos por contexto
     */
    public function canUserPerformAction(Tribunal $tribunal, User $user, string $action): bool
    {
        $roles = $user->getRoles();

        // Admin siempre puede
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        return match($action) {
            // Solo presidente puede crear tribunal
            'create_tribunal' => in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles),
            
            // Presidente puede modificar datos básicos
            'update_basic_info' => $tribunal->getPresidente() === $user &&
                                   in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles),
            
            // Solo admin puede cambiar miembros
            'change_members' => in_array('ROLE_ADMIN', $roles),
            
            // Presidente puede programar defensas
            'schedule_defense' => $tribunal->getPresidente() === $user &&
                                  in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles),
            
            // Cualquier miembro puede ver disponibilidad
            'view_availability' => $this->isUserInTribunal($tribunal, $user),
            
            // Solo admin puede activar/desactivar
            'toggle_status' => in_array('ROLE_ADMIN', $roles),
            
            default => false,
        };
    }
}