<?php

namespace App\Entity;

use App\Repository\CalificacionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: CalificacionRepository::class)]
#[ORM\Table(name: 'calificaciones')]
#[ORM\UniqueConstraint(name: 'unique_defensa_evaluador', columns: ['defensa_id', 'evaluador_id'])]
#[ORM\HasLifecycleCallbacks]
class Calificacion
{
    #[Groups(['calificacion:read'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['calificacion:read'])]
    #[ORM\ManyToOne(targetEntity: Defensa::class, inversedBy: 'calificaciones')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Defensa $defensa = null;

    #[Groups(['calificacion:read'])]
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $evaluador = null;

    #[Groups(['calificacion:read', 'calificacion:write'])]
    #[Assert\Range(
        min: 0,
        max: 10,
        notInRangeMessage: 'La nota de presentación debe estar entre {{ min }} y {{ max }}'
    )]
    #[ORM\Column(type: Types::DECIMAL, precision: 4, scale: 2, nullable: true)]
    private ?string $notaPresentacion = null;

    #[Groups(['calificacion:read', 'calificacion:write'])]
    #[Assert\Range(
        min: 0,
        max: 10,
        notInRangeMessage: 'La nota de contenido debe estar entre {{ min }} y {{ max }}'
    )]
    #[ORM\Column(type: Types::DECIMAL, precision: 4, scale: 2, nullable: true)]
    private ?string $notaContenido = null;

    #[Groups(['calificacion:read', 'calificacion:write'])]
    #[Assert\Range(
        min: 0,
        max: 10,
        notInRangeMessage: 'La nota de defensa debe estar entre {{ min }} y {{ max }}'
    )]
    #[ORM\Column(type: Types::DECIMAL, precision: 4, scale: 2, nullable: true)]
    private ?string $notaDefensa = null;

    #[Groups(['calificacion:read'])]
    #[Assert\Range(
        min: 0,
        max: 10,
        notInRangeMessage: 'La nota final debe estar entre {{ min }} y {{ max }}'
    )]
    #[ORM\Column(type: Types::DECIMAL, precision: 4, scale: 2, nullable: true)]
    private ?string $notaFinal = null;

    #[Groups(['calificacion:read', 'calificacion:write'])]
    #[Assert\Length(
        max: 1000,
        maxMessage: 'Los comentarios no pueden superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $comentarios = null;

    #[Groups(['calificacion:read'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[Groups(['calificacion:read'])]
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
        $this->notaPresentacion = $notaPresentacion;
        $this->recalcularNotaFinal();
        return $this;
    }

    public function getNotaContenido(): ?string
    {
        return $this->notaContenido;
    }

    public function setNotaContenido(?string $notaContenido): static
    {
        $this->notaContenido = $notaContenido;
        $this->recalcularNotaFinal();
        return $this;
    }

    public function getNotaDefensa(): ?string
    {
        return $this->notaDefensa;
    }

    public function setNotaDefensa(?string $notaDefensa): static
    {
        $this->notaDefensa = $notaDefensa;
        $this->recalcularNotaFinal();
        return $this;
    }

    public function getNotaFinal(): ?string
    {
        return $this->notaFinal;
    }

    public function setNotaFinal(?string $notaFinal): static
    {
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

    // =====================================
    // MÉTODOS DE LÓGICA DE NEGOCIO
    // =====================================

    /**
     * Recalcula la nota final basada en las notas parciales
     */
    private function recalcularNotaFinal(): void
    {
        $notas = array_filter([
            $this->notaPresentacion ? (float) $this->notaPresentacion : null,
            $this->notaContenido ? (float) $this->notaContenido : null,
            $this->notaDefensa ? (float) $this->notaDefensa : null
        ]);

        if (!empty($notas)) {
            $promedio = array_sum($notas) / count($notas);
            $this->notaFinal = number_format($promedio, 2);
        } else {
            $this->notaFinal = null;
        }
    }

    /**
     * Verifica si la calificación está completa
     */
    public function isCompleta(): bool
    {
        return $this->notaPresentacion !== null && 
               $this->notaContenido !== null && 
               $this->notaDefensa !== null;
    }

    /**
     * Obtiene la nota final como float
     */
    public function getNotaFinalAsFloat(): ?float
    {
        return $this->notaFinal ? (float) $this->notaFinal : null;
    }

    /**
     * Obtiene la nota final formateada
     */
    public function getNotaFinalFormatted(): string
    {
        if (!$this->notaFinal) {
            return 'Sin calificar';
        }

        $nota = (float) $this->notaFinal;
        return number_format($nota, 2) . '/10';
    }

    /**
     * Obtiene el nivel de calificación (Sobresaliente, Notable, etc.)
     */
    #[Groups(['calificacion:read'])]
    public function getNivelCalificacion(): ?string
    {
        if (!$this->notaFinal) {
            return null;
        }

        $nota = (float) $this->notaFinal;

        return match(true) {
            $nota >= 9.0 => 'Sobresaliente',
            $nota >= 7.0 => 'Notable',
            $nota >= 5.0 => 'Aprobado',
            default => 'Suspenso'
        };
    }

    /**
     * Verifica si la calificación es aprobatoria
     */
    public function isAprobado(): bool
    {
        if (!$this->notaFinal) {
            return false;
        }

        return (float) $this->notaFinal >= 5.0;
    }

    /**
     * Obtiene el rol del evaluador en el tribunal
     */
    #[Groups(['calificacion:read'])]
    public function getRolEvaluador(): ?string
    {
        if (!$this->defensa || !$this->evaluador) {
            return null;
        }

        $tribunal = $this->defensa->getTribunal();
        
        return match($this->evaluador) {
            $tribunal->getPresidente() => 'Presidente',
            $tribunal->getSecretario() => 'Secretario',
            $tribunal->getVocal() => 'Vocal',
            default => 'Desconocido'
        };
    }

    /**
     * Obtiene resumen de las notas
     */
    #[Groups(['calificacion:read'])]
    public function getResumenNotas(): array
    {
        return [
            'presentacion' => $this->notaPresentacion ? (float) $this->notaPresentacion : null,
            'contenido' => $this->notaContenido ? (float) $this->notaContenido : null,
            'defensa' => $this->notaDefensa ? (float) $this->notaDefensa : null,
            'final' => $this->getNotaFinalAsFloat(),
            'nivel' => $this->getNivelCalificacion(),
            'aprobado' => $this->isAprobado(),
            'completa' => $this->isCompleta()
        ];
    }

    /**
     * Valida que todas las notas estén en el rango correcto
     */
    public function validateNotas(): array
    {
        $errors = [];

        foreach (['notaPresentacion', 'notaContenido', 'notaDefensa'] as $field) {
            $value = $this->$field;
            if ($value !== null) {
                $floatValue = (float) $value;
                if ($floatValue < 0 || $floatValue > 10) {
                    $errors[] = "La {$field} debe estar entre 0 y 10";
                }
            }
        }

        return $errors;
    }

    /**
     * Clona la calificación (para revisiones)
     */
    public function clone(): self
    {
        $clone = new self();
        $clone->setDefensa($this->defensa);
        $clone->setEvaluador($this->evaluador);
        $clone->setNotaPresentacion($this->notaPresentacion);
        $clone->setNotaContenido($this->notaContenido);
        $clone->setNotaDefensa($this->notaDefensa);
        $clone->setComentarios($this->comentarios);
        
        return $clone;
    }

    /**
     * Obtiene información del TFG relacionado
     */
    public function getTfgInfo(): ?array
    {
        if (!$this->defensa) {
            return null;
        }

        $tfg = $this->defensa->getTfg();
        return [
            'id' => $tfg->getId(),
            'titulo' => $tfg->getTitulo(),
            'estudiante' => $tfg->getEstudiante()->getNombreCompleto(),
            'estado' => $tfg->getEstado()
        ];
    }

    public function __toString(): string
    {
        if (!$this->defensa) {
            return 'Calificación #' . $this->id;
        }

        $tfg = $this->defensa->getTfg();
        $nota = $this->notaFinal ? number_format((float) $this->notaFinal, 2) : 'Sin nota';
        
        return "Calificación de '{$tfg->getTitulo()}' - {$nota}";
    }
}