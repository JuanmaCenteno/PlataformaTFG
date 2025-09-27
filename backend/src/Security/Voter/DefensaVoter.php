<?php

namespace App\Security\Voter;

use App\Entity\Defensa;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class DefensaVoter extends Voter
{
    // Permisos soportados
    public const VIEW = 'defensa_view';
    public const EDIT = 'defensa_edit';
    public const DELETE = 'defensa_delete';
    public const MANAGE_ESTADO = 'defensa_manage_estado';
    public const CALIFICAR = 'defensa_calificar';
    public const SCHEDULE = 'defensa_schedule';
    public const VER_ACTA = 'defensa_ver_acta';
    public const INFO_ACTA = 'defensa_info_acta';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [
            self::VIEW,
            self::EDIT,
            self::DELETE,
            self::MANAGE_ESTADO,
            self::CALIFICAR,
            self::SCHEDULE,
            self::VER_ACTA,
            self::INFO_ACTA
        ]) && $subject instanceof Defensa;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        
        if (!$user instanceof User) {
            return false;
        }

        /** @var Defensa $defensa */
        $defensa = $subject;

        return match($attribute) {
            self::VIEW => $this->canView($defensa, $user),
            self::EDIT => $this->canEdit($defensa, $user),
            self::DELETE => $this->canDelete($defensa, $user),
            self::MANAGE_ESTADO => $this->canManageEstado($defensa, $user),
            self::CALIFICAR => $this->canCalificar($defensa, $user),
            self::SCHEDULE => $this->canSchedule($defensa, $user),
            self::VER_ACTA => $this->canVerActa($defensa, $user),
            self::INFO_ACTA => $this->canInfoActa($defensa, $user),
            default => false,
        };
    }

    private function canView(Defensa $defensa, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin puede ver cualquier defensa
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Estudiante puede ver su propia defensa
        if ($defensa->getTfg()->getEstudiante() === $user) {
            return true;
        }

        // Tutor puede ver defensas de sus TFGs
        $tfg = $defensa->getTfg();
        if ($tfg->getTutor() === $user || $tfg->getCotutor() === $user) {
            return true;
        }

        // Miembros del tribunal pueden ver
        return $this->isUserInTribunal($defensa, $user);
    }

    private function canEdit(Defensa $defensa, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin puede editar cualquier defensa
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Solo defensas programadas se pueden editar
        if ($defensa->getEstado() !== 'programada') {
            return false;
        }

        // Presidente del tribunal puede editar
        if (in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            return $defensa->getTribunal()->getPresidente() === $user;
        }

        return false;
    }

    private function canDelete(Defensa $defensa, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin puede eliminar
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Solo defensas programadas y futuras
        if ($defensa->getEstado() !== 'programada' || 
            $defensa->getFechaDefensa() <= new \DateTime()) {
            return false;
        }

        // Presidente del tribunal puede eliminar
        if (in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            return $defensa->getTribunal()->getPresidente() === $user;
        }

        return false;
    }

    private function canManageEstado(Defensa $defensa, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin puede cambiar cualquier estado
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        $tribunal = $defensa->getTribunal();
        if (!$tribunal) {
            return false;
        }

        // Presidente del tribunal puede gestionar todos los estados
        if (in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles) && $tribunal->getPresidente() === $user) {
            return true;
        }

        // Cualquier miembro del tribunal puede cambiar de "programada" a "completada"
        if ($defensa->getEstado() === 'programada' && $this->isUserInTribunal($defensa, $user)) {
            return true;
        }

        // También permitir a cualquier miembro del tribunal gestionar estados de defensas completadas
        if (in_array('ROLE_PROFESOR', $roles) && $defensa->getEstado() === 'completada') {
            return $this->isUserInTribunal($defensa, $user);
        }

        return false;
    }

    private function canCalificar(Defensa $defensa, User $user): bool
    {
        // Solo defensas completadas se pueden calificar
        if ($defensa->getEstado() !== 'completada') {
            return false;
        }

        // Solo miembros del tribunal pueden calificar
        return $this->isUserInTribunal($defensa, $user);
    }

    private function canSchedule(Defensa $defensa, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin siempre puede
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Presidente del tribunal puede programar
        if (in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            return $defensa->getTribunal()->getPresidente() === $user;
        }

        return false;
    }

    private function isUserInTribunal(Defensa $defensa, User $user): bool
    {
        $tribunal = $defensa->getTribunal();
        
        return $tribunal->getPresidente() === $user ||
               $tribunal->getSecretario() === $user ||
               $tribunal->getVocal() === $user;
    }

    public function getUserRoleInDefensa(Defensa $defensa, User $user): ?string
    {
        $tribunal = $defensa->getTribunal();
        
        if ($tribunal->getPresidente() === $user) {
            return 'presidente';
        }
        if ($tribunal->getSecretario() === $user) {
            return 'secretario';
        }
        if ($tribunal->getVocal() === $user) {
            return 'vocal';
        }
        if ($defensa->getTfg()->getEstudiante() === $user) {
            return 'estudiante';
        }
        if ($defensa->getTfg()->getTutor() === $user || $defensa->getTfg()->getCotutor() === $user) {
            return 'tutor';
        }

        return null;
    }

    private function canVerActa(Defensa $defensa, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin siempre puede
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Solo actas generadas pueden ser vistas
        if (!$defensa->isActaGenerada()) {
            return false;
        }

        // Estudiante del TFG puede ver su acta
        if ($defensa->getTfg()->getEstudiante() === $user) {
            return true;
        }

        // Miembros del tribunal pueden ver el acta
        if ($this->isUserInTribunal($defensa, $user)) {
            return true;
        }

        // Tutor y cotutor pueden ver el acta
        $tfg = $defensa->getTfg();
        if ($tfg->getTutor() === $user || ($tfg->getCotutor() && $tfg->getCotutor() === $user)) {
            return true;
        }

        return false;
    }

    private function canInfoActa(Defensa $defensa, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin siempre puede
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Estudiante del TFG puede ver información de su acta (sin importar si está generada)
        if ($defensa->getTfg()->getEstudiante() === $user) {
            return true;
        }

        // Miembros del tribunal pueden ver información del acta
        if ($this->isUserInTribunal($defensa, $user)) {
            return true;
        }

        // Tutor y cotutor pueden ver información del acta
        $tfg = $defensa->getTfg();
        if ($tfg->getTutor() === $user || ($tfg->getCotutor() && $tfg->getCotutor() === $user)) {
            return true;
        }

        return false;
    }
}