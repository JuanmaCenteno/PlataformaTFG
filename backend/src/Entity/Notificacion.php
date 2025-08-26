<?php

namespace App\Entity;

use App\Repository\NotificacionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

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

    #[Groups(['notificacion:read'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['notificacion:read'])]
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $usuario = null;

    #[Groups(['notificacion:read'])]
    #[Assert\Choice(choices: self::TIPOS_VALIDOS, message: 'Tipo de notificación no válido')]
    #[ORM\Column(length: 50, options: ['default' => 'info'])]
    private ?string $tipo = self::TIPO_INFO;

    #[Groups(['notificacion:read'])]
    #[Assert\NotBlank(message: 'El título es obligatorio')]
    #[Assert\Length(
        max: 255,
        maxMessage: 'El título no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(length: 255)]
    private ?string $titulo = null;

    #[Groups(['notificacion:read'])]
    #[Assert\NotBlank(message: 'El mensaje es obligatorio')]
    #[Assert\Length(
        max: 2000,
        maxMessage: 'El mensaje no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(type: Types::TEXT)]
    private ?string $mensaje = null;

    #[Groups(['notificacion:read'])]
    #[ORM\Column(options: ['default' => false])]
    private ?bool $leida = false;

    #[Groups(['notificacion:read'])]
    #[ORM\Column(options: ['default' => false])]
    private ?bool $enviadaPorEmail = false;

    #[Groups(['notificacion:read'])]
    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $metadata = [];

    #[Groups(['notificacion:read'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[Groups(['notificacion:read'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct()
    {
        $this->tipo = self::TIPO_INFO;
        $this->leida = false;
        $this->enviadaPorEmail = false;
        $this->metadata = [];
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTime();
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
        if ($leida) {
            $this->updatedAt = new \DateTime();
        }
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

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    // =====================================
    // MÉTODOS PARA SERIALIZACIÓN
    // =====================================

    /**
     * Tiempo transcurrido desde la creación para mostrar en la UI
     */
    #[Groups(['notificacion:read'])]
    public function getTiempoTranscurrido(): string
    {
        if (!$this->createdAt) {
            return 'Desconocido';
        }
        
        $now = new \DateTime();
        $diff = $this->createdAt->diff($now);
        
        if ($diff->days > 0) {
            return $diff->days . ' día' . ($diff->days > 1 ? 's' : '');
        } elseif ($diff->h > 0) {
            return $diff->h . ' hora' . ($diff->h > 1 ? 's' : '');
        } elseif ($diff->i > 0) {
            return $diff->i . ' minuto' . ($diff->i > 1 ? 's' : '');
        } else {
            return 'Ahora mismo';
        }
    }

    /**
     * Información del tipo para la UI
     */
    #[Groups(['notificacion:read'])]
    public function getTipoInfo(): array
    {
        return [
            'valor' => $this->tipo,
            'label' => $this->getTipoLabel(),
            'icono' => $this->getIcono(),
            'color' => $this->getColorClass(),
            'border' => $this->getBorderColorClass()
        ];
    }

    /**
     * Label del tipo para mostrar
     */
    #[Groups(['notificacion:read'])]
    public function getTipoLabel(): string
    {
        return match ($this->tipo) {
            self::TIPO_SUCCESS => 'Éxito',
            self::TIPO_WARNING => 'Advertencia',
            self::TIPO_ERROR => 'Error',
            default => 'Información'
        };
    }

    /**
     * Estado de la notificación para la UI
     */
    #[Groups(['notificacion:read'])]
    public function getEstadoInfo(): array
    {
        return [
            'leida' => $this->leida,
            'enviada_por_email' => $this->enviadaPorEmail,
            'es_reciente' => $this->esReciente(),
            'es_importante' => $this->esImportante(),
            'requiere_accion' => $this->requiereAccion()
        ];
    }

    /**
     * Información de enlaces/acciones desde metadata
     */
    #[Groups(['notificacion:read'])]
    public function getAcciones(): array
    {
        $acciones = [];
        
        if ($this->hasMetadata('route')) {
            $acciones[] = [
                'tipo' => 'enlace',
                'texto' => 'Ver detalles',
                'route' => $this->getMetadataValue('route'),
                'params' => $this->getMetadataValue('route_params') ?? []
            ];
        }
        
        if ($this->hasMetadata('accion_principal')) {
            $accionPrincipal = $this->getMetadataValue('accion_principal');
            $acciones[] = [
                'tipo' => 'accion',
                'texto' => $accionPrincipal['texto'] ?? 'Acción',
                'endpoint' => $accionPrincipal['endpoint'] ?? null,
                'metodo' => $accionPrincipal['metodo'] ?? 'POST'
            ];
        }
        
        return $acciones;
    }

    /**
     * Información del evento que generó la notificación
     */
    #[Groups(['notificacion:read'])]
    public function getEventoInfo(): ?array
    {
        $tipoEvento = $this->getMetadataValue('tipo_evento');
        
        if (!$tipoEvento) {
            return null;
        }

        return [
            'tipo' => $tipoEvento,
            'descripcion' => $this->getDescripcionEvento($tipoEvento),
            'icono' => $this->getIconoEvento($tipoEvento)
        ];
    }

    // =====================================
    // MÉTODOS AUXILIARES
    // =====================================

    /**
     * Métodos auxiliares existentes
     */
    public function marcarComoLeida(): static
    {
        $this->leida = true;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function marcarComoNoLeida(): static
    {
        $this->leida = false;
        $this->updatedAt = new \DateTime();
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

    // =====================================
    // MÉTODOS PARA LÓGICA DE NEGOCIO
    // =====================================

    /**
     * Verifica si la notificación es reciente (menos de 24 horas)
     */
    public function esReciente(): bool
    {
        if (!$this->createdAt) {
            return false;
        }
        
        $hace24horas = new \DateTime('-24 hours');
        return $this->createdAt > $hace24horas;
    }

    /**
     * Verifica si es una notificación importante
     */
    public function esImportante(): bool
    {
        return in_array($this->tipo, [self::TIPO_ERROR, self::TIPO_WARNING]) ||
               $this->hasMetadata('prioridad') && $this->getMetadataValue('prioridad') === 'alta';
    }

    /**
     * Verifica si requiere alguna acción del usuario
     */
    public function requiereAccion(): bool
    {
        return $this->hasMetadata('accion_principal') || 
               $this->hasMetadata('route') ||
               in_array($this->getMetadataValue('tipo_evento'), [
                   'tfg_necesita_revision',
                   'defensa_programada',
                   'cambios_solicitados'
               ]);
    }

    /**
     * Obtiene descripción del evento según el tipo
     */
    private function getDescripcionEvento(string $tipoEvento): string
    {
        return match ($tipoEvento) {
            'tfg_subido' => 'TFG subido por estudiante',
            'tfg_aprobado' => 'TFG aprobado para defensa',
            'defensa_programada' => 'Defensa programada',
            'calificacion_publicada' => 'Calificación disponible',
            'usuario_creado' => 'Cuenta de usuario creada',
            'tribunal_asignado' => 'Asignado a tribunal',
            'cambios_solicitados' => 'Cambios solicitados en TFG',
            'defensa_completada' => 'Defensa completada',
            'defensa_cancelada' => 'Defensa cancelada',
            'recordatorio_defensa' => 'Recordatorio de defensa próxima',
            'broadcast' => 'Mensaje del sistema',
            'test' => 'Notificación de prueba',
            default => 'Evento del sistema'
        };
    }

    /**
     * Obtiene icono específico del evento
     */
    private function getIconoEvento(string $tipoEvento): string
    {
        return match ($tipoEvento) {
            'tfg_subido' => '📄',
            'tfg_aprobado' => '✅',
            'defensa_programada' => '📅',
            'calificacion_publicada' => '📊',
            'usuario_creado' => '👤',
            'tribunal_asignado' => '⚖️',
            'cambios_solicitados' => '✏️',
            'defensa_completada' => '🎓',
            'defensa_cancelada' => '❌',
            'recordatorio_defensa' => '⏰',
            'broadcast' => '📢',
            'test' => '🧪',
            default => $this->getIcono()
        };
    }

    /**
     * Verifica si puede ser marcada como leída por el usuario
     */
    public function puedeSerMarcadaLeida(): bool
    {
        return !$this->leida;
    }

    /**
     * Verifica si puede ser eliminada
     */
    public function puedeSerEliminada(): bool
    {
        // Se puede eliminar si está leída o es antigua
        return $this->leida || $this->esAntigua();
    }

    /**
     * Verifica si es una notificación antigua (más de 30 días)
     */
    public function esAntigua(int $dias = 30): bool
    {
        if (!$this->createdAt) {
            return false;
        }
        
        $fechaLimite = new \DateTime("-{$dias} days");
        return $this->createdAt < $fechaLimite;
    }

    /**
     * Obtiene prioridad de la notificación
     */
    public function getPrioridad(): int
    {
        // Prioridad basada en tipo y metadata
        $prioridadPorTipo = match ($this->tipo) {
            self::TIPO_ERROR => 4,
            self::TIPO_WARNING => 3,
            self::TIPO_SUCCESS => 2,
            self::TIPO_INFO => 1,
            default => 1
        };

        // Aumentar prioridad si tiene metadata específica
        if ($this->hasMetadata('prioridad')) {
            $prioridadMeta = match ($this->getMetadataValue('prioridad')) {
                'critica' => 5,
                'alta' => 4,
                'media' => 2,
                'baja' => 1,
                default => 1
            };
            return max($prioridadPorTipo, $prioridadMeta);
        }

        return $prioridadPorTipo;
    }

    public function __toString(): string
    {
        return $this->titulo ?? 'Notificación #' . $this->id;
    }
}