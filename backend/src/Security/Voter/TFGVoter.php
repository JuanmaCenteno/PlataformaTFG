<?php

namespace App\Security\Voter;

use App\Entity\TFG;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class TFGVoter extends Voter
{
    // Permisos soportados
    public const VIEW = 'tfg_view';
    public const EDIT = 'tfg_edit';
    public const DELETE = 'tfg_delete';
    public const UPDATE_ESTADO = 'tfg_update_estado';
    public const UPLOAD_FILE = 'tfg_upload_file';
    public const DOWNLOAD_FILE = 'tfg_download_file';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [
            self::VIEW,
            self::EDIT, 
            self::DELETE,
            self::UPDATE_ESTADO,
            self::UPLOAD_FILE,
            self::DOWNLOAD_FILE
        ]) && $subject instanceof TFG;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        
        // El usuario debe estar autenticado
        if (!$user instanceof User) {
            return false;
        }

        /** @var TFG $tfg */
        $tfg = $subject;

        return match($attribute) {
            self::VIEW => $this->canView($tfg, $user),
            self::EDIT => $this->canEdit($tfg, $user),
            self::DELETE => $this->canDelete($tfg, $user),
            self::UPDATE_ESTADO => $this->canUpdateEstado($tfg, $user),
            self::UPLOAD_FILE => $this->canUploadFile($tfg, $user),
            self::DOWNLOAD_FILE => $this->canDownloadFile($tfg, $user),
            default => false,
        };
    }

    /**
     * ¿Puede ver este TFG?
     */
    private function canView(TFG $tfg, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin puede ver cualquier TFG
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // El estudiante propietario puede ver su TFG
        if ($tfg->getEstudiante() === $user) {
            return true;
        }

        // Tutor o cotutor pueden ver TFGs asignados
        if ($tfg->getTutor() === $user || $tfg->getCotutor() === $user) {
            return true;
        }

        // Miembros del tribunal pueden ver TFGs en defensa
        if (in_array('ROLE_PROFESOR', $roles) || in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            return $this->isUserInTribunal($tfg, $user);
        }

        return false;
    }

    /**
     * ¿Puede editar este TFG?
     */
    private function canEdit(TFG $tfg, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin puede editar cualquier TFG
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Estudiante solo puede editar su propio TFG y solo si está editable
        if ($tfg->getEstudiante() === $user) {
            return $tfg->isEditable(); // Solo borrador o revisión
        }

        // Tutor/cotutor pueden editar metadatos avanzados de TFGs asignados
        if (($tfg->getTutor() === $user || $tfg->getCotutor() === $user) && 
            in_array('ROLE_PROFESOR', $roles)) {
            return true;
        }

        return false;
    }

    /**
     * ¿Puede eliminar este TFG?
     */
    private function canDelete(TFG $tfg, User $user): bool
    {
        $roles = $user->getRoles();

        // Solo admin puede eliminar cualquier TFG
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Estudiante solo puede eliminar su propio TFG si está en borrador
        if ($tfg->getEstudiante() === $user) {
            return $tfg->getEstado() === TFG::ESTADO_BORRADOR;
        }

        return false;
    }

    /**
     * ¿Puede cambiar el estado del TFG?
     */
    private function canUpdateEstado(TFG $tfg, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin puede cambiar cualquier estado
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Solo profesores pueden cambiar estados
        if (!in_array('ROLE_PROFESOR', $roles) && !in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            return false;
        }

        // Tutor o cotutor pueden cambiar estado de TFGs asignados
        if ($tfg->getTutor() === $user || $tfg->getCotutor() === $user) {
            return true;
        }

        // Presidente de tribunal puede marcar como defendido
        if (in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles) && 
            $tfg->getEstado() === TFG::ESTADO_APROBADO) {
            return $this->isUserInTribunal($tfg, $user);
        }

        return false;
    }

    /**
     * ¿Puede subir archivo al TFG?
     */
    private function canUploadFile(TFG $tfg, User $user): bool
    {
        $roles = $user->getRoles();

        // Admin puede subir archivos a cualquier TFG
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // Solo el estudiante propietario puede subir archivo
        if ($tfg->getEstudiante() === $user) {
            // Solo si está en estado editable
            return $tfg->isEditable();
        }

        return false;
    }

    /**
     * ¿Puede descargar archivo del TFG?
     */
    private function canDownloadFile(TFG $tfg, User $user): bool
    {
        // Si puede ver el TFG, puede descargar el archivo
        return $this->canView($tfg, $user);
    }

    /**
     * Verifica si el usuario está en el tribunal de este TFG
     */
    private function isUserInTribunal(TFG $tfg, User $user): bool
    {
        $defensa = $tfg->getDefensa();

        if (!$defensa) {
            return false;
        }

        $tribunal = $defensa->getTribunal();

        if (!$tribunal) {
            return false;
        }

        return $tribunal->getPresidente() === $user ||
               $tribunal->getSecretario() === $user ||
               $tribunal->getVocal() === $user;
    }

    /**
     * Verifica permisos específicos por estado del TFG
     */
    private function canPerformActionBasedOnState(TFG $tfg, User $user, string $action): bool
    {
        $estado = $tfg->getEstado();
        $roles = $user->getRoles();

        return match($action) {
            'submit_for_review' => $estado === TFG::ESTADO_BORRADOR && $tfg->getEstudiante() === $user,
            'approve' => $estado === TFG::ESTADO_REVISION && 
                        ($tfg->getTutor() === $user || in_array('ROLE_ADMIN', $roles)),
            'reject' => in_array($estado, [TFG::ESTADO_REVISION, TFG::ESTADO_APROBADO]) && 
                       ($tfg->getTutor() === $user || in_array('ROLE_ADMIN', $roles)),
            'schedule_defense' => $estado === TFG::ESTADO_APROBADO && 
                                 in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles),
            'mark_defended' => $estado === TFG::ESTADO_APROBADO && 
                              in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles) &&
                              $this->isUserInTribunal($tfg, $user),
            default => false,
        };
    }

    /**
     * Método auxiliar para verificar permisos complejos
     */
    public function canUserPerformAction(TFG $tfg, User $user, string $action): bool
    {
        // Admin siempre puede
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        return match($action) {
            // Estudiante puede crear TFG
            'create' => in_array('ROLE_ESTUDIANTE', $user->getRoles()),
            
            // Solo el estudiante puede subir la primera versión
            'upload_initial' => $tfg->getEstudiante() === $user && 
                               $tfg->getEstado() === TFG::ESTADO_BORRADOR,
            
            // Tutor puede pedir revisiones
            'request_changes' => ($tfg->getTutor() === $user || $tfg->getCotutor() === $user) &&
                                in_array($tfg->getEstado(), [TFG::ESTADO_REVISION]),
            
            // Presidente puede programar defensa
            'schedule_defense' => in_array('ROLE_PRESIDENTE_TRIBUNAL', $user->getRoles()) &&
                                 $tfg->getEstado() === TFG::ESTADO_APROBADO,
                                 
            default => false,
        };
    }
}