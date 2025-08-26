<?php

namespace App\Service;

class SimpleCircularHandler
{
    public function __invoke(object $object): mixed
    {
        // Simplemente devolver el ID si el objeto lo tiene
        if (method_exists($object, 'getId')) {
            return $object->getId();
        }
        
        // Si no tiene ID, devolver el nombre de la clase
        return get_class($object);
    }
}