<?php

namespace App\Entity;

use App\Repository\TFGRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TFGRepository::class)]
#[ORM\Table(name: 'tfgs')]
#[ORM\HasLifecycleCallbacks]
class TFG
{
    // Estados posibles del TFG
    public const ESTADO_BORRADOR = 'borrador';
    public const ESTADO_REVISION = 'revision';
    public const ESTADO_APROBADO = 'aprobado';
    public const ESTADO_DEFENDIDO = 'defendido';

    public const ESTADOS_VALIDOS = [
        self::ESTADO_BORRADOR,
        self::ESTADO_REVISION,
        self::ESTADO_APROBADO,
        self::ESTADO_DEFENDIDO,
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $estudiante = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $tutor = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $cotutor = null;

    #[ORM\Column(length: 255)]
    private ?string $titulo = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $descripcion = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $resumen = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $palabrasClave = [];

    #[ORM\Column(length: 50, options: ['default' => 'borrador'])]
    private ?string $estado = self::ESTADO_BORRADOR;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fechaInicio = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fechaFinEstimada = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fechaFinReal = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 3, scale: 2, nullable: true)]
    private ?string $calificacion = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $archivoPath = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $archivoOriginalName = null;

    #[ORM\Column(nullable: true)]
    private ?int $archivoSize = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $archivoMimeType = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    // Relaciones inversas
    #[ORM\OneToMany(mappedBy: 'tfg', targetEntity: Comentario::class, cascade: ['remove'])]
    private Collection $comentarios;

    #[ORM\OneToOne(mappedBy: 'tfg', targetEntity: Defensa::class, cascade: ['remove'])]
    private ?Defensa $defensa = null;

    public function __construct()
    {
        $this->comentarios = new ArrayCollection();
        $this->estado = self::ESTADO_BORRADOR;
        $this->palabrasClave = [];
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

    public function getEstudiante(): ?User
    {
        return $this->estudiante;
    }

    public function setEstudiante(?User $estudiante): static
    {
        $this->estudiante = $estudiante;
        return $this;
    }

    public function getTutor(): ?User
    {
        return $this->tutor;
    }

    public function setTutor(?User $tutor): static
    {
        $this->tutor = $tutor;
        return $this;
    }

    public function getCotutor(): ?User
    {
        return $this->cotutor;
    }

    public function setCotutor(?User $cotutor): static
    {
        $this->cotutor = $cotutor;
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

    public function getDescripcion(): ?string
    {
        return $this->descripcion;
    }

    public function setDescripcion(?string $descripcion): static
    {
        $this->descripcion = $descripcion;
        return $this;
    }

    public function getResumen(): ?string
    {
        return $this->resumen;
    }

    public function setResumen(?string $resumen): static
    {
        $this->resumen = $resumen;
        return $this;
    }

    public function getPalabrasClave(): ?array
    {
        return $this->palabrasClave;
    }

    public function setPalabrasClave(?array $palabrasClave): static
    {
        $this->palabrasClave = $palabrasClave;
        return $this;
    }

    public function getEstado(): ?string
    {
        return $this->estado;
    }

    public function setEstado(string $estado): static
    {
        if (!in_array($estado, self::ESTADOS_VALIDOS)) {
            throw new \InvalidArgumentException("Estado '$estado' no válido");
        }
        $this->estado = $estado;
        return $this;
    }

    public function getFechaInicio(): ?\DateTimeInterface
    {
        return $this->fechaInicio;
    }

    public function setFechaInicio(?\DateTimeInterface $fechaInicio): static
    {
        $this->fechaInicio = $fechaInicio;
        return $this;
    }

    public function getFechaFinEstimada(): ?\DateTimeInterface
    {
        return $this->fechaFinEstimada;
    }

    public function setFechaFinEstimada(?\DateTimeInterface $fechaFinEstimada): static
    {
        $this->fechaFinEstimada = $fechaFinEstimada;
        return $this;
    }

    public function getFechaFinReal(): ?\DateTimeInterface
    {
        return $this->fechaFinReal;
    }

    public function setFechaFinReal(?\DateTimeInterface $fechaFinReal): static
    {
        $this->fechaFinReal = $fechaFinReal;
        return $this;
    }

    public function getCalificacion(): ?string
    {
        return $this->calificacion;
    }

    public function setCalificacion(?string $calificacion): static
    {
        $this->calificacion = $calificacion;
        return $this;
    }

    public function getArchivoPath(): ?string
    {
        return $this->archivoPath;
    }

    public function setArchivoPath(?string $archivoPath): static
    {
        $this->archivoPath = $archivoPath;
        return $this;
    }

    public function getArchivoOriginalName(): ?string
    {
        return $this->archivoOriginalName;
    }

    public function setArchivoOriginalName(?string $archivoOriginalName): static
    {
        $this->archivoOriginalName = $archivoOriginalName;
        return $this;
    }

    public function getArchivoSize(): ?int
    {
        return $this->archivoSize;
    }

    public function setArchivoSize(?int $archivoSize): static
    {
        $this->archivoSize = $archivoSize;
        return $this;
    }

    public function getArchivoMimeType(): ?string
    {
        return $this->archivoMimeType;
    }

    public function setArchivoMimeType(?string $archivoMimeType): static
    {
        $this->archivoMimeType = $archivoMimeType;
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

    public function setUpdatedAt(\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * @return Collection<int, Comentario>
     */
    public function getComentarios(): Collection
    {
        return $this->comentarios;
    }

    public function addComentario(Comentario $comentario): static
    {
        if (!$this->comentarios->contains($comentario)) {
            $this->comentarios->add($comentario);
            $comentario->setTfg($this);
        }
        return $this;
    }

    public function removeComentario(Comentario $comentario): static
    {
        if ($this->comentarios->removeElement($comentario)) {
            if ($comentario->getTfg() === $this) {
                $comentario->setTfg(null);
            }
        }
        return $this;
    }

    public function getDefensa(): ?Defensa
    {
        return $this->defensa;
    }

    public function setDefensa(?Defensa $defensa): static
    {
        if ($defensa === null && $this->defensa !== null) {
            $this->defensa->setTfg(null);
        }

        if ($defensa !== null && $defensa->getTfg() !== $this) {
            $defensa->setTfg($this);
        }

        $this->defensa = $defensa;
        return $this;
    }

    /**
     * Métodos auxiliares para lógica de negocio
     */
    public function canTransitionTo(string $newEstado): bool
    {
        $transitions = [
            self::ESTADO_BORRADOR => [self::ESTADO_REVISION],
            self::ESTADO_REVISION => [self::ESTADO_BORRADOR, self::ESTADO_APROBADO],
            self::ESTADO_APROBADO => [self::ESTADO_DEFENDIDO],
            self::ESTADO_DEFENDIDO => [],
        ];

        return in_array($newEstado, $transitions[$this->estado] ?? []);
    }

    public function isPending(): bool
    {
        return $this->estado === self::ESTADO_BORRADOR;
    }

    public function isUnderReview(): bool
    {
        return $this->estado === self::ESTADO_REVISION;
    }

    public function isApproved(): bool
    {
        return $this->estado === self::ESTADO_APROBADO;
    }

    public function isDefended(): bool
    {
        return $this->estado === self::ESTADO_DEFENDIDO;
    }

    public function hasFile(): bool
    {
        return $this->archivoPath !== null;
    }

    public function getFormattedFileSize(): string
    {
        if ($this->archivoSize === null) {
            return 'N/A';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->archivoSize;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }

    public function __toString(): string
    {
        return $this->titulo ?? 'TFG #' . $this->id;
    }
}