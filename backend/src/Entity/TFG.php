<?php

namespace App\Entity;

use App\Repository\TFGRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

#[ORM\Entity(repositoryClass: TFGRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/tfgs',
            security: "is_granted('ROLE_ADMIN')",
            paginationEnabled: true,
            paginationItemsPerPage: 20,
            formats: ['json' => ['application/json']]
        ),
        new Get(
            security: "is_granted('ROLE_ADMIN') or (is_granted('ROLE_ESTUDIANTE') and object.getEstudiante() == user) or (is_granted('ROLE_PROFESOR') and object.getTutor() == user)",
            formats: ['json' => ['application/json']]
        ),
        new Post(
            security: "is_granted('ROLE_ESTUDIANTE')",
            formats: ['json' => ['application/json']]
        ),
        new Put(
            security: "is_granted('ROLE_ADMIN') or (is_granted('ROLE_ESTUDIANTE') and object.getEstudiante() == user)",
            formats: ['json' => ['application/json']]
        )
    ],
    normalizationContext: ['groups' => ['tfg:read']],
    denormalizationContext: ['groups' => ['tfg:write']],
    formats: ['json' => ['application/json']]
)]
#[ApiFilter(SearchFilter::class, properties: [
    'titulo' => 'partial',
    'estado' => 'exact',
    'estudiante.nombre' => 'partial',
    'tutor.nombre' => 'partial'
])]
#[ApiFilter(OrderFilter::class, properties: [
    'created_at' => 'DESC',
    'updated_at' => 'DESC',
    'titulo' => 'ASC',
    'estado' => 'ASC'
])]
#[ApiFilter(DateFilter::class, properties: ['created_at', 'updated_at', 'fecha_inicio'])]
#[ORM\Table(name: 'tfgs')]
#[ORM\HasLifecycleCallbacks]
#[Vich\Uploadable]
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

    #[Groups(['tfg:read', 'tfg:write'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['tfg:read'])]
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $estudiante = null;

    #[Groups(['tfg:read'])]
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $tutor = null;

    #[Groups(['tfg:read'])]
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $cotutor = null;

    #[Groups(['tfg:read', 'tfg:write'])]
    #[Assert\NotBlank(message: 'El título es obligatorio')]
    #[Assert\Length(
        min: 10,
        max: 255,
        minMessage: 'El título debe tener al menos {{ limit }} caracteres',
        maxMessage: 'El título no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(length: 255)]
    private ?string $titulo = null;

    #[Groups(['tfg:read', 'tfg:write'])]
    #[Assert\Length(
        max: 5000,
        maxMessage: 'La descripción no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $descripcion = null;

    #[Groups(['tfg:read', 'tfg:write'])]
    #[Assert\Length(
        max: 2000,
        maxMessage: 'El resumen no puede superar los {{ limit }} caracteres'
    )]
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $resumen = null;

    #[Groups(['tfg:read', 'tfg:write'])]
    #[Assert\Count(
        max: 10,
        maxMessage: 'No puede tener más de {{ limit }} palabras clave'
    )]
    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $palabrasClave = [];

    #[Groups(['tfg:read'])]
    #[Assert\Choice(choices: self::ESTADOS_VALIDOS, message: 'Estado no válido')]
    #[ORM\Column(length: 50, options: ['default' => 'borrador'])]
    private ?string $estado = self::ESTADO_BORRADOR;

    #[Groups(['tfg:read', 'tfg:write'])]
    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fechaInicio = null;

    #[Groups(['tfg:read', 'tfg:write'])]
    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fechaFinEstimada = null;

    #[Groups(['tfg:read'])]
    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fechaFinReal = null;

    #[Groups(['tfg:read'])]
    #[Assert\Range(
        min: 0,
        max: 10,
        notInRangeMessage: 'La calificación debe estar entre {{ min }} y {{ max }}'
    )]
    #[ORM\Column(type: Types::DECIMAL, precision: 3, scale: 2, nullable: true)]
    private ?string $calificacion = null;

    // =====================================
    // CAMPOS DE ARCHIVO CON VICHUPLOADER
    // =====================================

    /**
     * Campo que maneja el archivo File object para VichUploader
     * No se serializa ni se persiste en la base de datos
     */
    #[Vich\UploadableField(mapping: 'tfg_documents', fileNameProperty: 'archivoPath', size: 'archivoSize', mimeType: 'archivoMimeType', originalName: 'archivoOriginalName')]
    #[Assert\File(
        maxSize: '50M',
        mimeTypes: [
            'application/pdf',
            'application/x-pdf',
        ],
        mimeTypesMessage: 'Solo se permiten archivos PDF de hasta 50MB'
    )]
    private ?File $archivoFile = null;

    #[Groups(['tfg:read'])]
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $archivoPath = null;

    #[Groups(['tfg:read'])]
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $archivoOriginalName = null;

    #[Groups(['tfg:read'])]
    #[ORM\Column(nullable: true)]
    private ?int $archivoSize = null;

    #[Groups(['tfg:read'])]
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $archivoMimeType = null;

    #[Groups(['tfg:read'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[Groups(['tfg:read'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    // Relaciones inversas
    #[ORM\OneToMany(mappedBy: 'tfg', targetEntity: Comentario::class, cascade: ['remove'])]
    private Collection $comentarios;

    #[Groups(['tfg:read'])]
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

    // =====================================
    // GETTERS Y SETTERS BÁSICOS
    // =====================================

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
        $this->palabrasClave = $palabrasClave ?? [];
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

    // =====================================
    // MÉTODOS DE ARCHIVO CON VICHUPLOADER
    // =====================================

    /**
     * Setter para el archivo File object (VichUploader)
     */
    public function setArchivoFile(?File $archivoFile = null): void
    {
        $this->archivoFile = $archivoFile;

        if (null !== $archivoFile) {
            // Es necesario cambiar al menos una property mapeada
            // para que el listener de Vich sea disparado
            $this->updatedAt = new \DateTime();
        }
    }

    /**
     * Getter para el archivo File object (VichUploader)
     */
    public function getArchivoFile(): ?File
    {
        return $this->archivoFile;
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

    // =====================================
    // MÉTODOS DE LÓGICA DE NEGOCIO
    // =====================================

    /**
     * Verifica si el TFG puede transicionar al estado dado
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

    /**
     * Obtiene los estados posibles desde el estado actual
     */
    public function getEstadosPosibles(): array
    {
        $transitions = [
            self::ESTADO_BORRADOR => [self::ESTADO_REVISION],
            self::ESTADO_REVISION => [self::ESTADO_BORRADOR, self::ESTADO_APROBADO],
            self::ESTADO_APROBADO => [self::ESTADO_DEFENDIDO],
            self::ESTADO_DEFENDIDO => []
        ];

        return $transitions[$this->estado] ?? [];
    }

    /**
     * Verifica si el TFG está en un estado editable
     */
    public function isEditable(): bool
    {
        return in_array($this->estado, [self::ESTADO_BORRADOR, self::ESTADO_REVISION]);
    }

    /**
     * Verifica si el TFG está listo para defensa
     */
    public function isListoParaDefensa(): bool
    {
        return $this->estado === self::ESTADO_APROBADO;
    }

    /**
     * Verifica si el TFG está completado
     */
    public function isCompletado(): bool
    {
        return $this->estado === self::ESTADO_DEFENDIDO;
    }

    /**
     * Verifica si está en estado borrador
     */
    public function isPending(): bool
    {
        return $this->estado === self::ESTADO_BORRADOR;
    }

    /**
     * Verifica si está en revisión
     */
    public function isUnderReview(): bool
    {
        return $this->estado === self::ESTADO_REVISION;
    }

    /**
     * Verifica si está aprobado
     */
    public function isApproved(): bool
    {
        return $this->estado === self::ESTADO_APROBADO;
    }

    /**
     * Verifica si está defendido
     */
    public function isDefended(): bool
    {
        return $this->estado === self::ESTADO_DEFENDIDO;
    }

    /**
     * Verifica si tiene archivo subido
     */
    public function hasFile(): bool
    {
        return $this->archivoPath !== null && $this->archivoOriginalName !== null;
    }

    /**
     * Verifica si tiene archivo subido (alias para compatibilidad)
     */
    public function hasArchivo(): bool
    {
        return $this->hasFile();
    }

    /**
     * Obtiene el tamaño del archivo formateado
     */
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

    /**
     * Obtiene el tamaño del archivo formateado (alias para compatibilidad)
     */
    public function getArchivoSizeFormatted(): ?string
    {
        if (!$this->archivoSize) {
            return null;
        }
        return $this->getFormattedFileSize();
    }

    /**
     * Obtiene el nombre completo del estudiante
     */
    public function getNombreEstudiante(): ?string
    {
        return $this->estudiante ? $this->estudiante->getNombreCompleto() : null;
    }

    /**
     * Obtiene el nombre del tutor
     */
    public function getNombreTutor(): ?string
    {
        return $this->tutor ? $this->tutor->getNombreCompleto() : null;
    }

    /**
     * Obtiene el nombre del cotutor
     */
    public function getNombreCotutor(): ?string
    {
        return $this->cotutor ? $this->cotutor->getNombreCompleto() : null;
    }

    /**
     * Obtiene información del archivo para la API
     */
    #[Groups(['tfg:read'])]
    public function getArchivoInfo(): ?array
    {
        if (!$this->hasFile()) {
            return null;
        }

        return [
            'nombre' => $this->archivoOriginalName,
            'size' => $this->archivoSize,
            'size_formatted' => $this->getFormattedFileSize(),
            'mime_type' => $this->archivoMimeType,
            'url' => '/api/tfgs/' . $this->id . '/download'
        ];
    }

    /**
     * Obtiene el progreso del TFG (0-100%)
     */
    #[Groups(['tfg:read'])]
    public function getProgreso(): int
    {
        $progreso = match($this->estado) {
            self::ESTADO_BORRADOR => 25,
            self::ESTADO_REVISION => 50,
            self::ESTADO_APROBADO => 75,
            self::ESTADO_DEFENDIDO => 100,
            default => 0
        };

        return $progreso;
    }

    /**
     * Verifica si el TFG está retrasado
     */
    public function isRetrasado(): bool
    {
        if (!$this->fechaFinEstimada || $this->isDefended()) {
            return false;
        }

        $now = new \DateTime();
        return $now > $this->fechaFinEstimada;
    }

    /**
     * Obtiene los días restantes hasta la fecha estimada
     */
    public function getDiasRestantes(): ?int
    {
        if (!$this->fechaFinEstimada || $this->isDefended()) {
            return null;
        }

        $now = new \DateTime();
        $diff = $this->fechaFinEstimada->diff($now);
        
        return $diff->invert ? $diff->days : -$diff->days;
    }

    /**
     * Verifica si puede ser editado por el usuario dado
     */
    public function canBeEditedBy(User $user): bool
    {
        // Admin puede editar cualquier TFG
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        // Estudiante solo puede editar su propio TFG si está en estado editable
        if ($this->estudiante === $user) {
            return $this->isEditable();
        }

        // Tutor/cotutor puede editar si está asignado
        if ($this->tutor === $user || $this->cotutor === $user) {
            return true;
        }

        return false;
    }

    /**
     * Verifica si puede ser visto por el usuario dado
     */
    public function canBeViewedBy(User $user): bool
    {
        $roles = $user->getRoles();

        // Admin puede ver cualquier TFG
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // El estudiante puede ver su propio TFG
        if ($this->estudiante === $user) {
            return true;
        }

        // Tutor/cotutor pueden ver TFGs asignados
        if ($this->tutor === $user || $this->cotutor === $user) {
            return true;
        }

        // Presidente de tribunal puede ver TFGs en defensa
        if (in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles) && $this->defensa) {
            $tribunal = $this->defensa->getTribunal();
            return $tribunal && (
                $tribunal->getPresidente() === $user ||
                $tribunal->getSecretario() === $user ||
                $tribunal->getVocal() === $user
            );
        }

        return false;
    }

    public function __toString(): string
    {
        return $this->titulo ?? 'TFG #' . $this->id;
    }
}