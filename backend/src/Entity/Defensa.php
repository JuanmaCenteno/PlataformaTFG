<?php

namespace App\Entity;

use App\Repository\DefensaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DefensaRepository::class)]
#[ORM\Table(name: 'defensas')]
#[ORM\HasLifecycleCallbacks]
class Defensa
{
    // Estados posibles de la defensa
    public const ESTADO_PROGRAMADA = 'programada';
    public const ESTADO_COMPLETADA = 'completada';
    public const ESTADO_CANCELADA = 'cancelada';

    public const ESTADOS_VALIDOS = [
        self::ESTADO_PROGRAMADA,
        self::ESTADO_COMPLETADA,
        self::ESTADO_CANCELADA,
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: TFG::class, inversedBy: 'defensa')]
    #[ORM\JoinColumn(nullable: false, unique: true, onDelete: 'CASCADE')]
    private ?TFG $tfg = null;

    #[ORM\ManyToOne(targetEntity: Tribunal::class, inversedBy: 'defensas')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Tribunal $tribunal = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $fechaDefensa = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $aula = null;

    #[ORM\Column(options: ['default' => 30])]
    private ?int $duracionEstimada = 30;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $observaciones = null;

    #[ORM\Column(length: 50, options: ['default' => 'programada'])]
    private ?string $estado = self::ESTADO_PROGRAMADA;

    #[ORM\Column(options: ['default' => false])]
    private ?bool $actaGenerada = false;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $actaPath = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    // Relación inversa
    #[ORM\OneToMany(mappedBy: 'defensa', targetEntity: Calificacion::class, cascade: ['remove'])]
    private Collection $calificaciones;

    public function __construct()
    {
        $this->calificaciones = new ArrayCollection();
        $this->estado = self::ESTADO_PROGRAMADA;
        $this->duracionEstimada = 30;
        $this->actaGenerada = false;
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

    public function getTfg(): ?TFG
    {
        return $this->tfg;
    }

    public function setTfg(?TFG $tfg): static
    {
        $this->tfg = $tfg;
        return $this;
    }

    public function getTribunal(): ?Tribunal
    {
        return $this->tribunal;
    }

    public function setTribunal(?Tribunal $tribunal): static
    {
        $this->tribunal = $tribunal;
        return $this;
    }

    public function getFechaDefensa(): ?\DateTimeInterface
    {
        return $this->fechaDefensa;
    }

    public function setFechaDefensa(\DateTimeInterface $fechaDefensa): static
    {
        $this->fechaDefensa = $fechaDefensa;
        return $this;
    }

    public function getAula(): ?string
    {
        return $this->aula;
    }

    public function setAula(?string $aula): static
    {
        $this->aula = $aula;
        return $this;
    }

    public function getDuracionEstimada(): ?int
    {
        return $this->duracionEstimada;
    }

    public function setDuracionEstimada(int $duracionEstimada): static
    {
        $this->duracionEstimada = $duracionEstimada;
        return $this;
    }

    public function getObservaciones(): ?string
    {
        return $this->observaciones;
    }

    public function setObservaciones(?string $observaciones): static
    {
        $this->observaciones = $observaciones;
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

    public function isActaGenerada(): ?bool
    {
        return $this->actaGenerada;
    }

    public function setActaGenerada(bool $actaGenerada): static
    {
        $this->actaGenerada = $actaGenerada;
        return $this;
    }

    public function getActaPath(): ?string
    {
        return $this->actaPath;
    }

    public function setActaPath(?string $actaPath): static
    {
        $this->actaPath = $actaPath;
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
     * @return Collection<int, Calificacion>
     */
    public function getCalificaciones(): Collection
    {
        return $this->calificaciones;
    }

    public function addCalificacion(Calificacion $calificacion): static
    {
        if (!$this->calificaciones->contains($calificacion)) {
            $this->calificaciones->add($calificacion);
            $calificacion->setDefensa($this);
        }
        return $this;
    }

    public function removeCalificacion(Calificacion $calificacion): static
    {
        if ($this->calificaciones->removeElement($calificacion)) {
            if ($calificacion->getDefensa() === $this) {
                $calificacion->setDefensa(null);
            }
        }
        return $this;
    }

    /**
     * Métodos auxiliares
     */
    public function isProgramada(): bool
    {
        return $this->estado === self::ESTADO_PROGRAMADA;
    }

    public function isCompletada(): bool
    {
        return $this->estado === self::ESTADO_COMPLETADA;
    }

    public function isCancelada(): bool
    {
        return $this->estado === self::ESTADO_CANCELADA;
    }

    public function getFechaFinEstimada(): ?\DateTimeInterface
    {
        if (!$this->fechaDefensa) {
            return null;
        }

        $fechaFin = clone $this->fechaDefensa;
        $fechaFin->modify('+' . $this->duracionEstimada . ' minutes');
        return $fechaFin;
    }

    public function getCalificacionPromedio(): ?float
    {
        if ($this->calificaciones->isEmpty()) {
            return null;
        }

        $total = 0;
        $count = 0;

        foreach ($this->calificaciones as $calificacion) {
            if ($calificacion->getNotaFinal() !== null) {
                $total += (float) $calificacion->getNotaFinal();
                $count++;
            }
        }

        return $count > 0 ? $total / $count : null;
    }

    public function hasCalificacionComplete(): bool
    {
        if (!$this->tribunal) {
            return false;
        }

        $miembros = $this->tribunal->getAllMiembros();
        $calificacionesPorMiembro = [];

        foreach ($this->calificaciones as $calificacion) {
            $evaluadorId = $calificacion->getEvaluador()?->getId();
            if ($evaluadorId) {
                $calificacionesPorMiembro[$evaluadorId] = $calificacion;
            }
        }

        foreach ($miembros as $miembro) {
            if (!isset($calificacionesPorMiembro[$miembro->getId()])) {
                return false;
            }
            
            $cal = $calificacionesPorMiembro[$miembro->getId()];
            if ($cal->getNotaFinal() === null) {
                return false;
            }
        }

        return true;
    }

    public function canBeModified(): bool
    {
        return $this->estado === self::ESTADO_PROGRAMADA;
    }

    public function __toString(): string
    {
        $tfgTitulo = $this->tfg?->getTitulo() ?? 'Sin TFG';
        $fecha = $this->fechaDefensa?->format('d/m/Y H:i') ?? 'Sin fecha';
        return "Defensa: {$tfgTitulo} - {$fecha}";
    }

    public function addCalificacione(Calificacion $calificacione): static
    {
        if (!$this->calificaciones->contains($calificacione)) {
            $this->calificaciones->add($calificacione);
            $calificacione->setDefensa($this);
        }

        return $this;
    }

    public function removeCalificacione(Calificacion $calificacione): static
    {
        if ($this->calificaciones->removeElement($calificacione)) {
            // set the owning side to null (unless already changed)
            if ($calificacione->getDefensa() === $this) {
                $calificacione->setDefensa(null);
            }
        }

        return $this;
    }
}