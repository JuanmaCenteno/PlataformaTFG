<?php

namespace App\Repository;

use App\Entity\Notificacion;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notificacion>
 */
class NotificacionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notificacion::class);
    }

    /**
     * Encuentra notificaciones de un usuario con filtros y paginación
     */
    public function findByUser(User $usuario, array $filters = []): array
    {
        $page = $filters['page'] ?? 1;
        $perPage = $filters['per_page'] ?? 20;
        $leida = $filters['leida'] ?? null;
        $tipo = $filters['tipo'] ?? null;

        $qb = $this->createQueryBuilder('n')
            ->where('n.usuario = :usuario')
            ->setParameter('usuario', $usuario)
            ->orderBy('n.createdAt', 'DESC');

        // Filtro por estado leído/no leído
        if ($leida !== null) {
            $qb->andWhere('n.leida = :leida')
               ->setParameter('leida', $leida);
        }

        // Filtro por tipo
        if ($tipo) {
            $qb->andWhere('n.tipo = :tipo')
               ->setParameter('tipo', $tipo);
        }

        // Total count
        $totalQb = clone $qb;
        $total = $totalQb->select('COUNT(n.id)')->getQuery()->getSingleScalarResult();

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
     * Encuentra notificaciones no leídas de un usuario
     */
    public function findNoLeidas(User $usuario, int $limite = 10): array
    {
        return $this->createQueryBuilder('n')
            ->where('n.usuario = :usuario')
            ->andWhere('n.leida = false')
            ->setParameter('usuario', $usuario)
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limite)
            ->getQuery()
            ->getResult();
    }

    /**
     * Cuenta notificaciones no leídas de un usuario
     */
    public function countNoLeidas(User $usuario): int
    {
        return $this->createQueryBuilder('n')
            ->select('COUNT(n.id)')
            ->where('n.usuario = :usuario')
            ->andWhere('n.leida = false')
            ->setParameter('usuario', $usuario)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Marca todas las notificaciones de un usuario como leídas
     */
    public function marcarTodasComoLeidas(User $usuario): int
    {
        return $this->createQueryBuilder('n')
            ->update()
            ->set('n.leida', 'true')
            ->set('n.updatedAt', ':now')
            ->where('n.usuario = :usuario')
            ->andWhere('n.leida = false')
            ->setParameter('usuario', $usuario)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->execute();
    }

    /**
     * Elimina notificaciones leídas de un usuario
     */
    public function deleteReadByUser(User $usuario): int
    {
        return $this->createQueryBuilder('n')
            ->delete()
            ->where('n.usuario = :usuario')
            ->andWhere('n.leida = true')
            ->setParameter('usuario', $usuario)
            ->getQuery()
            ->execute();
    }

    /**
     * Elimina notificaciones antiguas de un usuario
     */
    public function deleteOldByUser(User $usuario, int $diasAntiguedad = 30): int
    {
        $fechaLimite = new \DateTime("-{$diasAntiguedad} days");

        return $this->createQueryBuilder('n')
            ->delete()
            ->where('n.usuario = :usuario')
            ->andWhere('n.createdAt < :fecha')
            ->setParameter('usuario', $usuario)
            ->setParameter('fecha', $fechaLimite)
            ->getQuery()
            ->execute();
    }

    /**
     * Elimina todas las notificaciones de un usuario
     */
    public function deleteAllByUser(User $usuario): int
    {
        return $this->createQueryBuilder('n')
            ->delete()
            ->where('n.usuario = :usuario')
            ->setParameter('usuario', $usuario)
            ->getQuery()
            ->execute();
    }

    /**
     * Obtiene estadísticas de notificaciones de un usuario
     */
    public function getUserNotificationStats(User $usuario): array
    {
        // Conteo por tipo y estado
        $stats = $this->createQueryBuilder('n')
            ->select('n.tipo, n.leida, COUNT(n.id) as total')
            ->where('n.usuario = :usuario')
            ->setParameter('usuario', $usuario)
            ->groupBy('n.tipo', 'n.leida')
            ->getQuery()
            ->getResult();

        // Procesar resultados
        $resultado = [
            'total_notificaciones' => 0,
            'no_leidas' => 0,
            'leidas' => 0,
            'por_tipo' => [
                'info' => ['total' => 0, 'leidas' => 0, 'no_leidas' => 0],
                'success' => ['total' => 0, 'leidas' => 0, 'no_leidas' => 0],
                'warning' => ['total' => 0, 'leidas' => 0, 'no_leidas' => 0],
                'error' => ['total' => 0, 'leidas' => 0, 'no_leidas' => 0]
            ]
        ];

        foreach ($stats as $stat) {
            $tipo = $stat['tipo'];
            $leida = $stat['leida'];
            $total = (int) $stat['total'];

            $resultado['total_notificaciones'] += $total;

            if ($leida) {
                $resultado['leidas'] += $total;
                $resultado['por_tipo'][$tipo]['leidas'] = $total;
            } else {
                $resultado['no_leidas'] += $total;
                $resultado['por_tipo'][$tipo]['no_leidas'] = $total;
            }

            $resultado['por_tipo'][$tipo]['total'] += $total;
        }

        // Última notificación
        $ultimaNotificacion = $this->createQueryBuilder('n')
            ->where('n.usuario = :usuario')
            ->setParameter('usuario', $usuario)
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        $resultado['ultima_notificacion'] = $ultimaNotificacion 
            ? $ultimaNotificacion->getCreatedAt()->format('c')
            : null;

        return $resultado;
    }

    /**
     * Obtiene estadísticas globales del sistema
     */
    public function getGlobalStats(): array
    {
        // Total de notificaciones
        $totalNotificaciones = $this->count([]);

        // Notificaciones por tipo
        $porTipo = $this->createQueryBuilder('n')
            ->select('n.tipo, COUNT(n.id) as total')
            ->groupBy('n.tipo')
            ->getQuery()
            ->getResult();

        // Notificaciones por estado
        $porEstado = $this->createQueryBuilder('n')
            ->select('n.leida, COUNT(n.id) as total')
            ->groupBy('n.leida')
            ->getQuery()
            ->getResult();

        // Notificaciones enviadas por email
        $enviadasPorEmail = $this->count(['enviadaPorEmail' => true]);

        // Evolución mensual (últimos 6 meses)
        $hace6meses = new \DateTime('-6 months');
        $evolucionMensual = $this->createQueryBuilder('n')
            ->select('YEAR(n.createdAt) as anio, MONTH(n.createdAt) as mes, COUNT(n.id) as total')
            ->where('n.createdAt >= :fecha')
            ->setParameter('fecha', $hace6meses)
            ->groupBy('anio', 'mes')
            ->orderBy('anio', 'ASC')
            ->addOrderBy('mes', 'ASC')
            ->getQuery()
            ->getResult();

        // Usuarios más activos (con más notificaciones)
        $usuariosMasNotificaciones = $this->createQueryBuilder('n')
            ->select('u.id, u.email, u.nombre, u.apellidos, COUNT(n.id) as total_notificaciones')
            ->leftJoin('n.usuario', 'u')
            ->groupBy('u.id')
            ->orderBy('total_notificaciones', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();

        // Tipos de eventos más frecuentes
        $eventosFrecuentes = $this->createQueryBuilder('n')
            ->select('JSON_EXTRACT(n.metadata, \'$.tipo_evento\') as tipo_evento, COUNT(n.id) as total')
            ->where('JSON_EXTRACT(n.metadata, \'$.tipo_evento\') IS NOT NULL')
            ->groupBy('tipo_evento')
            ->orderBy('total', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();

        return [
            'resumen' => [
                'total_notificaciones' => $totalNotificaciones,
                'enviadas_por_email' => $enviadasPorEmail,
                'porcentaje_email' => $totalNotificaciones > 0 
                    ? round(($enviadasPorEmail / $totalNotificaciones) * 100, 2) 
                    : 0
            ],
            'por_tipo' => $porTipo,
            'por_estado' => $porEstado,
            'evolucion_mensual' => $evolucionMensual,
            'usuarios_mas_notificaciones' => $usuariosMasNotificaciones,
            'eventos_frecuentes' => $eventosFrecuentes
        ];
    }

    /**
     * Encuentra notificaciones pendientes de envío por email
     */
    public function findPendingEmails(int $limite = 50): array
    {
        return $this->createQueryBuilder('n')
            ->leftJoin('n.usuario', 'u')
            ->addSelect('u')
            ->where('n.enviadaPorEmail = false')
            ->andWhere('u.email IS NOT NULL')
            ->andWhere('u.isActive = true')
            ->orderBy('n.createdAt', 'ASC')
            ->setMaxResults($limite)
            ->getQuery()
            ->getResult();
    }

    /**
     * Elimina notificaciones antiguas del sistema
     */
    public function deleteOlderThan(\DateTimeInterface $fecha): int
    {
        return $this->createQueryBuilder('n')
            ->delete()
            ->where('n.createdAt < :fecha')
            ->setParameter('fecha', $fecha)
            ->getQuery()
            ->execute();
    }

    /**
     * Encuentra notificaciones para exportación
     */
    public function findForExport(
        \DateTimeInterface $inicio, 
        \DateTimeInterface $fin, 
        ?string $tipo = null
    ): array {
        $qb = $this->createQueryBuilder('n')
            ->leftJoin('n.usuario', 'u')
            ->addSelect('u')
            ->where('n.createdAt BETWEEN :inicio AND :fin')
            ->setParameter('inicio', $inicio)
            ->setParameter('fin', $fin)
            ->orderBy('n.createdAt', 'DESC');

        if ($tipo) {
            $qb->andWhere('n.tipo = :tipo')
               ->setParameter('tipo', $tipo);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Encuentra notificaciones por metadata específica
     */
    public function findByMetadata(string $key, $value, int $limite = 100): array
    {
        return $this->createQueryBuilder('n')
            ->where('JSON_EXTRACT(n.metadata, :key) = :value')
            ->setParameter('key', '$.' . $key)
            ->setParameter('value', $value)
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limite)
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra notificaciones de un evento específico
     */
    public function findByTipoEvento(string $tipoEvento, int $limite = 50): array
    {
        return $this->findByMetadata('tipo_evento', $tipoEvento, $limite);
    }

    /**
     * Obtiene el conteo de notificaciones por día en un rango
     */
    public function getNotificationsByDateRange(
        \DateTimeInterface $inicio, 
        \DateTimeInterface $fin
    ): array {
        return $this->createQueryBuilder('n')
            ->select('DATE(n.createdAt) as fecha, COUNT(n.id) as total')
            ->where('n.createdAt BETWEEN :inicio AND :fin')
            ->setParameter('inicio', $inicio)
            ->setParameter('fin', $fin)
            ->groupBy('fecha')
            ->orderBy('fecha', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra usuarios con más notificaciones no leídas
     */
    public function findUsersWithMostUnread(int $limite = 20): array
    {
        return $this->createQueryBuilder('n')
            ->select('u.id, u.email, u.nombre, u.apellidos, COUNT(n.id) as no_leidas')
            ->leftJoin('n.usuario', 'u')
            ->where('n.leida = false')
            ->andWhere('u.isActive = true')
            ->groupBy('u.id')
            ->orderBy('no_leidas', 'DESC')
            ->setMaxResults($limite)
            ->getQuery()
            ->getResult();
    }

    /**
     * Busca notificaciones por texto en título o mensaje
     */
    public function searchNotifications(string $searchTerm, ?User $usuario = null, int $limite = 50): array
    {
        $qb = $this->createQueryBuilder('n')
            ->where('n.titulo LIKE :search OR n.mensaje LIKE :search')
            ->setParameter('search', '%' . $searchTerm . '%')
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limite);

        if ($usuario) {
            $qb->andWhere('n.usuario = :usuario')
               ->setParameter('usuario', $usuario);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Obtiene estadísticas de rendimiento de emails
     */
    public function getEmailPerformanceStats(): array
    {
        // Notificaciones enviadas por email en los últimos 30 días
        $hace30dias = new \DateTime('-30 days');
        
        $emailStats = $this->createQueryBuilder('n')
            ->select('
                COUNT(n.id) as total_emails_enviados,
                AVG(CASE WHEN n.leida = true THEN 1 ELSE 0 END) * 100 as tasa_apertura
            ')
            ->where('n.enviadaPorEmail = true')
            ->andWhere('n.createdAt >= :fecha')
            ->setParameter('fecha', $hace30dias)
            ->getQuery()
            ->getSingleResult();

        // Evolución diaria de emails
        $evolucionEmails = $this->createQueryBuilder('n')
            ->select('DATE(n.createdAt) as fecha, COUNT(n.id) as emails_enviados')
            ->where('n.enviadaPorEmail = true')
            ->andWhere('n.createdAt >= :fecha')
            ->setParameter('fecha', $hace30dias)
            ->groupBy('fecha')
            ->orderBy('fecha', 'ASC')
            ->getQuery()
            ->getResult();

        return [
            'resumen' => [
                'total_emails_enviados' => (int) $emailStats['total_emails_enviados'],
                'tasa_apertura' => round((float) $emailStats['tasa_apertura'], 2)
            ],
            'evolucion_diaria' => $evolucionEmails
        ];
    }

    /**
     * Encuentra notificaciones duplicadas
     */
    public function findDuplicateNotifications(): array
    {
        return $this->createQueryBuilder('n1')
            ->select('n1.usuario, n1.titulo, n1.mensaje, COUNT(n1.id) as duplicados')
            ->where('EXISTS (
                SELECT n2.id FROM App\Entity\Notificacion n2 
                WHERE n2.usuario = n1.usuario 
                AND n2.titulo = n1.titulo 
                AND n2.mensaje = n1.mensaje 
                AND n2.id != n1.id 
                AND ABS(TIMESTAMPDIFF(MINUTE, n2.createdAt, n1.createdAt)) <= 5
            )')
            ->groupBy('n1.usuario', 'n1.titulo', 'n1.mensaje')
            ->having('COUNT(n1.id) > 1')
            ->getQuery()
            ->getResult();
    }

    /**
     * Obtiene el promedio de tiempo hasta que se leen las notificaciones
     */
    public function getAverageTimeToRead(): ?float
    {
        $result = $this->createQueryBuilder('n')
            ->select('AVG(TIMESTAMPDIFF(HOUR, n.createdAt, n.updatedAt)) as promedio_horas')
            ->where('n.leida = true')
            ->andWhere('n.updatedAt > n.createdAt')
            ->getQuery()
            ->getSingleScalarResult();

        return $result ? round((float) $result, 2) : null;
    }

    public function save(Notificacion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Notificacion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}