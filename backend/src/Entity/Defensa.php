<?php

namespace App\Entity;

use App\Repository\DefensaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;
use Symfony\Component\Validator\Constraints as Assert;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;

#[ORM\Entity(repositoryClass: DefensaRepository::class)]
// Deshabilitado ApiResource para usar controlador personalizado
// #[ApiResource(
//     operations: [],
//     normalizationContext: ['groups' => ['defensa:read']],
//     denormalizationContext: ['groups' => ['defensa:write']],
//     formats: ['json' => ['application/json']]
// )]
// #[ApiFilter(DateFilter::class, properties: ['fecha_defensa'])]
// #[ApiFilter(OrderFilter::class, properties: ['fecha_defensa' => 'ASC'])]
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

    #[Groups(['defensa:read', 'defensa:write', 'tfg:read', 'defensa:student'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['defensa:read', 'tfg:read', 'defensa:student'])]
    #[ORM\OneToOne(targetEntity: TFG::class, inversedBy: 'defensa')]
    #[ORM\JoinColumn(nullable: false, unique: true, onDelete: 'CASCADE')]
    private ?TFG $tfg = null;

    #[Groups(['defensa:read', 'tfg:read', 'defensa:student'])]
    #[ORM\ManyToOne(targetEntity: Tribunal::class, inversedBy: 'defensas')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Tribunal $tribunal = null;

    #[Groups(['defensa:read', 'defensa:write', 'tfg:read', 'defensa:student'])]
    #[Assert\NotNull(message: 'La fecha de defensa es obligatoria')]
    #[Assert\GreaterThan('now', message: 'La fecha de defensa debe ser futura')]
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $fechaDefensa = null;

    #[Groups(['defensa:read', 'defensa:write', 'tfg:read', 'defensa:student'])]
    #[Assert\Length(
        max: 100,
        maxMessage: 'El aula no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $aula = null;

    #[Groups(['defensa:read', 'defensa:write'])]
    #[Assert\Range(
        min: 15,
        max: 180,
        notInRangeMessage: 'La duración debe estar entre {{ min }} y {{ max }} minutos'
    )]
    #[ORM\Column(options: ['default' => 30])]
    private ?int $duracionEstimada = 30;

    #[Groups(['defensa:read', 'defensa:write'])]
    #[Assert\Length(
        max: 1000,
        maxMessage: 'Las observaciones no pueden superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $observaciones = null;

    #[Groups(['defensa:read', 'tfg:read', 'defensa:student'])]
    #[Assert\Choice(choices: self::ESTADOS_VALIDOS, message: 'Estado no válido')]
    #[ORM\Column(length: 50, options: ['default' => 'programada'])]
    private ?string $estado = self::ESTADO_PROGRAMADA;

    #[Groups(['defensa:read'])]
    #[ORM\Column(options: ['default' => false])]
    private ?bool $actaGenerada = false;

    #[Groups(['defensa:read'])]
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $actaPath = null;

    #[Groups(['defensa:read'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[Groups(['defensa:read'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    // Relación inversa
    #[Groups(['defensa:read'])]
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

    // =====================================
    // MÉTODOS DE LÓGICA DE NEGOCIO
    // =====================================

    /**
     * Verifica si la defensa puede transicionar al estado dado
     */
    public function canTransitionTo(string $nuevoEstado): bool
    {
        $transicionesValidas = [
            self::ESTADO_PROGRAMADA => [self::ESTADO_COMPLETADA, self::ESTADO_CANCELADA],
            self::ESTADO_COMPLETADA => [], // Estado final
            self::ESTADO_CANCELADA => [self::ESTADO_PROGRAMADA], // Se puede reprogramar
        ];

        return in_array($nuevoEstado, $transicionesValidas[$this->estado] ?? []);
    }

    /**
     * Obtiene los estados posibles desde el estado actual
     */
    public function getEstadosPosibles(): array
    {
        $transiciones = [
            self::ESTADO_PROGRAMADA => [self::ESTADO_COMPLETADA, self::ESTADO_CANCELADA],
            self::ESTADO_COMPLETADA => [],
            self::ESTADO_CANCELADA => [self::ESTADO_PROGRAMADA],
        ];

        return $transiciones[$this->estado] ?? [];
    }

    /**
     * Verifica si la defensa está programada
     */
    public function isProgramada(): bool
    {
        return $this->estado === self::ESTADO_PROGRAMADA;
    }

    /**
     * Verifica si la defensa está completada
     */
    public function isCompletada(): bool
    {
        return $this->estado === self::ESTADO_COMPLETADA;
    }

    /**
     * Verifica si la defensa está cancelada
     */
    public function isCancelada(): bool
    {
        return $this->estado === self::ESTADO_CANCELADA;
    }

    /**
     * Verifica si la defensa puede ser editada
     */
    public function isEditable(): bool
    {
        return $this->isProgramada() && $this->fechaDefensa > new \DateTime();
    }

    /**
     * Verifica si la defensa puede ser calificada
     */
    public function isCalificable(): bool
    {
        return $this->isCompletada();
    }

    /**
     * Verifica si la defensa puede ser cancelada
     */
    public function isCancelable(): bool
    {
        return $this->isProgramada() && $this->fechaDefensa > new \DateTime();
    }

    /**
     * Obtiene el tiempo restante hasta la defensa
     */
    public function getTiempoRestante(): ?\DateInterval
    {
        if (!$this->fechaDefensa || $this->fechaDefensa <= new \DateTime()) {
            return null;
        }

        return (new \DateTime())->diff($this->fechaDefensa);
    }

    /**
     * Verifica si la defensa es hoy
     */
    public function isHoy(): bool
    {
        if (!$this->fechaDefensa) {
            return false;
        }

        $hoy = new \DateTime('today');
        $manana = new \DateTime('tomorrow');

        return $this->fechaDefensa >= $hoy && $this->fechaDefensa < $manana;
    }

    /**
     * Verifica si la defensa es próxima (dentro de X días)
     */
    public function isProxima(int $dias = 7): bool
    {
        if (!$this->fechaDefensa || $this->fechaDefensa <= new \DateTime()) {
            return false;
        }

        $limite = (new \DateTime())->add(new \DateInterval('P' . $dias . 'D'));
        return $this->fechaDefensa <= $limite;
    }

    /**
     * Obtiene la fecha y hora formateada
     */
    public function getFechaDefensaFormateada(): string
    {
        if (!$this->fechaDefensa) {
            return 'No programada';
        }

        return $this->fechaDefensa->format('d/m/Y \a \l\a\s H:i');
    }

    /**
     * Calcula la fecha de fin de la defensa
     */
    public function getFechaFin(): ?\DateTimeInterface
    {
        if (!$this->fechaDefensa || !$this->duracionEstimada) {
            return null;
        }

        return (clone $this->fechaDefensa)->add(
            new \DateInterval('PT' . $this->duracionEstimada . 'M')
        );
    }

    /**
     * Obtiene la fecha de fin estimada (método existente mejorado)
     */
    public function getFechaFinEstimada(): ?\DateTimeInterface
    {
        return $this->getFechaFin();
    }

    /**
     * Obtiene información para el calendario
     */
    #[Groups(['defensa:calendar'])]
    public function getCalendarInfo(): array
    {
        $tfg = $this->getTfg();
        $estudiante = $tfg ? $tfg->getEstudiante() : null;
        
        $color = match($this->estado) {
            self::ESTADO_PROGRAMADA => '#28a745',
            self::ESTADO_COMPLETADA => '#007bff',
            self::ESTADO_CANCELADA => '#dc3545',
            default => '#6c757d'
        };

        return [
            'id' => $this->getId(),
            'title' => $tfg ? "Defensa: {$tfg->getTitulo()}" : 'Defensa TFG',
            'start' => $this->fechaDefensa?->format('c'),
            'end' => $this->getFechaFin()?->format('c'),
            'backgroundColor' => $color,
            'borderColor' => $color,
            'textColor' => '#ffffff',
            'extendedProps' => [
                'defensa_id' => $this->getId(),
                'tfg_id' => $tfg?->getId(),
                'estudiante' => $estudiante?->getNombreCompleto(),
                'tribunal' => $this->tribunal?->getNombre(),
                'aula' => $this->aula,
                'estado' => $this->estado,
                'duracion' => $this->duracionEstimada,
                'observaciones' => $this->observaciones
            ]
        ];
    }

    /**
     * Verifica si hay conflicto con otra defensa en el mismo tribunal
     */
    public function hasConflictWith(Defensa $otraDefensa): bool
    {
        // No puede haber conflicto consigo misma
        if ($this->getId() === $otraDefensa->getId()) {
            return false;
        }

        // Debe ser el mismo tribunal
        if ($this->tribunal !== $otraDefensa->getTribunal()) {
            return false;
        }

        // Solo defensas programadas pueden tener conflictos
        if (!$this->isProgramada() || !$otraDefensa->isProgramada()) {
            return false;
        }

        // Verificar solapamiento de horarios
        $inicioThis = $this->fechaDefensa;
        $finThis = $this->getFechaFin();
        $inicioOtra = $otraDefensa->getFechaDefensa();
        $finOtra = $otraDefensa->getFechaFin();

        if (!$inicioThis || !$finThis || !$inicioOtra || !$finOtra) {
            return false;
        }

        return !($finThis <= $inicioOtra || $inicioThis >= $finOtra);
    }

    /**
     * Obtiene el progreso de calificaciones (cuántos miembros han calificado)
     */
    #[Groups(['defensa:read'])]
    public function getProgresoCalificaciones(): array
    {
        if (!$this->isCompletada()) {
            return [
                'calificadas' => 0,
                'total' => 3,
                'porcentaje' => 0,
                'completado' => false
            ];
        }

        $totalMiembros = 3; // Presidente, Secretario, Vocal
        $calificadas = count($this->calificaciones);

        return [
            'calificadas' => $calificadas,
            'total' => $totalMiembros,
            'porcentaje' => round(($calificadas / $totalMiembros) * 100),
            'completado' => $calificadas >= $totalMiembros
        ];
    }

    /**
     * Obtiene la nota promedio de todas las calificaciones (método existente mejorado)
     */
    public function getCalificacionPromedio(): ?float
    {
        if ($this->calificaciones->isEmpty()) {
            return null;
        }

        $notas = [];
        foreach ($this->calificaciones as $calificacion) {
            if ($calificacion->getNotaFinal()) {
                $notas[] = (float) $calificacion->getNotaFinal();
            }
        }

        return !empty($notas) ? array_sum($notas) / count($notas) : null;
    }

    /**
     * Obtiene la nota promedio (alias)
     */
    public function getNotaPromedio(): ?float
    {
        return $this->getCalificacionPromedio();
    }

    /**
     * Verifica si todos los miembros del tribunal han calificado
     */
    public function hasCalificacionComplete(): bool
    {
        if (!$this->tribunal) {
            return false;
        }

        $miembrosTribunal = [
            $this->tribunal->getPresidente(),
            $this->tribunal->getSecretario(),
            $this->tribunal->getVocal()
        ];

        $evaluadoresQueCalificaron = [];
        foreach ($this->calificaciones as $calificacion) {
            if ($calificacion->getNotaFinal() !== null) {
                $evaluadoresQueCalificaron[] = $calificacion->getEvaluador();
            }
        }

        foreach ($miembrosTribunal as $miembro) {
            if (!in_array($miembro, $evaluadoresQueCalificaron)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Verifica si puede ser modificada (alias del método existente)
     */
    public function canBeModified(): bool
    {
        return $this->isEditable();
    }

    /**
     * Obtiene información resumida de la defensa
     */
    #[Groups(['defensa:basic'])]
    public function getResumen(): array
    {
        return [
            'id' => $this->id,
            'fecha' => $this->getFechaDefensaFormateada(),
            'aula' => $this->aula,
            'estado' => $this->estado,
            'duracion' => $this->duracionEstimada,
            'tfg_titulo' => $this->tfg?->getTitulo(),
            'estudiante' => $this->tfg?->getEstudiante()?->getNombreCompleto(),
            'tribunal' => $this->tribunal?->getNombre()
        ];
    }

    /**
     * Verifica si la defensa requiere atención urgente
     */
    public function requiresUrgentAttention(): bool
    {
        // Defensa en las próximas 24 horas sin calificaciones completas
        if ($this->isCompletada() && !$this->hasCalificacionComplete()) {
            return true;
        }

        // Defensa programada para mañana
        if ($this->isProgramada() && $this->isProxima(1)) {
            return true;
        }

        return false;
    }

    /**
     * Obtiene el tiempo transcurrido desde la creación
     */
    public function getTiempoTranscurrido(): ?\DateInterval
    {
        return $this->createdAt ? $this->createdAt->diff(new \DateTime()) : null;
    }

    public function __toString(): string
    {
        $tfgTitulo = $this->tfg?->getTitulo() ?? 'Sin TFG';
        $fecha = $this->fechaDefensa?->format('d/m/Y H:i') ?? 'Sin fecha';
        return "Defensa: {$tfgTitulo} - {$fecha}";
    }
}