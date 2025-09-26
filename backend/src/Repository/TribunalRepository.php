<?php

namespace App\Repository;

use App\Entity\Tribunal;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Tribunal>
 */
class TribunalRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Tribunal::class);
    }

    /**
     * Encuentra todos los tribunales paginados
     */
    public function findAllPaginated(int $page = 1, int $perPage = 10, bool $activo = true): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.presidente', 'p')
            ->leftJoin('t.secretario', 's')
            ->leftJoin('t.vocal', 'v')
            ->leftJoin('t.suplente1', 'sup1')
            ->leftJoin('t.suplente2', 'sup2')
            ->leftJoin('t.defensas', 'd')
            ->addSelect('p', 's', 'v', 'sup1', 'sup2', 'd')
            ->where('t.activo = :activo')
            ->setParameter('activo', $activo)
            ->orderBy('t.createdAt', 'DESC');

        // Total count
        $totalQb = clone $qb;
        $total = $totalQb->select('COUNT(DISTINCT t.id)')->getQuery()->getSingleScalarResult();

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
     * Encuentra tribunales donde el usuario es miembro
     */
    public function findByMiembro(User $usuario, int $page = 1, int $perPage = 10, bool $activo = true): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.presidente', 'p')
            ->leftJoin('t.secretario', 's')
            ->leftJoin('t.vocal', 'v')
            ->leftJoin('t.suplente1', 'sup1')
            ->leftJoin('t.suplente2', 'sup2')
            ->leftJoin('t.defensas', 'd')
            ->addSelect('p', 's', 'v', 'sup1', 'sup2', 'd')
            ->where('t.activo = :activo')
            ->andWhere('t.presidente = :usuario OR t.secretario = :usuario OR t.vocal = :usuario OR t.suplente1 = :usuario OR t.suplente2 = :usuario')
            ->setParameter('activo', $activo)
            ->setParameter('usuario', $usuario)
            ->orderBy('t.createdAt', 'DESC');

        // Total count
        $totalQb = clone $qb;
        $total = $totalQb->select('COUNT(DISTINCT t.id)')->getQuery()->getSingleScalarResult();

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
     * Cuenta tribunales activos donde participa el profesor
     */
    public function countTribunalesActivosByProfesor(User $profesor): int
    {
        return $this->createQueryBuilder('t')
            ->select('COUNT(t.id)')
            ->where('t.activo = true')
            ->andWhere('t.presidente = :profesor OR t.secretario = :profesor OR t.vocal = :profesor OR t.suplente1 = :profesor OR t.suplente2 = :profesor')
            ->setParameter('profesor', $profesor)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Encuentra tribunales disponibles para una fecha específica
     */
    public function findAvailableForDate(\DateTimeInterface $fecha): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.defensas', 'd', 'WITH', 'd.fechaDefensa = :fecha AND d.estado != :cancelada')
            ->leftJoin('t.presidente', 'p')
            ->leftJoin('t.secretario', 's')
            ->leftJoin('t.vocal', 'v')
            ->addSelect('p', 's', 'v')
            ->where('t.activo = true')
            ->andWhere('d.id IS NULL')
            ->setParameter('fecha', $fecha)
            ->setParameter('cancelada', 'cancelada')
            ->orderBy('t.nombre', 'ASC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Encuentra tribunales por presidente
     */
    public function findByPresidente(User $presidente, bool $activosSolo = true): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.secretario', 's')
            ->leftJoin('t.vocal', 'v')
            ->addSelect('s', 'v')
            ->where('t.presidente = :presidente')
            ->setParameter('presidente', $presidente)
            ->orderBy('t.createdAt', 'DESC');

        if ($activosSolo) {
            $qb->andWhere('t.activo = true');
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Busca tribunales por nombre
     */
    public function findByNombre(string $nombre, bool $exact = false): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.presidente', 'p')
            ->leftJoin('t.secretario', 's')
            ->leftJoin('t.vocal', 'v')
            ->addSelect('p', 's', 'v')
            ->where('t.activo = true')
            ->orderBy('t.nombre', 'ASC');

        if ($exact) {
            $qb->andWhere('t.nombre = :nombre')
               ->setParameter('nombre', $nombre);
        } else {
            $qb->andWhere('t.nombre LIKE :nombre')
               ->setParameter('nombre', '%' . $nombre . '%');
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Obtiene estadísticas de tribunales
     */
    public function getEstadisticas(): array
    {
        // Total de tribunales activos
        $totalActivos = $this->count(['activo' => true]);
        $totalInactivos = $this->count(['activo' => false]);

        // Tribunales con más defensas
        $tribunalesConDefensas = $this->createQueryBuilder('t')
            ->select('t.id, t.nombre, COUNT(d.id) as total_defensas')
            ->leftJoin('t.defensas', 'd')
            ->where('t.activo = true')
            ->groupBy('t.id')
            ->orderBy('total_defensas', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();

        // Profesores más participativos
        $profesoresMasActivos = $this->getEntityManager()->createQuery('
            SELECT u.id, u.nombre, u.apellidos, COUNT(t.id) as tribunales_count
            FROM App\Entity\User u
            LEFT JOIN App\Entity\Tribunal t WITH (t.presidente = u OR t.secretario = u OR t.vocal = u)
            WHERE t.activo = true AND u.isActive = true
            GROUP BY u.id
            ORDER BY tribunales_count DESC
        ')->setMaxResults(10)->getResult();

        return [
            'total_activos' => $totalActivos,
            'total_inactivos' => $totalInactivos,
            'tribunales_con_mas_defensas' => $tribunalesConDefensas,
            'profesores_mas_activos' => $profesoresMasActivos
        ];
    }

    /**
     * Verifica si un profesor puede ser asignado a un nuevo tribunal
     */
    public function canProfesorBeAssigned(User $profesor, int $maxTribunales = 3): bool
    {
        $tribunalesActivos = $this->countTribunalesActivosByProfesor($profesor);
        return $tribunalesActivos < $maxTribunales;
    }

    /**
     * Encuentra tribunales con conflictos de horario
     */
    public function findTribunalesWithConflicts(\DateTimeInterface $fechaInicio, \DateTimeInterface $fechaFin): array
    {
        return $this->createQueryBuilder('t')
            ->select('t, COUNT(d.id) as defensas_count')
            ->leftJoin('t.defensas', 'd', 'WITH', 
                'd.fechaDefensa BETWEEN :fechaInicio AND :fechaFin AND d.estado = :programada')
            ->leftJoin('t.presidente', 'p')
            ->leftJoin('t.secretario', 's')
            ->leftJoin('t.vocal', 'v')
            ->addSelect('p', 's', 'v')
            ->where('t.activo = true')
            ->setParameter('fechaInicio', $fechaInicio)
            ->setParameter('fechaFin', $fechaFin)
            ->setParameter('programada', 'programada')
            ->groupBy('t.id')
            ->having('defensas_count > 1')
            ->orderBy('defensas_count', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra el tribunal con menor carga de trabajo
     */
    public function findTribunalWithLeastLoad(): ?Tribunal
    {
        $result = $this->createQueryBuilder('t')
            ->select('t, COUNT(d.id) as defensas_count')
            ->leftJoin('t.defensas', 'd', 'WITH', 'd.estado = :programada')
            ->leftJoin('t.presidente', 'p')
            ->leftJoin('t.secretario', 's')
            ->leftJoin('t.vocal', 'v')
            ->addSelect('p', 's', 'v')
            ->where('t.activo = true')
            ->setParameter('programada', 'programada')
            ->groupBy('t.id')
            ->orderBy('defensas_count', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        return $result ? $result[0] : null;
    }

    /**
     * Obtiene la carga de trabajo de un tribunal
     */
    public function getTribunalWorkload(Tribunal $tribunal): array
    {
        $defensasProgramadas = $this->getEntityManager()
            ->getRepository('App\Entity\Defensa')
            ->count([
                'tribunal' => $tribunal,
                'estado' => 'programada'
            ]);

        $defensasCompletadas = $this->getEntityManager()
            ->getRepository('App\Entity\Defensa')
            ->count([
                'tribunal' => $tribunal,
                'estado' => 'completada'
            ]);

        $proximasDefensas = $this->getEntityManager()
            ->getRepository('App\Entity\Defensa')
            ->createQueryBuilder('d')
            ->select('COUNT(d.id)')
            ->where('d.tribunal = :tribunal')
            ->andWhere('d.estado = :programada')
            ->andWhere('d.fechaDefensa >= :hoy')
            ->setParameter('tribunal', $tribunal)
            ->setParameter('programada', 'programada')
            ->setParameter('hoy', new \DateTime('today'))
            ->getQuery()
            ->getSingleScalarResult();

        return [
            'defensas_programadas' => $defensasProgramadas,
            'defensas_completadas' => $defensasCompletadas,
            'proximas_defensas' => $proximasDefensas,
            'carga_total' => $defensasProgramadas + $defensasCompletadas
        ];
    }

    /**
     * Encuentra tribunales que necesitan reemplazo de miembros
     */
    public function findTribunalesNeedingReplacement(): array
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.presidente', 'p')
            ->leftJoin('t.secretario', 's')
            ->leftJoin('t.vocal', 'v')
            ->addSelect('p', 's', 'v')
            ->where('t.activo = true')
            ->andWhere('p.isActive = false OR s.isActive = false OR v.isActive = false')
            ->orderBy('t.nombre', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Obtiene tribunales ordenados por disponibilidad
     */
    public function findOrderedByAvailability(\DateTimeInterface $fecha): array
    {
        return $this->createQueryBuilder('t')
            ->select('t, COUNT(d.id) as defensas_count')
            ->leftJoin('t.defensas', 'd', 'WITH', 
                'DATE(d.fechaDefensa) = DATE(:fecha) AND d.estado = :programada')
            ->leftJoin('t.presidente', 'p')
            ->leftJoin('t.secretario', 's')
            ->leftJoin('t.vocal', 'v')
            ->addSelect('p', 's', 'v')
            ->where('t.activo = true')
            ->setParameter('fecha', $fecha)
            ->setParameter('programada', 'programada')
            ->groupBy('t.id')
            ->orderBy('defensas_count', 'ASC')
            ->addOrderBy('t.nombre', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function save(Tribunal $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Tribunal $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}