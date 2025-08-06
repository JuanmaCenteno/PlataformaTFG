<?php

namespace App\Entity;

use App\Repository\NotificacionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificacionRepository::class)]
#[ORM\Table(name: 'notificaciones')]
#[ORM\HasLifecycleCallbacks]
class Notificacion
{
    // Tipos de notificación
    public const TIPO_INFO = 'info';
    public const TIPO_WARNING = 'warning';
    public const TIPO_SUCCESS = 'success';
    public const TIPO_ERROR = 'error';

    public const TIPOS_VALIDOS = [
        self::TIPO_INFO,
        self::TIPO_WARNING,
        self::TIPO_SUCCESS,
        self::TIPO_ERROR,
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $usuario = null;

    #[ORM\Column(length: 50, options: ['default' => 'info'])]
    private ?string $tipo = self::TIPO_INFO;

    #[ORM\Column(length: 255)]
    private ?string $titulo = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $mensaje = null;

    #[ORM\Column(options: ['default' => false])]
    private ?bool $leida = false;

    #[ORM\Column(options: ['default' => false])]
    private ?bool $enviadaPorEmail = false;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $metadata = [];

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    public function __construct()
    {
        $this->tipo = self::TIPO_INFO;
        $this->leida = false;
        $this->enviadaPorEmail = false;
        $this->metadata = [];
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsuario(): ?User
    {
        return $this->usuario;
    }

    public function setUsuario(?User $usuario): static
    {
        $this->usuario = $usuario;
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

    public function getTitulo(): ?string
    {
        return $this->titulo;
    }

    public function setTitulo(string $titulo): static
    {
        $this->titulo = $titulo;
        return $this;
    }

    public function getMensaje(): ?string
    {
        return $this->mensaje;
    }

    public function setMensaje(string $mensaje): static
    {
        $this->mensaje = $mensaje;
        return $this;
    }

    public function isLeida(): ?bool
    {
        return $this->leida;
    }

    public function setLeida(bool $leida): static
    {
        $this->leida = $leida;
        return $this;
    }

    public function isEnviadaPorEmail(): ?bool
    {
        return $this->enviadaPorEmail;
    }

    public function setEnviadaPorEmail(bool $enviadaPorEmail): static
    {
        $this->enviadaPorEmail = $enviadaPorEmail;
        return $this;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function setMetadata(?array $metadata): static
    {
        $this->metadata = $metadata;
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
    public function marcarComoLeida(): static
    {
        $this->leida = true;
        return $this;
    }

    public function marcarComoNoLeida(): static
    {
        $this->leida = false;
        return $this;
    }

    public function addMetadata(string $key, mixed $value): static
    {
        if ($this->metadata === null) {
            $this->metadata = [];
        }
        $this->metadata[$key] = $value;
        return $this;
    }

    public function getMetadataValue(string $key): mixed
    {
        return $this->metadata[$key] ?? null;
    }

    public function hasMetadata(string $key): bool
    {
        return isset($this->metadata[$key]);
    }

    public function getIcono(): string
    {
        return match ($this->tipo) {
            self::TIPO_SUCCESS => '✅',
            self::TIPO_WARNING => '⚠️',
            self::TIPO_ERROR => '❌',
            default => 'ℹ️'
        };
    }

    public function getColorClass(): string
    {
        return match ($this->tipo) {
            self::TIPO_SUCCESS => 'text-green-600 bg-green-50',
            self::TIPO_WARNING => 'text-yellow-600 bg-yellow-50',
            self::TIPO_ERROR => 'text-red-600 bg-red-50',
            default => 'text-blue-600 bg-blue-50'
        };
    }

    public function getBorderColorClass(): string
    {
        return match ($this->tipo) {
            self::TIPO_SUCCESS => 'border-green-200',
            self::TIPO_WARNING => 'border-yellow-200',
            self::TIPO_ERROR => 'border-red-200',
            default => 'border-blue-200'
        };
    }

    public function isInfo(): bool
    {
        return $this->tipo === self::TIPO_INFO;
    }

    public function isWarning(): bool
    {
        return $this->tipo === self::TIPO_WARNING;
    }

    public function isSuccess(): bool
    {
        return $this->tipo === self::TIPO_SUCCESS;
    }

    public function isError(): bool
    {
        return $this->tipo === self::TIPO_ERROR;
    }

    public function getFormattedCreatedAt(): string
    {
        if (!$this->createdAt) {
            return '';
        }

        $now = new \DateTime();
        $diff = $now->diff($this->createdAt);

        if ($diff->days > 7) {
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

    public function getRouteFromMetadata(): ?string
    {
        return $this->getMetadataValue('route');
    }

    public function getRouteParamsFromMetadata(): array
    {
        return $this->getMetadataValue('route_params') ?? [];
    }

    public function isExpired(int $daysToExpire = 30): bool
    {
        if (!$this->createdAt) {
            return false;
        }

        $expirationDate = clone $this->createdAt;
        $expirationDate->modify("+{$daysToExpire} days");
        
        return new \DateTime() > $expirationDate;
    }

    public function __toString(): string
    {
        return $this->titulo ?? 'Notificación #' . $this->id;
    }
}