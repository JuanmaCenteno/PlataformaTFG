<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Doctrine\DBAL\Types\Types;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ApiResource(
    operations: [
        // GetCollection removed - handled by custom UserController
        new Get(
            security: "is_granted('ROLE_ADMIN') or object == user",
            formats: ['json' => ['application/json']]
        ),
        // Post removed - handled by custom UserController
        new Put(
            security: "is_granted('ROLE_ADMIN') or object == user",
            formats: ['json' => ['application/json']]
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')",
            formats: ['json' => ['application/json']]
        )
    ],
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:write']],
    formats: ['json' => ['application/json']]
)]
#[ORM\Table(name: 'users')]
#[ORM\HasLifecycleCallbacks]
#[UniqueEntity(fields: ['email'], message: 'Ya existe un usuario con este email')]
#[UniqueEntity(fields: ['dni'], message: 'Ya existe un usuario con este DNI')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[Groups(['user:read', 'user:basic', 'user:detailed'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['user:read', 'user:write', 'user:basic', 'user:detailed'])]
    #[Assert\NotBlank(message: 'El email es obligatorio')]
    #[Assert\Email(message: 'El formato del email no es válido')]
    #[ORM\Column(length: 180, unique: true)]
    private ?string $email = null;

    #[Groups(['user:read', 'user:admin'])]
    #[ORM\Column(type: Types::JSON)]
    private array $roles = [];

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[Groups(['user:read', 'user:write', 'user:basic', 'user:detailed'])]
    #[Assert\NotBlank(message: 'El nombre es obligatorio')]
    #[Assert\Length(
        min: 2,
        max: 100,
        minMessage: 'El nombre debe tener al menos {{ limit }} caracteres',
        maxMessage: 'El nombre no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(length: 100)]
    private ?string $nombre = null;

    #[Groups(['user:read', 'user:write', 'user:basic', 'user:detailed'])]
    #[Assert\NotBlank(message: 'Los apellidos son obligatorios')]
    #[Assert\Length(
        min: 2,
        max: 100,
        minMessage: 'Los apellidos deben tener al menos {{ limit }} caracteres',
        maxMessage: 'Los apellidos no pueden superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(length: 100)]
    private ?string $apellidos = null;

    #[Groups(['user:read', 'user:write', 'user:detailed'])]
    #[Assert\Length(
        min: 8,
        max: 20,
        minMessage: 'El DNI debe tener al menos {{ limit }} caracteres',
        maxMessage: 'El DNI no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(length: 20, unique: true, nullable: true)]
    private ?string $dni = null;

    #[Groups(['user:read', 'user:write', 'user:detailed'])]
    #[Assert\Length(
        max: 20,
        maxMessage: 'El teléfono no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(length: 20, nullable: true)]
    private ?string $telefono = null;

    #[Groups(['user:read', 'user:write', 'user:detailed'])]
    #[Assert\Length(
        max: 100,
        maxMessage: 'La universidad no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $universidad = null;

    #[Groups(['user:read', 'user:write', 'user:detailed'])]
    #[Assert\Length(
        max: 100,
        maxMessage: 'El departamento no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $departamento = null;

    #[Groups(['user:read', 'user:write', 'user:detailed'])]
    #[Assert\Length(
        max: 100,
        maxMessage: 'La especialidad no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $especialidad = null;

    #[Groups(['user:read', 'user:admin'])]
    #[ORM\Column(options: ['default' => true])]
    private ?bool $isActive = true;

    #[Groups(['user:read', 'user:detailed'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[Groups(['user:read', 'user:detailed'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct()
    {
        $this->isActive = true;
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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    /**
     * A visual identifier that represents this user.
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
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

    public function getApellidos(): ?string
    {
        return $this->apellidos;
    }

    public function setApellidos(string $apellidos): static
    {
        $this->apellidos = $apellidos;
        return $this;
    }

    public function getDni(): ?string
    {
        return $this->dni;
    }

    public function setDni(?string $dni): static
    {
        $this->dni = $dni;
        return $this;
    }

    public function getTelefono(): ?string
    {
        return $this->telefono;
    }

    public function setTelefono(?string $telefono): static
    {
        $this->telefono = $telefono;
        return $this;
    }

    public function getUniversidad(): ?string
    {
        return $this->universidad;
    }

    public function setUniversidad(?string $universidad): static
    {
        $this->universidad = $universidad;
        return $this;
    }

    public function getDepartamento(): ?string
    {
        return $this->departamento;
    }

    public function setDepartamento(?string $departamento): static
    {
        $this->departamento = $departamento;
        return $this;
    }

    public function getEspecialidad(): ?string
    {
        return $this->especialidad;
    }

    public function setEspecialidad(?string $especialidad): static
    {
        $this->especialidad = $especialidad;
        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;
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
    // MÉTODOS PARA SERIALIZACIÓN
    // =====================================

    /**
     * Obtiene el nombre completo del usuario
     */
    #[Groups(['user:read', 'user:basic', 'user:detailed'])]
    public function getNombreCompleto(): string
    {
        return trim(($this->nombre ?? '') . ' ' . ($this->apellidos ?? ''));
    }

    /**
     * Obtiene el rol principal del usuario
     */
    #[Groups(['user:read', 'user:basic'])]
    public function getRolPrincipal(): string
    {
        $roles = $this->getRoles();
        
        // Jerarquía de roles (mayor prioridad primero)
        $jerarquia = [
            'ROLE_ADMIN' => 'Administrador',
            'ROLE_PRESIDENTE_TRIBUNAL' => 'Presidente de Tribunal',
            'ROLE_PROFESOR' => 'Profesor',
            'ROLE_ESTUDIANTE' => 'Estudiante',
            'ROLE_USER' => 'Usuario'
        ];

        foreach ($jerarquia as $role => $label) {
            if (in_array($role, $roles)) {
                return $label;
            }
        }

        return 'Usuario';
    }

    /**
     * Obtiene las iniciales del usuario
     */
    #[Groups(['user:basic'])]
    public function getIniciales(): string
    {
        $iniciales = '';
        
        if ($this->nombre) {
            $iniciales .= strtoupper(substr($this->nombre, 0, 1));
        }
        
        if ($this->apellidos) {
            $palabras = explode(' ', $this->apellidos);
            $iniciales .= strtoupper(substr($palabras[0], 0, 1));
        }
        
        return $iniciales ?: 'U';
    }

    /**
     * Verifica si el usuario tiene un rol específico
     */
    public function hasRole(string $role): bool
    {
        return in_array($role, $this->getRoles());
    }

    /**
     * Verifica si es estudiante
     */
    #[Groups(['user:read'])]
    public function isEstudiante(): bool
    {
        return $this->hasRole('ROLE_ESTUDIANTE');
    }

    /**
     * Verifica si es profesor
     */
    #[Groups(['user:read'])]
    public function isProfesor(): bool
    {
        return $this->hasRole('ROLE_PROFESOR') || $this->hasRole('ROLE_PRESIDENTE_TRIBUNAL');
    }

    /**
     * Verifica si es administrador
     */
    #[Groups(['user:read'])]
    public function isAdmin(): bool
    {
        return $this->hasRole('ROLE_ADMIN');
    }

    /**
     * Obtiene información básica para mostrar en listas
     */
    #[Groups(['user:basic'])]
    public function getBasicInfo(): array
    {
        return [
            'id' => $this->id,
            'nombre_completo' => $this->getNombreCompleto(),
            'email' => $this->email,
            'rol_principal' => $this->getRolPrincipal(),
            'iniciales' => $this->getIniciales(),
            'activo' => $this->isActive
        ];
    }

    /**
     * Obtiene el tiempo desde la creación
     */
    #[Groups(['user:detailed'])]
    public function getTiempoRegistrado(): string
    {
        if (!$this->createdAt) {
            return 'Desconocido';
        }

        $now = new \DateTime();
        $diff = $this->createdAt->diff($now);

        if ($diff->y > 0) {
            return $diff->y . ' año' . ($diff->y > 1 ? 's' : '');
        } elseif ($diff->m > 0) {
            return $diff->m . ' mes' . ($diff->m > 1 ? 'es' : '');
        } elseif ($diff->d > 0) {
            return $diff->d . ' día' . ($diff->d > 1 ? 's' : '');
        } else {
            return 'Hoy';
        }
    }

    /**
     * Verifica si el perfil está completo
     */
    #[Groups(['user:detailed'])]
    public function isPerfilCompleto(): bool
    {
        return !empty($this->nombre) && 
               !empty($this->apellidos) && 
               !empty($this->email) && 
               (!$this->isEstudiante() || !empty($this->universidad));
    }

    /**
     * Obtiene el porcentaje de completitud del perfil
     */
    #[Groups(['user:detailed'])]
    public function getCompletitudPerfil(): int
    {
        $campos = ['nombre', 'apellidos', 'email'];
        $camposOpcionales = ['dni', 'telefono', 'universidad', 'departamento'];
        
        $completados = 0;
        $total = count($campos) + count($camposOpcionales);
        
        foreach ($campos as $campo) {
            if (!empty($this->$campo)) {
                $completados++;
            }
        }
        
        foreach ($camposOpcionales as $campo) {
            if (!empty($this->$campo)) {
                $completados++;
            }
        }
        
        return round(($completados / $total) * 100);
    }

    public function __toString(): string
    {
        return $this->getNombreCompleto() ?: $this->email ?: 'Usuario #' . $this->id;
    }
}