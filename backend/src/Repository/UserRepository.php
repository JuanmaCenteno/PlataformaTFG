<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    /**
     * Encuentra usuarios con filtros avanzados y paginación
     */
    public function findWithFilters(array $filters): array
    {
        $page = $filters['page'] ?? 1;
        $perPage = $filters['per_page'] ?? 10;
        $role = $filters['role'] ?? null;
        $activo = $filters['activo'] ?? null;
        $search = $filters['search'] ?? null;

        $qb = $this->createQueryBuilder('u')
            ->orderBy('u.createdAt', 'DESC');

        // Filtro por rol - Compatibilidad con MySQL sin JSON_CONTAINS
        if ($role) {
            $qb->andWhere('u.roles LIKE :role')
               ->setParameter('role', '%"' . $role . '"%');
        }

        // Filtro por estado activo
        if ($activo !== null) {
            $qb->andWhere('u.isActive = :activo')
               ->setParameter('activo', $activo);
        }

        // Filtro de búsqueda por nombre, apellidos, email o DNI
        if ($search) {
            $qb->andWhere('u.nombre LIKE :search OR u.apellidos LIKE :search OR u.email LIKE :search OR u.dni LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        // Total count
        $totalQb = clone $qb;
        $total = $totalQb->select('COUNT(u.id)')->getQuery()->getSingleScalarResult();

        // Paginated results
        $results = $qb
            ->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage)
            ->getQuery()
            ->getResult();

        return [
            'data' => $results,
            'total' => $total
        ];
    }

    /**
     * Encuentra usuarios por rol específico
     */
    public function findByRole(string $role, bool $activeOnly = true): array
    {
        $qb = $this->createQueryBuilder('u')
            ->where('u.roles LIKE :role')
            ->setParameter('role', '%"' . $role . '"%')
            ->orderBy('u.apellidos', 'ASC')
            ->addOrderBy('u.nombre', 'ASC');

        if ($activeOnly) {
            $qb->andWhere('u.isActive = true');
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Obtiene estadísticas específicas de un usuario
     */
    public function getUserStats(User $user): array
    {
        $roles = $user->getRoles();
        $stats = [
            'tfgs_count' => 0,
            'defensas_count' => 0,
            'tribunales_count' => 0,
            'calificaciones_count' => 0,
            'ultimo_acceso' => null,
            'rol_principal' => $this->getRolPrincipal($roles)
        ];

        // Estadísticas según el rol
        if (in_array('ROLE_ESTUDIANTE', $roles)) {
            // TFGs como estudiante
            $stats['tfgs_count'] = $this->getEntityManager()
                ->getRepository('App\Entity\TFG')
                ->count(['estudiante' => $user]);

            // Defensas como estudiante
            $stats['defensas_count'] = $this->getEntityManager()
                ->createQuery('SELECT COUNT(d.id) FROM App\Entity\Defensa d JOIN d.tfg t WHERE t.estudiante = :user')
                ->setParameter('user', $user)
                ->getSingleScalarResult();
        }

        if (in_array('ROLE_PROFESOR', $roles) || in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
            // TFGs como tutor o cotutor
            $tfgsComoTutor = $this->getEntityManager()
                ->createQuery('SELECT COUNT(t.id) FROM App\Entity\TFG t WHERE t.tutor = :user OR t.cotutor = :user')
                ->setParameter('user', $user)
                ->getSingleScalarResult();
            
            $stats['tfgs_supervisados'] = $tfgsComoTutor;

            // Tribunales donde participa
            $stats['tribunales_count'] = $this->getEntityManager()
                ->createQuery('SELECT COUNT(tr.id) FROM App\Entity\Tribunal tr WHERE tr.presidente = :user OR tr.secretario = :user OR tr.vocal = :user')
                ->setParameter('user', $user)
                ->getSingleScalarResult();

            // Calificaciones realizadas
            $stats['calificaciones_count'] = $this->getEntityManager()
                ->getRepository('App\Entity\Calificacion')
                ->count(['evaluador' => $user]);

            // Defensas donde ha participado como evaluador
            $stats['defensas_evaluadas'] = $this->getEntityManager()
                ->createQuery('SELECT COUNT(DISTINCT d.id) FROM App\Entity\Defensa d JOIN d.tribunal t WHERE t.presidente = :user OR t.secretario = :user OR t.vocal = :user')
                ->setParameter('user', $user)
                ->getSingleScalarResult();
        }

        // Notificaciones
        $stats['notificaciones_no_leidas'] = $this->getEntityManager()
            ->getRepository('App\Entity\Notificacion')
            ->count(['usuario' => $user, 'leida' => false]);

        return $stats;
    }

    /**
     * Verifica conflictos antes de eliminar un usuario
     */
    public function checkDeleteConflicts(User $user): array
    {
        $conflicts = [];

        // Verificar TFGs como estudiante
        $tfgsEstudiante = $this->getEntityManager()
            ->getRepository('App\Entity\TFG')
            ->count(['estudiante' => $user]);
        
        if ($tfgsEstudiante > 0) {
            $conflicts[] = [
                'tipo' => 'tfgs_como_estudiante',
                'count' => $tfgsEstudiante,
                'mensaje' => "Tiene {$tfgsEstudiante} TFG(s) como estudiante"
            ];
        }

        // Verificar TFGs como tutor
        $tfgsComoTutor = $this->getEntityManager()
            ->createQuery('SELECT COUNT(t.id) FROM App\Entity\TFG t WHERE t.tutor = :user OR t.cotutor = :user')
            ->setParameter('user', $user)
            ->getSingleScalarResult();
        
        if ($tfgsComoTutor > 0) {
            $conflicts[] = [
                'tipo' => 'tfgs_como_tutor',
                'count' => $tfgsComoTutor,
                'mensaje' => "Es tutor/cotutor de {$tfgsComoTutor} TFG(s)"
            ];
        }

        // Verificar participación en tribunales activos
        $tribunalesActivos = $this->getEntityManager()
            ->createQuery('SELECT COUNT(tr.id) FROM App\Entity\Tribunal tr WHERE (tr.presidente = :user OR tr.secretario = :user OR tr.vocal = :user) AND tr.activo = true')
            ->setParameter('user', $user)
            ->getSingleScalarResult();
        
        if ($tribunalesActivos > 0) {
            $conflicts[] = [
                'tipo' => 'tribunales_activos',
                'count' => $tribunalesActivos,
                'mensaje' => "Participa en {$tribunalesActivos} tribunal(es) activo(s)"
            ];
        }

        // Verificar defensas programadas
        $defensasProgramadas = $this->getEntityManager()
            ->createQuery('
                SELECT COUNT(DISTINCT d.id) 
                FROM App\Entity\Defensa d 
                LEFT JOIN d.tfg t 
                LEFT JOIN d.tribunal tr 
                WHERE d.estado = :programada AND (
                    t.estudiante = :user OR 
                    t.tutor = :user OR 
                    t.cotutor = :user OR 
                    tr.presidente = :user OR 
                    tr.secretario = :user OR 
                    tr.vocal = :user
                )
            ')
            ->setParameter('user', $user)
            ->setParameter('programada', 'programada')
            ->getSingleScalarResult();
        
        if ($defensasProgramadas > 0) {
            $conflicts[] = [
                'tipo' => 'defensas_programadas',
                'count' => $defensasProgramadas,
                'mensaje' => "Tiene {$defensasProgramadas} defensa(s) programada(s)"
            ];
        }

        return $conflicts;
    }

    /**
     * Obtiene estadísticas generales del sistema de usuarios
     */
    public function getGeneralStats(): array
    {
        // Conteo por roles
        $roleStats = $this->createQueryBuilder('u')
            ->select('u.roles, COUNT(u.id) as total')
            ->where('u.isActive = true')
            ->groupBy('u.roles')
            ->getQuery()
            ->getResult();

        // Procesar estadísticas de roles
        $rolesCount = [
            'ROLE_ESTUDIANTE' => 0,
            'ROLE_PROFESOR' => 0,
            'ROLE_PRESIDENTE_TRIBUNAL' => 0,
            'ROLE_ADMIN' => 0
        ];

        foreach ($roleStats as $stat) {
            $roles = $stat['roles'];
            $count = (int) $stat['total'];

            foreach ($roles as $role) {
                if (isset($rolesCount[$role])) {
                    $rolesCount[$role] += $count;
                }
            }
        }

        // Usuarios activos vs inactivos
        $totalActivos = $this->count(['isActive' => true]);
        $totalInactivos = $this->count(['isActive' => false]);

        // Usuarios creados en los últimos 30 días
        $hace30dias = new \DateTime('-30 days');
        $nuevosUsuarios = $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.createdAt >= :fecha')
            ->setParameter('fecha', $hace30dias)
            ->getQuery()
            ->getSingleScalarResult();

        // Usuarios más activos (con más TFGs o participaciones)
        $usuariosMasActivos = $this->getEntityManager()
            ->createQuery('
                SELECT u.id, u.nombre, u.apellidos, u.email,
                       COUNT(DISTINCT t1.id) as tfgs_como_estudiante,
                       COUNT(DISTINCT t2.id) as tfgs_como_tutor,
                       COUNT(DISTINCT tr.id) as tribunales
                FROM App\Entity\User u
                LEFT JOIN App\Entity\TFG t1 WITH t1.estudiante = u
                LEFT JOIN App\Entity\TFG t2 WITH t2.tutor = u OR t2.cotutor = u
                LEFT JOIN App\Entity\Tribunal tr WITH tr.presidente = u OR tr.secretario = u OR tr.vocal = u
                WHERE u.isActive = true
                GROUP BY u.id
                ORDER BY (COUNT(DISTINCT t1.id) + COUNT(DISTINCT t2.id) + COUNT(DISTINCT tr.id)) DESC
            ')
            ->setMaxResults(10)
            ->getResult();

        // Distribución por universidades
        $universidades = $this->createQueryBuilder('u')
            ->select('u.universidad, COUNT(u.id) as total')
            ->where('u.isActive = true')
            ->andWhere('u.universidad IS NOT NULL')
            ->groupBy('u.universidad')
            ->orderBy('total', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();

        // Evolución mensual (últimos 12 meses)
        $evolucionMensual = $this->createQueryBuilder('u')
            ->select('YEAR(u.createdAt) as anio, MONTH(u.createdAt) as mes, COUNT(u.id) as total')
            ->where('u.createdAt >= :hace12meses')
            ->setParameter('hace12meses', new \DateTime('-12 months'))
            ->groupBy('anio', 'mes')
            ->orderBy('anio', 'DESC')
            ->addOrderBy('mes', 'DESC')
            ->getQuery()
            ->getResult();

        return [
            'resumen' => [
                'total_usuarios' => $totalActivos + $totalInactivos,
                'usuarios_activos' => $totalActivos,
                'usuarios_inactivos' => $totalInactivos,
                'nuevos_usuarios_30d' => (int) $nuevosUsuarios
            ],
            'por_roles' => $rolesCount,
            'usuarios_mas_activos' => $usuariosMasActivos,
            'por_universidad' => $universidades,
            'evolucion_mensual' => $evolucionMensual
        ];
    }

    /**
     * Encuentra usuarios para exportación
     */
    public function findForExport(array $filters = []): array
    {
        $qb = $this->createQueryBuilder('u')
            ->orderBy('u.apellidos', 'ASC')
            ->addOrderBy('u.nombre', 'ASC');

        // Aplicar filtros
        if (!empty($filters['role'])) {
            $qb->andWhere('u.roles LIKE :role')
               ->setParameter('role', '%"' . $filters['role'] . '"%');
        }

        if (isset($filters['activo'])) {
            $qb->andWhere('u.isActive = :activo')
               ->setParameter('activo', $filters['activo']);
        }

        if (!empty($filters['search'])) {
            $qb->andWhere('u.nombre LIKE :search OR u.apellidos LIKE :search OR u.email LIKE :search OR u.dni LIKE :search')
               ->setParameter('search', '%' . $filters['search'] . '%');
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Busca usuarios por texto completo
     */
    public function searchUsers(string $searchTerm, int $limit = 20): array
    {
        return $this->createQueryBuilder('u')
            ->where('u.nombre LIKE :search OR u.apellidos LIKE :search OR u.email LIKE :search OR u.dni LIKE :search')
            ->andWhere('u.isActive = true')
            ->setParameter('search', '%' . $searchTerm . '%')
            ->orderBy('u.apellidos', 'ASC')
            ->addOrderBy('u.nombre', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra profesores disponibles para asignar como tutores
     */
    public function findAvailableProfessors(int $maxTfgsPerProfesor = 5): array
    {
        $profesores = $this->findByRole('ROLE_PROFESOR', true);
        $disponibles = [];

        foreach ($profesores as $profesor) {
            $tfgsAsignados = $this->getEntityManager()
                ->createQuery('SELECT COUNT(t.id) FROM App\Entity\TFG t WHERE t.tutor = :profesor AND t.estado != :defendido')
                ->setParameter('profesor', $profesor)
                ->setParameter('defendido', 'defendido')
                ->getSingleScalarResult();

            if ($tfgsAsignados < $maxTfgsPerProfesor) {
                $disponibles[] = [
                    'profesor' => $profesor,
                    'tfgs_actuales' => $tfgsAsignados,
                    'disponibilidad' => $maxTfgsPerProfesor - $tfgsAsignados
                ];
            }
        }

        // Ordenar por menor carga de trabajo
        usort($disponibles, fn($a, $b) => $a['tfgs_actuales'] <=> $b['tfgs_actuales']);

        return $disponibles;
    }

    /**
     * Encuentra usuarios que necesitan activación
     */
    public function findPendingActivation(): array
    {
        $hace7dias = new \DateTime('-7 days');

        return $this->createQueryBuilder('u')
            ->where('u.isActive = false')
            ->andWhere('u.createdAt >= :fecha')
            ->setParameter('fecha', $hace7dias)
            ->orderBy('u.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra usuarios inactivos por mucho tiempo
     */
    public function findLongTimeInactive(int $dias = 90): array
    {
        $fechaLimite = new \DateTime("-{$dias} days");

        return $this->createQueryBuilder('u')
            ->where('u.isActive = true')
            ->andWhere('u.updatedAt < :fecha')
            ->setParameter('fecha', $fechaLimite)
            ->orderBy('u.updatedAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Obtiene el rol principal de un usuario
     */
    private function getRolPrincipal(array $roles): string
    {
        $jerarquia = [
            'ROLE_ADMIN' => 4,
            'ROLE_PRESIDENTE_TRIBUNAL' => 3,
            'ROLE_PROFESOR' => 2,
            'ROLE_ESTUDIANTE' => 1
        ];

        $rolPrincipal = 'ROLE_ESTUDIANTE';
        $nivelMaximo = 0;

        foreach ($roles as $rol) {
            if (isset($jerarquia[$rol]) && $jerarquia[$rol] > $nivelMaximo) {
                $nivelMaximo = $jerarquia[$rol];
                $rolPrincipal = $rol;
            }
        }

        return $rolPrincipal;
    }

    /**
     * Obtiene estadísticas de login por período
     */
    public function getLoginStats(\DateTimeInterface $inicio, \DateTimeInterface $fin): array
    {
        // Esta funcionalidad requeriría una tabla de logs de login
        // Por ahora retornamos datos simulados
        return [
            'total_logins' => 0,
            'usuarios_unicos' => 0,
            'promedio_por_dia' => 0
        ];
    }

    /**
     * Verifica si un email está disponible
     */
    public function isEmailAvailable(string $email, ?User $excludeUser = null): bool
    {
        $qb = $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.email = :email')
            ->setParameter('email', $email);

        if ($excludeUser) {
            $qb->andWhere('u.id != :excludeId')
               ->setParameter('excludeId', $excludeUser->getId());
        }

        return $qb->getQuery()->getSingleScalarResult() == 0;
    }

    /**
     * Verifica si un DNI está disponible
     */
    public function isDniAvailable(string $dni, ?User $excludeUser = null): bool
    {
        if (empty($dni)) {
            return true; // DNI es opcional
        }

        $qb = $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.dni = :dni')
            ->setParameter('dni', $dni);

        if ($excludeUser) {
            $qb->andWhere('u.id != :excludeId')
               ->setParameter('excludeId', $excludeUser->getId());
        }

        return $qb->getQuery()->getSingleScalarResult() == 0;
    }

    /**
     * Encuentra usuarios por departamento
     */
    public function findByDepartment(string $departamento): array
    {
        return $this->createQueryBuilder('u')
            ->where('u.departamento = :departamento')
            ->andWhere('u.isActive = true')
            ->setParameter('departamento', $departamento)
            ->orderBy('u.apellidos', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Limpia usuarios eliminados (soft delete)
     */
    public function cleanupDeletedUsers(int $diasAntiguedad = 365): int
    {
        $fechaLimite = new \DateTime("-{$diasAntiguedad} days");

        return $this->createQueryBuilder('u')
            ->delete()
            ->where('u.isActive = false')
            ->andWhere('u.email LIKE :deletedPattern')
            ->andWhere('u.updatedAt < :fecha')
            ->setParameter('deletedPattern', '%_deleted_%')
            ->setParameter('fecha', $fechaLimite)
            ->getQuery()
            ->execute();
    }

    public function save(User $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(User $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Obtiene estadísticas de usuarios por rol
     */
    public function getEstadisticasPorRol(): array
    {
        $qb = $this->createQueryBuilder('u');

        $result = $qb
            ->select('u.roles')
            ->getQuery()
            ->getResult();

        $stats = [
            'estudiantes' => 0,
            'profesores' => 0,
            'presidentes' => 0,
            'admins' => 0
        ];

        foreach ($result as $user) {
            $roles = $user['roles'];

            if (in_array('ROLE_ADMIN', $roles)) {
                $stats['admins']++;
            } elseif (in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles)) {
                $stats['presidentes']++;
            } elseif (in_array('ROLE_PROFESOR', $roles)) {
                $stats['profesores']++;
            } elseif (in_array('ROLE_ESTUDIANTE', $roles)) {
                $stats['estudiantes']++;
            }
        }

        return $stats;
    }
}