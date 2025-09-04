<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class TFGEstadoUpdateDto
{
    #[Assert\NotBlank(message: 'El estado es obligatorio')]
    #[Assert\Choice(['borrador', 'revision', 'aprobado', 'defendido'])]
    public string $estado;

    public ?string $comentarios = null;

    #[Assert\Range(
        min: 0,
        max: 10,
        notInRangeMessage: 'La nota debe estar entre {{ min }} y {{ max }}'
    )]
    public ?float $nota = null;
}