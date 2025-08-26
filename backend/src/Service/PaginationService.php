<?php

namespace App\Service;

use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class PaginationService
{
    public function paginate(QueryBuilder $queryBuilder, int $page = 1, int $limit = 10): array
    {
        $paginator = new Paginator($queryBuilder);
        
        $totalItems = count($paginator);
        $totalPages = (int) ceil($totalItems / $limit);
        
        $paginator
            ->getQuery()
            ->setFirstResult($limit * ($page - 1))
            ->setMaxResults($limit);

        return [
            'data' => iterator_to_array($paginator),
            'meta' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $totalItems,
                'total_pages' => $totalPages,
                'has_next' => $page < $totalPages,
                'has_previous' => $page > 1
            ]
        ];
    }
}