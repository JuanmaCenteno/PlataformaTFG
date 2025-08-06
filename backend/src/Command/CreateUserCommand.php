<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-user',
    description: 'Crear un usuario en el sistema',
)]
class CreateUserCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Email del usuario')
            ->addArgument('password', InputArgument::REQUIRED, 'Contraseña del usuario')
            ->addArgument('nombre', InputArgument::REQUIRED, 'Nombre del usuario')
            ->addArgument('apellidos', InputArgument::REQUIRED, 'Apellidos del usuario')
            ->addOption('role', 'r', InputOption::VALUE_REQUIRED, 'Rol del usuario', 'ROLE_ESTUDIANTE')
            ->addOption('dni', null, InputOption::VALUE_OPTIONAL, 'DNI del usuario')
            ->addOption('telefono', null, InputOption::VALUE_OPTIONAL, 'Teléfono del usuario')
            ->addOption('universidad', null, InputOption::VALUE_OPTIONAL, 'Universidad del usuario')
            ->addOption('departamento', null, InputOption::VALUE_OPTIONAL, 'Departamento del usuario')
            ->addOption('especialidad', null, InputOption::VALUE_OPTIONAL, 'Especialidad del usuario')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        
        $email = $input->getArgument('email');
        $password = $input->getArgument('password');
        $nombre = $input->getArgument('nombre');
        $apellidos = $input->getArgument('apellidos');
        $role = $input->getOption('role');

        // Verificar si el usuario ya existe
        $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existingUser) {
            $io->error("Ya existe un usuario con el email: $email");
            return Command::FAILURE;
        }

        // Crear nuevo usuario
        $user = new User();
        $user->setEmail($email);
        $user->setNombre($nombre);
        $user->setApellidos($apellidos);
        $user->setRoles([$role]);
        
        // Hash de la contraseña
        $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        // Campos opcionales
        if ($dni = $input->getOption('dni')) {
            $user->setDni($dni);
        }
        if ($telefono = $input->getOption('telefono')) {
            $user->setTelefono($telefono);
        }
        if ($universidad = $input->getOption('universidad')) {
            $user->setUniversidad($universidad);
        }
        if ($departamento = $input->getOption('departamento')) {
            $user->setDepartamento($departamento);
        }
        if ($especialidad = $input->getOption('especialidad')) {
            $user->setEspecialidad($especialidad);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $io->success("Usuario creado exitosamente:");
        $io->table(['Campo', 'Valor'], [
            ['ID', $user->getId()],
            ['Email', $user->getEmail()],
            ['Nombre', $user->getNombreCompleto()],
            ['Rol', $role],
            ['DNI', $user->getDni() ?? 'N/A'],
            ['Activo', $user->isActive() ? 'Sí' : 'No'],
        ]);

        return Command::SUCCESS;
    }
}