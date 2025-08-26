<?php

namespace App\Entity;

use App\Repository\TribunalRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TribunalRepository::class)]
#[ORM\Table(name: 'tribunales')]
#[ORM\HasLifecycleCallbacks]
class Tribunal
{
    #[Groups(['tribunal:read', 'tribunal:basic'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['tribunal:read', 'tribunal:write', 'tribunal:basic'])]
    #[Assert\NotBlank(message: 'El nombre del tribunal es obligatorio')]
    #[Assert\Length(
        min: 3,
        max: 255,
        minMessage: 'El nombre debe tener al menos {{ limit }} caracteres',
        maxMessage: 'El nombre no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(length: 255)]
    private ?string $nombre = null;

    #[Groups(['tribunal:read'])]
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $presidente = null;

    #[Groups(['tribunal:read'])]
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $secretario = null;

    #[Groups(['tribunal:read'])]
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $vocal = null;

    #[Groups(['tribunal:read', 'tribunal:write'])]
    #[Assert\Length(
        max: 1000,
        maxMessage: 'La descripción no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $descripcion = null;

    #[Groups(['tribunal:read', 'tribunal:basic'])]
    #[ORM\Column(options: ['default' => true])]
    private ?bool $activo = true;

    #[Groups(['tribunal:read'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[Groups(['tribunal:read'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    // Relación inversa
    #[Groups(['tribunal:read'])]
    #[ORM\OneToMany(mappedBy: 'tribunal', targetEntity: Defensa::class)]
    private Collection $defensas;

    public function __construct()
    {
        $this->defensas = new ArrayCollection();
        $this->activo = true;
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

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
    {
        $this->nombre = $nombre;
        return $this;
    }

    public function getPresidente(): ?User
    {
        return $this->presidente;
    }

    public function setPresidente(?User $presidente): static
    {
        $this->presidente = $presidente;
        return $this;
    }

    public function getSecretario(): ?User
    {
        return $this->secretario;
    }

    public function setSecretario(?User $secretario): static
    {
        $this->secretario = $secretario;
        return $this;
    }

    public function getVocal(): ?User
    {
        return $this->vocal;
    }

    public function setVocal(?User $vocal): static
    {
        $this->vocal = $vocal;
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

    public function isActivo(): ?bool
    {
        return $this->activo;
    }

    public function setActivo(bool $activo): static
    {
        $this->activo = $activo;
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
     * @return Collection<int, Defensa>
     */
    public function getDefensas(): Collection
    {
        return $this->defensas;
    }

    public function addDefensa(Defensa $defensa): static
    {
        if (!$this->defensas->contains($defensa)) {
            $this->defensas->add($defensa);
            $defensa->setTribunal($this);
        }
        return $this;
    }

    public function removeDefensa(Defensa $defensa): static
    {
        if ($this->defensas->removeElement($defensa)) {
            if ($defensa->getTribunal() === $this) {
                $defensa->setTribunal(null);
            }
        }
        return $this;
    }

    // =====================================
    // MÉTODOS PARA SERIALIZACIÓN
    // =====================================

    /**
     * Obtiene información básica de los miembros para la API
     */
    #[Groups(['tribunal:read', 'tribunal:basic'])]
    public function getMiembrosInfo(): array
    {
        return [
            'presidente' => $this->presidente ? [
                'id' => $this->presidente->getId(),
                'nombre_completo' => $this->presidente->getNombreCompleto(),
                'email' => $this->presidente->getEmail()
            ] : null,
            'secretario' => $this->secretario ? [
                'id' => $this->secretario->getId(),
                'nombre_completo' => $this->secretario->getNombreCompleto(),
                'email' => $this->secretario->getEmail()
            ] : null,
            'vocal' => $this->vocal ? [
                'id' => $this->vocal->getId(),
                'nombre_completo' => $this->vocal->getNombreCompleto(),
                'email' => $this->vocal->getEmail()
            ] : null
        ];
    }

    /**
     * Cuenta total de defensas
     */
    #[Groups(['tribunal:read'])]
    public function getTotalDefensas(): int
    {
        return $this->defensas->count();
    }

    /**
     * Cuenta defensas programadas
     */
    #[Groups(['tribunal:read', 'tribunal:basic'])]
    public function getDefensasProgramadasCount(): int
    {
        return $this->defensas->filter(function (Defensa $defensa) {
            return $defensa->getEstado() === 'programada';
        })->count();
    }

    /**
     * Cuenta defensas completadas
     */
    #[Groups(['tribunal:read'])]
    public function getDefensasCompletadasCount(): int
    {
        return $this->defensas->filter(function (Defensa $defensa) {
            return $defensa->getEstado() === 'completada';
        })->count();
    }

    /**
     * Obtiene el estado de disponibilidad del tribunal
     */
    #[Groups(['tribunal:read', 'tribunal:basic'])]
    public function getEstadoDisponibilidad(): string
    {
        if (!$this->activo) {
            return 'inactivo';
        }

        $programadas = $this->getDefensasProgramadasCount();
        
        if ($programadas === 0) {
            return 'disponible';
        } elseif ($programadas < 3) {
            return 'parcialmente_ocupado';
        } else {
            return 'ocupado';
        }
    }

    /**
     * Obtiene información de carga de trabajo
     */
    #[Groups(['tribunal:read'])]
    public function getCargaTrabajo(): array
    {
        $programadas = $this->getDefensasProgramadasCount();
        $completadas = $this->getDefensasCompletadasCount();
        $total = $this->getTotalDefensas();

        return [
            'programadas' => $programadas,
            'completadas' => $completadas,
            'total' => $total,
            'porcentaje_completadas' => $total > 0 ? round(($completadas / $total) * 100, 2) : 0
        ];
    }

    /**
     * Verifica si el tribunal está completo (tiene todos los miembros)
     */
    #[Groups(['tribunal:read', 'tribunal:basic'])]
    public function isCompleto(): bool
    {
        return $this->presidente !== null && 
               $this->secretario !== null && 
               $this->vocal !== null;
    }

    /**
     * Obtiene los nombres de los miembros para mostrar
     */
    #[Groups(['tribunal:basic'])]
    public function getMiembrosNombres(): string
    {
        $nombres = [];
        
        if ($this->presidente) {
            $nombres[] = 'Pdte: ' . $this->presidente->getNombreCompleto();
        }
        if ($this->secretario) {
            $nombres[] = 'Sec: ' . $this->secretario->getNombreCompleto();
        }
        if ($this->vocal) {
            $nombres[] = 'Vocal: ' . $this->vocal->getNombreCompleto();
        }
        
        return implode(' | ', $nombres);
    }

    /**
     * Próxima defensa programada
     */
    #[Groups(['tribunal:read'])]
    public function getProximaDefensa(): ?array
    {
        $proximaDefensa = $this->defensas
            ->filter(function (Defensa $defensa) {
                return $defensa->getEstado() === 'programada' && 
                       $defensa->getFechaDefensa() >= new \DateTime();
            })
            ->first();

        if ($proximaDefensa) {
            return [
                'id' => $proximaDefensa->getId(),
                'fecha' => $proximaDefensa->getFechaDefensa()->format('Y-m-d H:i:s'),
                'tfg_titulo' => $proximaDefensa->getTfg()?->getTitulo(),
                'estudiante' => $proximaDefensa->getTfg()?->getEstudiante()?->getNombreCompleto()
            ];
        }

        return null;
    }

    // =====================================
    // MÉTODOS AUXILIARES EXISTENTES
    // =====================================

    /**
     * Métodos auxiliares
     */
    public function getMiembros(): array
    {
        return [
            'presidente' => $this->presidente,
            'secretario' => $this->secretario,
            'vocal' => $this->vocal,
        ];
    }

    public function getAllMiembros(): array
    {
        return array_filter([
            $this->presidente,
            $this->secretario,
            $this->vocal,
        ]);
    }

    public function hasMiembro(User $user): bool
    {
        return $this->presidente === $user || 
               $this->secretario === $user || 
               $this->vocal === $user;
    }

    public function getDefensasProgramadas(): Collection
    {
        return $this->defensas->filter(function (Defensa $defensa) {
            return $defensa->getEstado() === 'programada';
        });
    }

    public function isAvailableForDate(\DateTimeInterface $fecha): bool
    {
        if (!$this->activo) {
            return false;
        }

        // Verificar si hay defensas en la misma fecha/hora
        foreach ($this->defensas as $defensa) {
            if ($defensa->getFechaDefensa() && 
                $defensa->getFechaDefensa()->format('Y-m-d H:i') === $fecha->format('Y-m-d H:i') &&
                $defensa->getEstado() !== 'cancelada') {
                return false;
            }
        }

        return true;
    }

    /**
     * Obtiene el rol de un usuario en el tribunal
     */
    public function getRolUsuario(User $user): ?string
    {
        if ($this->presidente === $user) return 'presidente';
        if ($this->secretario === $user) return 'secretario';
        if ($this->vocal === $user) return 'vocal';
        return null;
    }

    public function __toString(): string
    {
        return $this->nombre ?? 'Tribunal #' . $this->id;
    }
}