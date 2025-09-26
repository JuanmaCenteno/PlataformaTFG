<?php

namespace App\Command;

use App\Entity\Defensa;
use App\Service\ActaService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:generar-acta',
    description: 'Genera el acta de defensa para una defensa específica',
)]
class GenerarActaCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ActaService $actaService
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('defensa-id', InputArgument::REQUIRED, 'ID de la defensa')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $defensaId = $input->getArgument('defensa-id');

        // Buscar la defensa
        $defensa = $this->entityManager->getRepository(Defensa::class)->find($defensaId);

        if (!$defensa) {
            $io->error("Defensa con ID {$defensaId} no encontrada");
            return Command::FAILURE;
        }

        if ($defensa->getEstado() !== 'completada') {
            $io->error("La defensa debe estar en estado 'completada' para generar el acta");
            return Command::FAILURE;
        }

        $io->info("Generando acta para la defensa ID: {$defensaId}");
        $io->info("TFG: {$defensa->getTfg()->getTitulo()}");

        try {
            // Generar el acta
            $nombreActa = $this->actaService->generarActaDefensa($defensa);

            // Actualizar la entidad
            $defensa->setActaGenerada(true);
            $defensa->setActaPath($nombreActa);

            $this->entityManager->flush();

            $io->success("Acta generada exitosamente: {$nombreActa}");
            $io->info("Ruta del archivo: " . $this->actaService->obtenerRutaActa($nombreActa));

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $io->error("Error al generar el acta: " . $e->getMessage());
            $io->error("Traza: " . $e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}