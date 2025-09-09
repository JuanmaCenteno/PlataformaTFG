<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO para la creación de TFGs
 * Contiene solo los campos necesarios para crear un nuevo TFG
 */
class TFGCreateDto
{
    #[Assert\NotBlank(message: 'El título es obligatorio')]
    #[Assert\Length(
        min: 10,
        max: 255,
        minMessage: 'El título debe tener al menos {{ limit }} caracteres',
        maxMessage: 'El título no puede superar los {{ limit }} caracteres'
    )]
    public string $titulo;

    #[Assert\Length(
        max: 5000,
        maxMessage: 'La descripción no puede superar los {{ limit }} caracteres'
    )]
    public ?string $descripcion = null;

    #[Assert\Length(
        max: 2000,
        maxMessage: 'El resumen no puede superar los {{ limit }} caracteres'
    )]
    public ?string $resumen = null;

    #[Assert\Count(
        max: 10,
        maxMessage: 'No puede tener más de {{ limit }} palabras clave'
    )]
    public ?array $palabras_clave = [];

    #[Assert\Type(type: 'integer', message: 'El ID del tutor debe ser un número')]
    public ?int $tutor_id = null;

    #[Assert\Type(type: 'integer', message: 'El ID del cotutor debe ser un número')]
    public ?int $cotutor_id = null;

    #[Assert\Type(type: 'string', message: 'La fecha de inicio debe ser una fecha válida')]
    public ?string $fecha_inicio = null;

    #[Assert\Type(type: 'string', message: 'La fecha fin estimada debe ser una fecha válida')]
    public ?string $fecha_fin_estimada = null;

    public function __construct()
    {
        $this->palabras_clave = [];
    }
}