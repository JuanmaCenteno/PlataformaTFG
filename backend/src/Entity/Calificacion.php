<?php

namespace App\Entity;

use App\Repository\CalificacionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CalificacionRepository::class)]
#[ORM\Table(
    name: 'calificaciones',
    uniqueConstraints: [
        new ORM\UniqueConstraint(name: 'unique_defensa_evaluador', columns: ['defensa_id', 'evaluador_id'])
    ]
)]
#[ORM\HasLifecycleCallbacks]
class Calificacion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Defensa::class, inversedBy: 'calificaciones')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Defensa $defensa = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $evaluador = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 3, scale: 2, nullable: true)]
    private ?string $notaPresentacion = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 3, scale: 2, nullable: true)]
    private ?string $notaContenido = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 3, scale: 2, nullable: true)]
    private ?string $notaDefensa = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 3, scale: 2, nullable: true)]
    private ?string $notaFinal = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $comentarios = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTime();
    }

    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function calculateNotaFinal(): void
    {
        // Calcular nota final como promedio de las tres notas
        if ($this->notaPresentacion !== null && 
            $this->notaContenido !== null && 
            $this->notaDefensa !== null) {
            
            $promedio = ((float) $this->notaPresentacion + 
                        (float) $this->notaContenido + 
                        (float) $this->notaDefensa) / 3;
            
            $this->notaFinal = number_format($promedio, 2);
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDefensa(): ?Defensa
    {
        return $this->defensa;
    }

    public function setDefensa(?Defensa $defensa): static
    {
        $this->defensa = $defensa;
        return $this;
    }

    public function getEvaluador(): ?User
    {
        return $this->evaluador;
    }

    public function setEvaluador(?User $evaluador): static
    {
        $this->evaluador = $evaluador;
        return $this;
    }

    public function getNotaPresentacion(): ?string
    {
        return $this->notaPresentacion;
    }

    public function setNotaPresentacion(?string $notaPresentacion): static
    {
        if ($notaPresentacion !== null) {
            $this->validateNota($notaPresentacion);
        }
        $this->notaPresentacion = $notaPresentacion;
        return $this;
    }

    public function getNotaContenido(): ?string
    {
        return $this->notaContenido;
    }

    public function setNotaContenido(?string $notaContenido): static
    {
        if ($notaContenido !== null) {
            $this->validateNota($notaContenido);
        }
        $this->notaContenido = $notaContenido;
        return $this;
    }

    public function getNotaDefensa(): ?string
    {
        return $this->notaDefensa;
    }

    public function setNotaDefensa(?string $notaDefensa): static
    {
        if ($notaDefensa !== null) {
            $this->validateNota($notaDefensa);
        }
        $this->notaDefensa = $notaDefensa;
        return $this;
    }

    public function getNotaFinal(): ?string
    {
        return $this->notaFinal;
    }

    public function setNotaFinal(?string $notaFinal): static
    {
        if ($notaFinal !== null) {
            $this->validateNota($notaFinal);
        }
        $this->notaFinal = $notaFinal;
        return $this;
    }

    public function getComentarios(): ?string
    {
        return $this->comentarios;
    }

    public function setComentarios(?string $comentarios): static
    {
        $this->comentarios = $comentarios;
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
     * Métodos auxiliares
     */
    private function validateNota(string $nota): void
    {
        $notaFloat = (float) $nota;
        if ($notaFloat < 0 || $notaFloat > 10) {
            throw new \InvalidArgumentException('La nota debe estar entre 0 y 10');
        }
    }

    public function isComplete(): bool
    {
        return $this->notaPresentacion !== null && 
               $this->notaContenido !== null && 
               $this->notaDefensa !== null &&
               $this->notaFinal !== null;
    }

    public function getCalificacionLiteral(): string
    {
        if ($this->notaFinal === null) {
            return 'Sin calificar';
        }

        $nota = (float) $this->notaFinal;

        return match (true) {
            $nota >= 9.0 => 'Sobresaliente',
            $nota >= 7.0 => 'Notable',
            $nota >= 5.0 => 'Aprobado',
            default => 'Suspenso'
        };
    }

    public function getCalificacionColor(): string
    {
        if ($this->notaFinal === null) {
            return 'text-gray-500';
        }

        $nota = (float) $this->notaFinal;

        return match (true) {
            $nota >= 9.0 => 'text-green-600',
            $nota >= 7.0 => 'text-blue-600',
            $nota >= 5.0 => 'text-yellow-600',
            default => 'text-red-600'
        };
    }

    public function hasMatriculaDeHonor(): bool
    {
        return $this->notaFinal !== null && (float) $this->notaFinal >= 9.5;
    }

    public function getRolEvaluador(): ?string
    {
        if (!$this->defensa || !$this->defensa->getTribunal() || !$this->evaluador) {
            return null;
        }

        $tribunal = $this->defensa->getTribunal();
        
        if ($tribunal->getPresidente() === $this->evaluador) {
            return 'Presidente';
        }
        
        if ($tribunal->getSecretario() === $this->evaluador) {
            return 'Secretario';
        }
        
        if ($tribunal->getVocal() === $this->evaluador) {
            return 'Vocal';
        }

        return null;
    }

    public function __toString(): string
    {
        $evaluador = $this->evaluador?->getNombreCompleto() ?? 'Sin evaluador';
        $nota = $this->notaFinal ?? 'Sin nota';
        return "Calificación de {$evaluador}: {$nota}";
    }
}