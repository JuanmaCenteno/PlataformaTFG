<?php

namespace App\Service;

use App\Entity\TFG;
use Vich\UploaderBundle\Mapping\PropertyMapping;
use Vich\UploaderBundle\Naming\NamerInterface;
use Vich\UploaderBundle\Naming\Polyfill\FileExtensionTrait;

class TFGFileNamer implements NamerInterface
{
    use FileExtensionTrait;

    public function name($object, PropertyMapping $mapping): string
    {
        /** @var TFG $tfg */
        $tfg = $object;
        $file = $mapping->getFile($tfg);
        
        if (!$file) {
            throw new \RuntimeException('No se pudo obtener el archivo del TFG');
        }

        $extension = $this->getExtension($file);
        
        // Generar nombre único usando: tfg_{id}_{timestamp}_{hash}.pdf
        $timestamp = date('YmdHis');
        $hash = substr(md5(uniqid() . $tfg->getId()), 0, 8);
        
        return sprintf(
            'tfg_%s_%s_%s.%s',
            $tfg->getId() ?: 'temp',
            $timestamp,
            $hash,
            $extension
        );
    }
}