<?php

namespace App\Repository;

use App\Entity\Calificacion;
use App\Entity\Defensa;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Calificacion>
 */
class CalificacionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Calificacion::class);
    }

    /**
     * Calcula la nota final promedio de todas las calificaciones de una defensa
     */
    public function calcularNotaFinal(Defensa $defensa): ?float
    {
        $result = $this->createQueryBuilder('c')
            ->select('AVG(c.notaFinal) as promedio')
            ->where('c.defensa = :defensa')
            ->andWhere('c.notaFinal IS NOT NULL')
            ->setParameter('defensa', $defensa)
            ->getQuery()
            ->getSingleScalarResult();

        return $result ? round((float) $result, 2) : null;
    }

    /**
     * Encuentra todas las calificaciones de una defensa
     */
    public function findByDefensa(Defensa $defensa): array
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.evaluador', 'e')
            ->addSelect('e')
            ->where('c.defensa = :defensa')
            ->setParameter('defensa', $defensa)
            ->orderBy('c.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra calificaciones por evaluador
     */
    public function findByEvaluador(User $evaluador, int $limit = null): array
    {
        $qb = $this->createQueryBuilder('c')
            ->leftJoin('c.defensa', 'd')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->addSelect('d', 't', 'e')
            ->where('c.evaluador = :evaluador')
            ->setParameter('evaluador', $evaluador)
            ->orderBy('c.createdAt', 'DESC');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Verifica si un evaluador ya ha calificado una defensa específica
     */
    public function hasEvaluadorCalificado(Defensa $defensa, User $evaluador): bool
    {
        $count = $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->where('c.defensa = :defensa')
            ->andWhere('c.evaluador = :evaluador')
            ->setParameter('defensa', $defensa)
            ->setParameter('evaluador', $evaluador)
            ->getQuery()
            ->getSingleScalarResult();

        return $count > 0;
    }

    /**
     * Cuenta cuántos evaluadores han calificado una defensa
     */
    public function countCalificacionesByDefensa(Defensa $defensa): int
    {
        return $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->where('c.defensa = :defensa')
            ->setParameter('defensa', $defensa)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Encuentra defensas pendientes de calificar por un evaluador
     */
    public function findDefensasPendientes(User $evaluador): array
    {
        // Subconsulta para defensas ya calificadas por este evaluador
        $subQb = $this->getEntityManager()->createQueryBuilder()
            ->select('IDENTITY(c2.defensa)')
            ->from(Calificacion::class, 'c2')
            ->where('c2.evaluador = :evaluador');

        return $this->getEntityManager()->createQueryBuilder()
            ->select('d')
            ->from('App\Entity\Defensa', 'd')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('d.tribunal', 'tr')
            ->addSelect('t', 'e', 'tr')
            ->where('d.estado = :completada')
            ->andWhere('tr.presidente = :evaluador OR tr.secretario = :evaluador OR tr.vocal = :evaluador')
            ->andWhere($subQb->expr()->notIn('d.id', $subQb->getDQL()))
            ->setParameter('completada', 'completada')
            ->setParameter('evaluador', $evaluador)
            ->orderBy('d.fechaDefensa', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Obtiene estadísticas de calificaciones por evaluador
     */
    public function getEstadisticasEvaluador(User $evaluador): array
    {
        $stats = $this->createQueryBuilder('c')
            ->select('
                COUNT(c.id) as total_calificaciones,
                AVG(c.notaFinal) as promedio_notas,
                MIN(c.notaFinal) as nota_minima,
                MAX(c.notaFinal) as nota_maxima
            ')
            ->where('c.evaluador = :evaluador')
            ->andWhere('c.notaFinal IS NOT NULL')
            ->setParameter('evaluador', $evaluador)
            ->getQuery()
            ->getSingleResult();

        // Distribución por niveles
        $distribucion = $this->createQueryBuilder('c')
            ->select('
                SUM(CASE WHEN c.notaFinal >= 9.0 THEN 1 ELSE 0 END) as sobresaliente,
                SUM(CASE WHEN c.notaFinal >= 7.0 AND c.notaFinal < 9.0 THEN 1 ELSE 0 END) as notable,
                SUM(CASE WHEN c.notaFinal >= 5.0 AND c.notaFinal < 7.0 THEN 1 ELSE 0 END) as aprobado,
                SUM(CASE WHEN c.notaFinal < 5.0 THEN 1 ELSE 0 END) as suspenso
            ')
            ->where('c.evaluador = :evaluador')
            ->andWhere('c.notaFinal IS NOT NULL')
            ->setParameter('evaluador', $evaluador)
            ->getQuery()
            ->getSingleResult();

        return [
            'total_calificaciones' => (int) $stats['total_calificaciones'],
            'promedio_notas' => $stats['promedio_notas'] ? round((float) $stats['promedio_notas'], 2) : 0,
            'nota_minima' => $stats['nota_minima'] ? (float) $stats['nota_minima'] : 0,
            'nota_maxima' => $stats['nota_maxima'] ? (float) $stats['nota_maxima'] : 0,
            'distribucion' => [
                'sobresaliente' => (int) $distribucion['sobresaliente'],
                'notable' => (int) $distribucion['notable'],
                'aprobado' => (int) $distribucion['aprobado'],
                'suspenso' => (int) $distribucion['suspenso']
            ]
        ];
    }

    /**
     * Obtiene estadísticas generales del sistema de calificaciones
     */
    public function getEstadisticasGenerales(): array
    {
        // Estadísticas básicas
        $stats = $this->createQueryBuilder('c')
            ->select('
                COUNT(c.id) as total_calificaciones,
                AVG(c.notaFinal) as promedio_general,
                MIN(c.notaFinal) as nota_minima,
                MAX(c.notaFinal) as nota_maxima
            ')
            ->where('c.notaFinal IS NOT NULL')
            ->getQuery()
            ->getSingleResult();

        // Distribución por niveles
        $distribucion = $this->createQueryBuilder('c')
            ->select('
                SUM(CASE WHEN c.notaFinal >= 9.0 THEN 1 ELSE 0 END) as sobresaliente,
                SUM(CASE WHEN c.notaFinal >= 7.0 AND c.notaFinal < 9.0 THEN 1 ELSE 0 END) as notable,
                SUM(CASE WHEN c.notaFinal >= 5.0 AND c.notaFinal < 7.0 THEN 1 ELSE 0 END) as aprobado,
                SUM(CASE WHEN c.notaFinal < 5.0 THEN 1 ELSE 0 END) as suspenso
            ')
            ->where('c.notaFinal IS NOT NULL')
            ->getQuery()
            ->getSingleResult();

        // Evaluadores más activos
        $evaluadoresActivos = $this->createQueryBuilder('c')
            ->select('e.id, e.nombre, e.apellidos, COUNT(c.id) as total_evaluaciones')
            ->leftJoin('c.evaluador', 'e')
            ->groupBy('e.id')
            ->orderBy('total_evaluaciones', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();

        // Promedio de notas por mes (últimos 12 meses)
        $promediosPorMes = $this->createQueryBuilder('c')
            ->select('YEAR(c.createdAt) as anio, MONTH(c.createdAt) as mes, AVG(c.notaFinal) as promedio')
            ->where('c.createdAt >= :hace12meses')
            ->andWhere('c.notaFinal IS NOT NULL')
            ->setParameter('hace12meses', new \DateTime('-12 months'))
            ->groupBy('anio', 'mes')
            ->orderBy('anio', 'DESC')
            ->addOrderBy('mes', 'DESC')
            ->getQuery()
            ->getResult();

        return [
            'resumen' => [
                'total_calificaciones' => (int) $stats['total_calificaciones'],
                'promedio_general' => $stats['promedio_general'] ? round((float) $stats['promedio_general'], 2) : 0,
                'nota_minima' => $stats['nota_minima'] ? (float) $stats['nota_minima'] : 0,
                'nota_maxima' => $stats['nota_maxima'] ? (float) $stats['nota_maxima'] : 0
            ],
            'distribucion' => [
                'sobresaliente' => (int) $distribucion['sobresaliente'],
                'notable' => (int) $distribucion['notable'],
                'aprobado' => (int) $distribucion['aprobado'],
                'suspenso' => (int) $distribucion['suspenso']
            ],
            'evaluadores_activos' => $evaluadoresActivos,
            'evolucion_mensual' => $promediosPorMes
        ];
    }

    /**
     * Encuentra calificaciones con discrepancias significativas
     */
    public function findCalificacionesConDiscrepancias(float $umbralDiferencia = 2.0): array
    {
        // Buscar defensas donde hay gran diferencia entre las calificaciones
        $defensasConDiscrepancias = $this->createQueryBuilder('c')
            ->select('IDENTITY(c.defensa) as defensa_id, MIN(c.notaFinal) as nota_min, MAX(c.notaFinal) as nota_max')
            ->where('c.notaFinal IS NOT NULL')
            ->groupBy('c.defensa')
            ->having('(nota_max - nota_min) >= :umbral')
            ->setParameter('umbral', $umbralDiferencia)
            ->getQuery()
            ->getResult();

        if (empty($defensasConDiscrepancias)) {
            return [];
        }

        $defensaIds = array_column($defensasConDiscrepancias, 'defensa_id');

        // Obtener las calificaciones completas de esas defensas
        return $this->createQueryBuilder('c')
            ->leftJoin('c.defensa', 'd')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('c.evaluador', 'ev')
            ->addSelect('d', 't', 'e', 'ev')
            ->where('c.defensa IN (:defensaIds)')
            ->setParameter('defensaIds', $defensaIds)
            ->orderBy('c.defensa', 'ASC')
            ->addOrderBy('c.notaFinal', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Obtiene el ranking de mejores TFGs por calificación
     */
    public function getRankingMejoresTFGs(int $limit = 20): array
    {
        return $this->createQueryBuilder('c')
            ->select('
                t.id as tfg_id,
                t.titulo,
                e.nombre,
                e.apellidos,
                AVG(c.notaFinal) as nota_promedio,
                COUNT(c.id) as num_calificaciones
            ')
            ->leftJoin('c.defensa', 'd')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->where('c.notaFinal IS NOT NULL')
            ->groupBy('t.id')
            ->having('num_calificaciones >= 3') // Al menos 3 calificaciones
            ->orderBy('nota_promedio', 'DESC')
            ->addOrderBy('num_calificaciones', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Busca calificaciones incompletas (faltan notas parciales)
     */
    public function findCalificacionesIncompletas(): array
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.defensa', 'd')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('c.evaluador', 'ev')
            ->addSelect('d', 't', 'e', 'ev')
            ->where('c.notaPresentacion IS NULL OR c.notaContenido IS NULL OR c.notaDefensa IS NULL')
            ->orderBy('c.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Obtiene calificaciones por rango de fechas
     */
    public function findByDateRange(\DateTimeInterface $inicio, \DateTimeInterface $fin): array
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.defensa', 'd')
            ->leftJoin('d.tfg', 't')
            ->leftJoin('t.estudiante', 'e')
            ->leftJoin('c.evaluador', 'ev')
            ->addSelect('d', 't', 'e', 'ev')
            ->where('c.createdAt BETWEEN :inicio AND :fin')
            ->setParameter('inicio', $inicio)
            ->setParameter('fin', $fin)
            ->orderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Elimina calificaciones huérfanas (sin defensa válida)
     */
    public function cleanupOrphanedCalificaciones(): int
    {
        return $this->createQueryBuilder('c')
            ->delete()
            ->where('c.defensa IS NULL')
            ->getQuery()
            ->execute();
    }

    public function save(Calificacion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Calificacion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}