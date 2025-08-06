<?php

namespace App\Entity;

use App\Repository\ComentarioRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ComentarioRepository::class)]
#[ORM\Table(name: 'comentarios')]
#[ORM\HasLifecycleCallbacks]
class Comentario
{
    // Tipos de comentario
    public const TIPO_REVISION = 'revision';
    public const TIPO_FEEDBACK = 'feedback';
    public const TIPO_APROBACION = 'aprobacion';

    public const TIPOS_VALIDOS = [
        self::TIPO_REVISION,
        self::TIPO_FEEDBACK,
        self::TIPO_APROBACION,
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: TFG::class, inversedBy: 'comentarios')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?TFG $tfg = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $autor = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $comentario = null;

    #[ORM\Column(length: 50, options: ['default' => 'feedback'])]
    private ?string $tipo = self::TIPO_FEEDBACK;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    public function __construct()
    {
        $this->tipo = self::TIPO_FEEDBACK;
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTfg(): ?TFG
    {
        return $this->tfg;
    }

    public function setTfg(?TFG $tfg): static
    {
        $this->tfg = $tfg;
        return $this;
    }

    public function getAutor(): ?User
    {
        return $this->autor;
    }

    public function setAutor(?User $autor): static
    {
        $this->autor = $autor;
        return $this;
    }

    public function getComentario(): ?string
    {
        return $this->comentario;
    }

    public function setComentario(string $comentario): static
    {
        $this->comentario = $comentario;
        return $this;
    }

    public function getTipo(): ?string
    {
        return $this->tipo;
    }

    public function setTipo(string $tipo): static
    {
        if (!in_array($tipo, self::TIPOS_VALIDOS)) {
            throw new \InvalidArgumentException("Tipo '$tipo' no válido");
        }
        $this->tipo = $tipo;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    /**
     * Métodos auxiliares
     */
    public function isRevision(): bool
    {
        return $this->tipo === self::TIPO_REVISION;
    }

    public function isFeedback(): bool
    {
        return $this->tipo === self::TIPO_FEEDBACK;
    }

    public function isAprobacion(): bool
    {
        return $this->tipo === self::TIPO_APROBACION;
    }

    public function getIcono(): string
    {
        return match ($this->tipo) {
            self::TIPO_REVISION => '🔍',
            self::TIPO_APROBACION => '✅',
            default => '💬'
        };
    }

    public function getColorClass(): string
    {
        return match ($this->tipo) {
            self::TIPO_REVISION => 'text-yellow-600 bg-yellow-50 border-yellow-200',
            self::TIPO_APROBACION => 'text-green-600 bg-green-50 border-green-200',
            default => 'text-blue-600 bg-blue-50 border-blue-200'
        };
    }

    public function getTipoLabel(): string
    {
        return match ($this->tipo) {
            self::TIPO_REVISION => 'Revisión',
            self::TIPO_APROBACION => 'Aprobación',
            default => 'Comentario'
        };
    }

    public function getFormattedCreatedAt(): string
    {
        if (!$this->createdAt) {
            return '';
        }

        $now = new \DateTime();
        $diff = $now->diff($this->createdAt);

        if ($diff->days > 30) {
            return $this->createdAt->format('d/m/Y');
        } elseif ($diff->days > 0) {
            return $diff->days === 1 ? 'Hace 1 día' : "Hace {$diff->days} días";
        } elseif ($diff->h > 0) {
            return $diff->h === 1 ? 'Hace 1 hora' : "Hace {$diff->h} horas";
        } elseif ($diff->i > 0) {
            return $diff->i === 1 ? 'Hace 1 minuto' : "Hace {$diff->i} minutos";
        } else {
            return 'Ahora mismo';
        }
    }

    public function getResumen(int $length = 100): string
    {
        if (!$this->comentario) {
            return '';
        }

        if (strlen($this->comentario) <= $length) {
            return $this->comentario;
        }

        return substr($this->comentario, 0, $length) . '...';
    }

    public function canBeEditedBy(User $user): bool
    {
        // Solo el autor puede editar sus comentarios
        // Y solo dentro de las primeras 24 horas
        if ($this->autor !== $user) {
            return false;
        }

        if (!$this->createdAt) {
            return false;
        }

        $limitTime = clone $this->createdAt;
        $limitTime->modify('+24 hours');

        return new \DateTime() < $limitTime;
    }

    public function canBeDeletedBy(User $user): bool
    {
        // El autor puede eliminar sus comentarios
        // Los administradores pueden eliminar cualquier comentario
        return $this->autor === $user || $user->hasRole('ROLE_ADMIN');
    }

    public function isFromTutor(): bool
    {
        if (!$this->tfg || !$this->autor) {
            return false;
        }

        return $this->tfg->getTutor() === $this->autor || 
               $this->tfg->getCotutor() === $this->autor;
    }

    public function isFromEstudiante(): bool
    {
        if (!$this->tfg || !$this->autor) {
            return false;
        }

        return $this->tfg->getEstudiante() === $this->autor;
    }

    public function isRecent(): bool
    {
        if (!$this->createdAt) {
            return false;
        }

        $yesterday = new \DateTime('-1 day');
        return $this->createdAt > $yesterday;
    }

    public function __toString(): string
    {
        $autor = $this->autor?->getNombreCompleto() ?? 'Autor desconocido';
        $resumen = $this->getResumen(50);
        return "Comentario de {$autor}: {$resumen}";
    }
}