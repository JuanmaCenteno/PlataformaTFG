<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class DefensaCreateDto
{
    #[Assert\NotBlank(message: 'El ID del TFG es obligatorio')]
    #[Assert\Type(type: 'integer', message: 'El ID del TFG debe ser un número')]
    public int $tfg_id;

    #[Assert\NotBlank(message: 'El ID del tribunal es obligatorio')]
    #[Assert\Type(type: 'integer', message: 'El ID del tribunal debe ser un número')]
    public int $tribunal_id;

    #[Assert\NotBlank(message: 'La fecha de defensa es obligatoria')]
    #[Assert\DateTime(message: 'La fecha de defensa debe tener un formato válido')]
    public string $fecha_defensa;

    #[Assert\NotBlank(message: 'El aula es obligatoria')]
    #[Assert\Length(
        min: 3,
        max: 100,
        minMessage: 'El aula debe tener al menos {{ limit }} caracteres',
        maxMessage: 'El aula no puede exceder {{ limit }} caracteres'
    )]
    public string $aula;

    #[Assert\Type(type: 'integer', message: 'La duración estimada debe ser un número')]
    #[Assert\Range(
        min: 15,
        max: 120,
        minMessage: 'La duración estimada debe ser de al menos {{ limit }} minutos',
        maxMessage: 'La duración estimada no puede exceder {{ limit }} minutos'
    )]
    public ?int $duracion_estimada = 30;

    #[Assert\Length(
        max: 1000,
        maxMessage: 'Las observaciones no pueden exceder {{ limit }} caracteres'
    )]
    public ?string $observaciones = null;
}