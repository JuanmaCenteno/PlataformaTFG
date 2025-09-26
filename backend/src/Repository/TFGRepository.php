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
            ->leftJoin('t.defensa', 'defensa')
            ->leftJoin('defensa.tribunal', 'tribunal')
            ->addSelect('tutor', 'cotutor', 'defensa', 'tribunal')
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
            ->leftJoin('t.defensa', 'defensa')
            ->leftJoin('defensa.tribunal', 'tribunal')
            ->addSelect('estudiante', 'tutor', 'cotutor', 'defensa', 'tribunal')
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
            ->leftJoin('t.defensa', 'd')
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
            ->leftJoin('t.defensa', 'defensa')
            ->leftJoin('defensa.tribunal', 'tribunal')
            ->addSelect('estudiante', 'tutor', 'cotutor', 'defensa', 'tribunal')
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

    /**
     * Obtiene estadísticas de TFGs por área de conocimiento
     * Como no tenemos campo área, usamos palabras clave como proxy
     */
    public function getEstadisticasPorArea(): array
    {
        // Como no tenemos un campo específico para área, vamos a agrupar por las palabras clave más comunes
        $qb = $this->createQueryBuilder('t');

        $result = $qb
            ->select('t.palabrasClave')
            ->where('t.palabrasClave IS NOT NULL')
            ->andWhere('t.palabrasClave != :empty')
            ->setParameter('empty', '[]')
            ->getQuery()
            ->getResult();

        $areaStats = [];

        foreach ($result as $tfg) {
            $palabrasClave = $tfg['palabrasClave'];

            if (is_string($palabrasClave)) {
                $palabrasClave = json_decode($palabrasClave, true) ?? [];
            }

            foreach ($palabrasClave as $palabra) {
                $palabra = strtolower(trim($palabra));
                if (!empty($palabra)) {
                    $area = $this->mapToArea($palabra);
                    $areaStats[$area] = ($areaStats[$area] ?? 0) + 1;
                }
            }
        }

        // Si no hay datos, devolver estadísticas por defecto
        if (empty($areaStats)) {
            $areaStats = [
                'Ingeniería de Software' => 0,
                'Inteligencia Artificial' => 0,
                'Bases de Datos' => 0,
                'Redes y Sistemas' => 0,
                'Desarrollo Web' => 0,
                'Otros' => 0
            ];
        }

        return $areaStats;
    }

    /**
     * Mapea palabras clave a áreas de conocimiento
     */
    private function mapToArea(string $palabra): string
    {
        $areas = [
            'Ingeniería de Software' => ['software', 'desarrollo', 'programacion', 'aplicacion', 'sistema'],
            'Inteligencia Artificial' => ['ia', 'inteligencia', 'artificial', 'machine', 'learning', 'deep'],
            'Bases de Datos' => ['base', 'datos', 'database', 'mysql', 'postgresql', 'sql'],
            'Redes y Sistemas' => ['red', 'redes', 'sistema', 'sistemas', 'server', 'servidor'],
            'Desarrollo Web' => ['web', 'frontend', 'backend', 'javascript', 'react', 'angular', 'vue']
        ];

        foreach ($areas as $area => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($palabra, $keyword)) {
                    return $area;
                }
            }
        }

        return 'Otros';
    }

    /**
     * Encuentra un TFG por ID con todas las relaciones cargadas para voters
     */
    public function findWithAllRelations(int $id): ?TFG
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('t.tutor', 'tutor')
            ->leftJoin('t.cotutor', 'cotutor')
            ->leftJoin('t.defensa', 'd')
            ->leftJoin('d.tribunal', 'tr')
            ->leftJoin('tr.presidente', 'p')
            ->leftJoin('tr.secretario', 's')
            ->leftJoin('tr.vocal', 'v')
            ->addSelect('e', 'tutor', 'cotutor', 'd', 'tr', 'p', 's', 'v')
            ->where('t.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }
}