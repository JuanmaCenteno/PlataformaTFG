<?php

namespace App\Repository;

use App\Entity\TFG;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TFG>
 */
class TFGRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TFG::class);
    }

    /**
     * Encuentra TFGs de un estudiante específico con paginación
     */
    public function findByEstudiante(User $estudiante, int $page = 1, int $perPage = 10): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.tutor', 'tutor')
            ->leftJoin('t.cotutor', 'cotutor')
            ->addSelect('tutor', 'cotutor')
            ->where('t.estudiante = :estudiante')
            ->setParameter('estudiante', $estudiante)
            ->orderBy('t.createdAt', 'DESC');

        // Total count
        $totalQb = clone $qb;
        $total = $totalQb->select('COUNT(t.id)')->getQuery()->getSingleScalarResult();

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
     * Encuentra TFGs donde el usuario es tutor o cotutor
     */
    public function findByTutorOrCotutor(User $profesor, int $page = 1, int $perPage = 10): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.estudiante', 'estudiante')
            ->leftJoin('t.tutor', 'tutor')
            ->leftJoin('t.cotutor', 'cotutor')
            ->addSelect('estudiante', 'tutor', 'cotutor')
            ->where('t.tutor = :profesor OR t.cotutor = :profesor')
            ->setParameter('profesor', $profesor)
            ->orderBy('t.createdAt', 'DESC');

        // Total count
        $totalQb = clone $qb;
        $total = $totalQb->select('COUNT(t.id)')->getQuery()->getSingleScalarResult();

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
     * Encuentra TFGs asignados a tribunales donde el usuario participa
     */
    public function findByTribunal(User $profesor, int $page = 1, int $perPage = 10): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.estudiante', 'estudiante')
            ->leftJoin('t.tutor', 'tutor')
            ->leftJoin('t.defensas', 'd')
            ->leftJoin('d.tribunal', 'tr')
            ->addSelect('estudiante', 'tutor', 'd', 'tr')
            ->where('tr.presidente = :profesor OR tr.secretario = :profesor OR tr.vocal = :profesor')
            ->andWhere('t.estado IN (:estados)')
            ->setParameter('profesor', $profesor)
            ->setParameter('estados', ['aprobado', 'defendido'])
            ->orderBy('d.fechaDefensa', 'ASC');

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
     * Encuentra todos los TFGs con paginación (para admin)
     */
    public function findAllPaginated(int $page = 1, int $perPage = 10): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.estudiante', 'estudiante')
            ->leftJoin('t.tutor', 'tutor')
            ->leftJoin('t.cotutor', 'cotutor')
            ->addSelect('estudiante', 'tutor', 'cotutor')
            ->orderBy('t.createdAt', 'DESC');

        // Total count
        $totalQb = clone $qb;
        $total = $totalQb->select('COUNT(t.id)')->getQuery()->getSingleScalarResult();

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
     * Encuentra TFGs por estado
     */
    public function findByEstado(string $estado, int $page = 1, int $perPage = 10): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.estudiante', 'estudiante')
            ->leftJoin('t.tutor', 'tutor')
            ->addSelect('estudiante', 'tutor')
            ->where('t.estado = :estado')
            ->setParameter('estado', $estado)
            ->orderBy('t.createdAt', 'DESC');

        // Total count
        $totalQb = clone $qb;
        $total = $totalQb->select('COUNT(t.id)')->getQuery()->getSingleScalarResult();

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
     * Busca TFGs por texto en título, descripción o palabras clave
     */
    public function findBySearch(string $searchTerm, int $page = 1, int $perPage = 10): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.estudiante', 'estudiante')
            ->leftJoin('t.tutor', 'tutor')
            ->addSelect('estudiante', 'tutor')
            ->where('t.titulo LIKE :search')
            ->orWhere('t.descripcion LIKE :search')
            ->orWhere('JSON_SEARCH(t.palabrasClave, \'one\', :searchExact) IS NOT NULL')
            ->setParameter('search', '%' . $searchTerm . '%')
            ->setParameter('searchExact', $searchTerm)
            ->orderBy('t.createdAt', 'DESC');

        // Total count
        $totalQb = clone $qb;
        $total = $totalQb->select('COUNT(t.id)')->getQuery()->getSingleScalarResult();

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
     * Obtiene estadísticas de TFGs por estado
     */
    public function getEstadisticasPorEstado(): array
    {
        $qb = $this->createQueryBuilder('t')
            ->select('t.estado, COUNT(t.id) as total')
            ->groupBy('t.estado')
            ->getQuery();

        $results = $qb->getResult();
        
        $estadisticas = [
            'borrador' => 0,
            'revision' => 0,
            'aprobado' => 0,
            'defendido' => 0
        ];

        foreach ($results as $result) {
            $estadisticas[$result['estado']] = (int) $result['total'];
        }

        return $estadisticas;
    }

    /**
     * Encuentra TFGs próximos a vencer (fecha estimada)
     */
    public function findProximosAVencer(int $dias = 30): array
    {
        $fechaLimite = new \DateTime("+{$dias} days");
        
        return $this->createQueryBuilder('t')
            ->leftJoin('t.estudiante', 'estudiante')
            ->leftJoin('t.tutor', 'tutor')
            ->addSelect('estudiante', 'tutor')
            ->where('t.fechaFinEstimada <= :fechaLimite')
            ->andWhere('t.estado IN (:estados)')
            ->setParameter('fechaLimite', $fechaLimite)
            ->setParameter('estados', ['borrador', 'revision'])
            ->orderBy('t.fechaFinEstimada', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra TFGs listos para defensa (aprobados sin fecha de defensa)
     */
    public function findListosParaDefensa(): array
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.estudiante', 'estudiante')
            ->leftJoin('t.tutor', 'tutor')
            ->leftJoin('t.defensas', 'd')
            ->addSelect('estudiante', 'tutor')
            ->where('t.estado = :estado')
            ->andWhere('d.id IS NULL')
            ->setParameter('estado', 'aprobado')
            ->orderBy('t.updatedAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function save(TFG $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(TFG $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}