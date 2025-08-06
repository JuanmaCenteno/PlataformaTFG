<?php

namespace App\Entity;

use App\Repository\TribunalRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TribunalRepository::class)]
#[ORM\Table(name: 'tribunales')]
#[ORM\HasLifecycleCallbacks]
class Tribunal
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nombre = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $presidente = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $secretario = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $vocal = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $descripcion = null;

    #[ORM\Column(options: ['default' => true])]
    private ?bool $activo = true;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    // Relación inversa
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
            return $defensa->getEstado() === Defensa::ESTADO_PROGRAMADA;
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
                $defensa->getEstado() !== Defensa::ESTADO_CANCELADA) {
                return false;
            }
        }

        return true;
    }

    public function __toString(): string
    {
        return $this->nombre ?? 'Tribunal #' . $this->id;
    }
}