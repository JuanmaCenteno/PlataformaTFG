<?php

namespace App\Repository;

use App\Entity\Defensa;
use App\Entity\User;
use App\Entity\Tribunal;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Defensa>
 */
class DefensaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Defensa::class);
    }

    /**
     * Encuentra todas las defensas paginadas con filtros
     */
    public function findAllPaginated(
        int $page = 1, 
        int $perPage = 10, 
        ?string $estado = null,
        ?string $fechaInicio = null,
        ?string $fechaFin = null
    ): array {
        $qb = $this->createQueryBuilder('d')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('d.tribunal', 'tr')
            ->leftJoin('tr.presidente', 'p')
            ->addSelect('t', 'e', 'tr', 'p')
            ->orderBy('d.fechaDefensa', 'DESC');

        // Filtro por estado
        if ($estado) {
            $qb->andWhere('d.estado = :estado')
               ->setParameter('estado', $estado);
        }

        // Filtro por rango de fechas
        if ($fechaInicio) {
            try {
                $inicio = new \DateTime($fechaInicio);
                $qb->andWhere('d.fechaDefensa >= :fechaInicio')
                   ->setParameter('fechaInicio', $inicio);
            } catch (\Exception $e) {}
        }

        if ($fechaFin) {
            try {
                $fin = new \DateTime($fechaFin);
                $qb->andWhere('d.fechaDefensa <= :fechaFin')
                   ->setParameter('fechaFin', $fin);
            } catch (\Exception $e) {}
        }

        // Total count
        $totalQb = clone $qb;
        $total = $totalQb->select('COUNT(DISTINCT d.id)')->getQuery()->getSingleScalarResult();

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
     * Encuentra defensas donde el usuario es miembro del tribunal
     */
    public function findByTribunalMember(
        User $usuario,
        int $page = 1,
        int $perPage = 10,
        ?string $estado = null,
        ?string $fechaInicio = null,
        ?string $fechaFin = null
    ): array {
        $qb = $this->createQueryBuilder('d')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('d.tribunal', 'tr')
            ->leftJoin('tr.presidente', 'p')
            ->leftJoin('tr.secretario', 's')
            ->leftJoin('tr.vocal', 'v')
            ->addSelect('t', 'e', 'tr', 'p', 's', 'v')
            ->where('tr.presidente = :usuario OR tr.secretario = :usuario OR tr.vocal = :usuario')
            ->setParameter('usuario', $usuario)
            ->orderBy('d.fechaDefensa', 'DESC');

        // Aplicar filtros similares al método anterior
        if ($estado) {
            $qb->andWhere('d.estado = :estado')
               ->setParameter('estado', $estado);
        }

        if ($fechaInicio) {
            try {
                $inicio = new \DateTime($fechaInicio);
                $qb->andWhere('d.fechaDefensa >= :fechaInicio')
                   ->setParameter('fechaInicio', $inicio);
            } catch (\Exception $e) {}
        }

        if ($fechaFin) {
            try {
                $fin = new \DateTime($fechaFin);
                $qb->andWhere('d.fechaDefensa <= :fechaFin')
                   ->setParameter('fechaFin', $fin);
            } catch (\Exception $e) {}
        }

        // Total count
        $totalQb = clone $qb;
        $total = $totalQb->select('COUNT(DISTINCT d.id)')->getQuery()->getSingleScalarResult();

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
     * Encuentra defensas para el calendario (formato FullCalendar)
     */
    public function findForCalendar(User $usuario, \DateTimeInterface $inicio, \DateTimeInterface $fin): array
    {
        $roles = $usuario->getRoles();

        $qb = $this->createQueryBuilder('d')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('d.tribunal', 'tr')
            ->leftJoin('tr.presidente', 'p')
            ->leftJoin('tr.secretario', 's')
            ->leftJoin('tr.vocal', 'v')
            ->addSelect('t', 'e', 'tr', 'p', 's', 'v')
            ->where('d.fechaDefensa BETWEEN :inicio AND :fin')
            ->setParameter('inicio', $inicio)
            ->setParameter('fin', $fin)
            ->orderBy('d.fechaDefensa', 'ASC');

        // Filtrar según rol del usuario
        if (!in_array('ROLE_ADMIN', $roles)) {
            // Si no es admin, solo ver defensas donde participa
            $qb->andWhere(
                'd.tfg IN (
                    SELECT tfg2.id FROM App\Entity\TFG tfg2 
                    WHERE tfg2.estudiante = :usuario 
                    OR tfg2.tutor = :usuario 
                    OR tfg2.cotutor = :usuario
                ) OR tr.presidente = :usuario OR tr.secretario = :usuario OR tr.vocal = :usuario'
            )->setParameter('usuario', $usuario);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Busca conflictos de horario para un tribunal en una fecha específica
     */
    public function findConflict(
        Tribunal $tribunal, 
        \DateTimeInterface $fechaDefensa, 
        int $duracion = 30,
        ?int $excludeDefensaId = null
    ): ?Defensa {
        $fechaInicio = (clone $fechaDefensa)->sub(new \DateInterval('PT' . $duracion . 'M'));
        $fechaFin = (clone $fechaDefensa)->add(new \DateInterval('PT' . $duracion . 'M'));

        $qb = $this->createQueryBuilder('d')
            ->where('d.tribunal = :tribunal')
            ->andWhere('d.estado != :cancelada')
            ->andWhere(
                '(d.fechaDefensa BETWEEN :fechaInicio AND :fechaFin)'
            )
            ->setParameter('tribunal', $tribunal)
            ->setParameter('cancelada', 'cancelada')
            ->setParameter('fechaInicio', $fechaInicio)
            ->setParameter('fechaFin', $fechaFin)
            ->setMaxResults(1);

        if ($excludeDefensaId) {
            $qb->andWhere('d.id != :excludeId')
               ->setParameter('excludeId', $excludeDefensaId);
        }

        return $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * Busca conflictos de aula en una fecha específica
     */
    public function findAulaConflict(
        string $aula, 
        \DateTimeInterface $fechaDefensa, 
        int $duracion = 30,
        ?int $excludeDefensaId = null
    ): ?Defensa {
        $fechaInicio = (clone $fechaDefensa)->sub(new \DateInterval('PT' . $duracion . 'M'));
        $fechaFin = (clone $fechaDefensa)->add(new \DateInterval('PT' . $duracion . 'M'));

        $qb = $this->createQueryBuilder('d')
            ->where('d.aula = :aula')
            ->andWhere('d.estado != :cancelada')
            ->andWhere(
                '(d.fechaDefensa BETWEEN :fechaInicio AND :fechaFin)'
            )
            ->setParameter('aula', $aula)
            ->setParameter('cancelada', 'cancelada')
            ->setParameter('fechaInicio', $fechaInicio)
            ->setParameter('fechaFin', $fechaFin)
            ->setMaxResults(1);

        if ($excludeDefensaId) {
            $qb->andWhere('d.id != :excludeId')
               ->setParameter('excludeId', $excludeDefensaId);
        }

        return $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * Encuentra defensas programadas para hoy
     */
    public function findDefensasHoy(): array
    {
        $hoy = new \DateTime('today');
        $manana = new \DateTime('tomorrow');

        return $this->createQueryBuilder('d')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('d.tribunal', 'tr')
            ->addSelect('t', 'e', 'tr')
            ->where('d.fechaDefensa >= :hoy')
            ->andWhere('d.fechaDefensa < :manana')
            ->andWhere('d.estado = :programada')
            ->setParameter('hoy', $hoy)
            ->setParameter('manana', $manana)
            ->setParameter('programada', 'programada')
            ->orderBy('d.fechaDefensa', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra defensas próximas (para recordatorios)
     */
    public function findProximasDefensas(int $horasAnticipacion = 24): array
    {
        $ahora = new \DateTime();
        $limite = (clone $ahora)->add(new \DateInterval('PT' . $horasAnticipacion . 'H'));

        return $this->createQueryBuilder('d')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('d.tribunal', 'tr')
            ->leftJoin('tr.presidente', 'p')
            ->leftJoin('tr.secretario', 's')
            ->leftJoin('tr.vocal', 'v')
            ->addSelect('t', 'e', 'tr', 'p', 's', 'v')
            ->where('d.fechaDefensa BETWEEN :ahora AND :limite')
            ->andWhere('d.estado = :programada')
            ->setParameter('ahora', $ahora)
            ->setParameter('limite', $limite)
            ->setParameter('programada', 'programada')
            ->orderBy('d.fechaDefensa', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Obtiene estadísticas de defensas
     */
    public function getEstadisticas(): array
    {
        // Total por estado
        $estadoStats = $this->createQueryBuilder('d')
            ->select('d.estado, COUNT(d.id) as total')
            ->groupBy('d.estado')
            ->getQuery()
            ->getResult();

        // Defensas por mes (últimos 12 meses)
        $defensasPorMes = $this->createQueryBuilder('d')
            ->select('YEAR(d.fechaDefensa) as anio, MONTH(d.fechaDefensa) as mes, COUNT(d.id) as total')
            ->where('d.fechaDefensa >= :hace12meses')
            ->andWhere('d.estado != :cancelada')
            ->setParameter('hace12meses', new \DateTime('-12 months'))
            ->setParameter('cancelada', 'cancelada')
            ->groupBy('anio', 'mes')
            ->orderBy('anio', 'DESC')
            ->addOrderBy('mes', 'DESC')
            ->getQuery()
            ->getResult();

        // Tribunales más activos
        $tribunalesActivos = $this->createQueryBuilder('d')
            ->select('tr.id, tr.nombre, COUNT(d.id) as total_defensas')
            ->leftJoin('d.tribunal', 'tr')
            ->where('d.estado = :completada')
            ->setParameter('completada', 'completada')
            ->groupBy('tr.id')
            ->orderBy('total_defensas', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();

        // Promedio de duración de defensas
        $duracionPromedio = $this->createQueryBuilder('d')
            ->select('AVG(d.duracionEstimada) as duracion_promedio')
            ->where('d.estado = :completada')
            ->setParameter('completada', 'completada')
            ->getQuery()
            ->getSingleScalarResult();

        return [
            'por_estado' => $estadoStats,
            'por_mes' => $defensasPorMes,
            'tribunales_activos' => $tribunalesActivos,
            'duracion_promedio' => round($duracionPromedio ?? 30, 2)
        ];
    }

    /**
     * Encuentra defensas pendientes de calificar
     */
    public function findPendientesDeCalificar(User $evaluador): array
    {
        return $this->createQueryBuilder('d')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('t.tutor', 'tu')
            ->leftJoin('d.tribunal', 'tr')
            ->leftJoin('tr.presidente', 'tp')
            ->leftJoin('tr.secretario', 'ts')
            ->leftJoin('tr.vocal', 'tv')
            ->leftJoin('d.calificaciones', 'c', 'WITH', 'c.evaluador = :evaluador')
            ->addSelect('t', 'e', 'tu', 'tr', 'tp', 'ts', 'tv')
            ->where('d.estado = :completada')
            ->andWhere('tr.presidente = :evaluador OR tr.secretario = :evaluador OR tr.vocal = :evaluador')
            ->andWhere('c.id IS NULL') // No tiene calificación de este evaluador
            ->setParameter('completada', 'completada')
            ->setParameter('evaluador', $evaluador)
            ->orderBy('d.fechaDefensa', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra defensas por estudiante
     */
    public function findByEstudiante(User $estudiante): array
    {
        return $this->createQueryBuilder('d')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('d.tribunal', 'tr')
            ->leftJoin('tr.presidente', 'p')
            ->addSelect('t', 'tr', 'p')
            ->where('t.estudiante = :estudiante')
            ->setParameter('estudiante', $estudiante)
            ->orderBy('d.fechaDefensa', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra defensas sin acta generada (completadas)
     */
    public function findSinActa(): array
    {
        return $this->createQueryBuilder('d')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('d.tribunal', 'tr')
            ->addSelect('t', 'e', 'tr')
            ->where('d.estado = :completada')
            ->andWhere('d.actaGenerada = false OR d.actaGenerada IS NULL')
            ->setParameter('completada', 'completada')
            ->orderBy('d.fechaDefensa', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Busca defensas por rango de fechas y aula
     */
    public function findByFechaAndAula(
        \DateTimeInterface $fecha, 
        ?string $aula = null
    ): array {
        $inicioDia = (clone $fecha)->setTime(0, 0, 0);
        $finDia = (clone $fecha)->setTime(23, 59, 59);

        $qb = $this->createQueryBuilder('d')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('d.tribunal', 'tr')
            ->addSelect('t', 'e', 'tr')
            ->where('d.fechaDefensa BETWEEN :inicio AND :fin')
            ->andWhere('d.estado != :cancelada')
            ->setParameter('inicio', $inicioDia)
            ->setParameter('fin', $finDia)
            ->setParameter('cancelada', 'cancelada')
            ->orderBy('d.fechaDefensa', 'ASC');

        if ($aula) {
            $qb->andWhere('d.aula = :aula')
               ->setParameter('aula', $aula);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Obtiene la carga de trabajo de un tribunal en un período
     */
    public function getTribunalWorkloadInPeriod(
        Tribunal $tribunal,
        \DateTimeInterface $inicio,
        \DateTimeInterface $fin
    ): array {
        $defensas = $this->createQueryBuilder('d')
            ->select('d.estado, COUNT(d.id) as total')
            ->where('d.tribunal = :tribunal')
            ->andWhere('d.fechaDefensa BETWEEN :inicio AND :fin')
            ->setParameter('tribunal', $tribunal)
            ->setParameter('inicio', $inicio)
            ->setParameter('fin', $fin)
            ->groupBy('d.estado')
            ->getQuery()
            ->getResult();

        $result = [
            'programada' => 0,
            'completada' => 0,
            'cancelada' => 0
        ];

        foreach ($defensas as $defensa) {
            $result[$defensa['estado']] = (int) $defensa['total'];
        }

        $result['total'] = array_sum($result);

        return $result;
    }

    public function save(Defensa $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Defensa $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Obtiene estadísticas de defensas
     */
    public function getEstadisticasDefensas(): array
    {
        $qb = $this->createQueryBuilder('d');

        // Defensas por estado
        $estadosResult = $qb
            ->select('d.estado', 'COUNT(d.id) as total')
            ->groupBy('d.estado')
            ->getQuery()
            ->getResult();

        $estadisticas = [
            'por_estado' => [],
            'total' => 0,
            'programadas' => 0,
            'completadas' => 0,
            'canceladas' => 0,
            'defensas_mes_actual' => 0,
            'promedio_duracion' => 0
        ];

        foreach ($estadosResult as $estado) {
            $estadisticas['por_estado'][$estado['estado']] = (int) $estado['total'];
            $estadisticas['total'] += (int) $estado['total'];

            switch ($estado['estado']) {
                case 'programada':
                    $estadisticas['programadas'] = (int) $estado['total'];
                    break;
                case 'completada':
                    $estadisticas['completadas'] = (int) $estado['total'];
                    break;
                case 'cancelada':
                    $estadisticas['canceladas'] = (int) $estado['total'];
                    break;
            }
        }

        // Defensas del mes actual
        $mesActual = new \DateTime('first day of this month');
        $finMes = new \DateTime('last day of this month');

        $defensasMes = $this->createQueryBuilder('d2')
            ->select('COUNT(d2.id)')
            ->where('d2.fechaDefensa >= :inicio')
            ->andWhere('d2.fechaDefensa <= :fin')
            ->setParameter('inicio', $mesActual)
            ->setParameter('fin', $finMes)
            ->getQuery()
            ->getSingleScalarResult();

        $estadisticas['defensas_mes_actual'] = (int) $defensasMes;

        // Promedio de duración
        $promedioDuracion = $this->createQueryBuilder('d3')
            ->select('AVG(d3.duracionEstimada)')
            ->where('d3.duracionEstimada IS NOT NULL')
            ->getQuery()
            ->getSingleScalarResult();

        $estadisticas['promedio_duracion'] = $promedioDuracion ? round($promedioDuracion, 2) : 0;

        return $estadisticas;
    }
}