<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class TFGUpdateDto
{
    #[Assert\NotBlank(message: 'El título es obligatorio')]
    #[Assert\Length(
        min: 5,
        max: 200,
        minMessage: 'El título debe tener al menos {{ limit }} caracteres',
        maxMessage: 'El título no puede exceder {{ limit }} caracteres'
    )]
    public string $titulo;

    #[Assert\NotBlank(message: 'El resumen es obligatorio')]
    #[Assert\Length(
        min: 50,
        max: 2000,
        minMessage: 'El resumen debe tener al menos {{ limit }} caracteres',
        maxMessage: 'El resumen no puede exceder {{ limit }} caracteres'
    )]
    public string $resumen;

    #[Assert\Length(
        max: 500,
        maxMessage: 'Las palabras clave no pueden exceder {{ limit }} caracteres'
    )]
    public ?string $palabrasClave = null;

    public ?int $tutorId = null;

    public ?int $coTutorId = null;

    #[Assert\Choice(['borrador', 'revision', 'aprobado', 'defendido'])]
    public ?string $estado = null;

    public ?string $comentarios = null;

    public ?float $nota = null;

    public ?string $fechaDefensa = null;
}