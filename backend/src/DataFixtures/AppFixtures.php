<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Fixtures básicas para tests de la aplicación TFG
 * Crea usuarios con roles específicos para testing
 */
class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Usuario Estudiante (ID 1)
        $estudiante = new User();
        $estudiante->setEmail('estudiante@uni.es');
        $estudiante->setNombre('Juan');
        $estudiante->setApellidos('Pérez García');
        $estudiante->setDni('12345678A');
        $estudiante->setRoles(['ROLE_ESTUDIANTE']);
        $estudiante->setPassword(
            $this->passwordHasher->hashPassword($estudiante, '123456')
        );
        $estudiante->setIsActive(true);
        $manager->persist($estudiante);

        // Usuario Profesor/Tutor (ID 2)
        $profesor = new User();
        $profesor->setEmail('profesor@uni.es');
        $profesor->setNombre('María');
        $profesor->setApellidos('González López');
        $profesor->setDni('23456789B');
        $profesor->setRoles(['ROLE_PROFESOR']);
        $profesor->setPassword(
            $this->passwordHasher->hashPassword($profesor, '123456')
        );
        $profesor->setIsActive(true);
        $manager->persist($profesor);

        // Usuario Profesor/Secretario de Tribunal (ID 3)
        $profesorSecretario = new User();
        $profesorSecretario->setEmail('secretario@uni.es');
        $profesorSecretario->setNombre('Carlos');
        $profesorSecretario->setApellidos('Martínez Rodríguez');
        $profesorSecretario->setDni('34567890C');
        $profesorSecretario->setRoles(['ROLE_PROFESOR']);
        $profesorSecretario->setPassword(
            $this->passwordHasher->hashPassword($profesorSecretario, '123456')
        );
        $profesorSecretario->setIsActive(true);
        $manager->persist($profesorSecretario);

        // Usuario Profesor/Vocal de Tribunal (ID 4)
        $profesorVocal = new User();
        $profesorVocal->setEmail('vocal@uni.es');
        $profesorVocal->setNombre('Ana');
        $profesorVocal->setApellidos('Sánchez Fernández');
        $profesorVocal->setDni('45678901D');
        $profesorVocal->setRoles(['ROLE_PROFESOR']);
        $profesorVocal->setPassword(
            $this->passwordHasher->hashPassword($profesorVocal, '123456')
        );
        $profesorVocal->setIsActive(true);
        $manager->persist($profesorVocal);

        // Usuario Presidente de Tribunal (ID 5)
        $presidente = new User();
        $presidente->setEmail('presidente@uni.es');
        $presidente->setNombre('Luis');
        $presidente->setApellidos('Jiménez Morales');
        $presidente->setDni('56789012E');
        $presidente->setRoles(['ROLE_PRESIDENTE_TRIBUNAL']);
        $presidente->setPassword(
            $this->passwordHasher->hashPassword($presidente, '123456')
        );
        $presidente->setIsActive(true);
        $manager->persist($presidente);

        // Usuario Admin (ID 6)
        $admin = new User();
        $admin->setEmail('admin@uni.es');
        $admin->setNombre('Admin');
        $admin->setApellidos('Administrador Sistema');
        $admin->setDni('67890123F');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword(
            $this->passwordHasher->hashPassword($admin, '123456')
        );
        $admin->setIsActive(true);
        $manager->persist($admin);

        // Usuarios adicionales para tests más complejos

        // Estudiante adicional (ID 7)
        $estudiante2 = new User();
        $estudiante2->setEmail('estudiante2@uni.es');
        $estudiante2->setNombre('Laura');
        $estudiante2->setApellidos('Moreno Castro');
        $estudiante2->setDni('78901234G');
        $estudiante2->setRoles(['ROLE_ESTUDIANTE']);
        $estudiante2->setPassword(
            $this->passwordHasher->hashPassword($estudiante2, '123456')
        );
        $estudiante2->setIsActive(true);
        $manager->persist($estudiante2);

        // Profesor adicional (ID 8)
        $profesor2 = new User();
        $profesor2->setEmail('profesor2@uni.es');
        $profesor2->setNombre('Roberto');
        $profesor2->setApellidos('Díaz Ruiz');
        $profesor2->setDni('89012345H');
        $profesor2->setRoles(['ROLE_PROFESOR']);
        $profesor2->setPassword(
            $this->passwordHasher->hashPassword($profesor2, '123456')
        );
        $profesor2->setIsActive(true);
        $manager->persist($profesor2);

        // Profesor inactivo para tests de validación (ID 9)
        $profesorInactivo = new User();
        $profesorInactivo->setEmail('inactivo@uni.es');
        $profesorInactivo->setNombre('Inactivo');
        $profesorInactivo->setApellidos('Usuario Test');
        $profesorInactivo->setDni('90123456I');
        $profesorInactivo->setRoles(['ROLE_PROFESOR']);
        $profesorInactivo->setPassword(
            $this->passwordHasher->hashPassword($profesorInactivo, '123456')
        );
        $profesorInactivo->setIsActive(false);
        $manager->persist($profesorInactivo);

        $manager->flush();
    }
}