<?php

namespace App\Controller\Api;

use App\Entity\TFG;
use App\Entity\User;
use App\Repository\TFGRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Vich\UploaderBundle\Handler\UploadHandler;
use Psr\Log\LoggerInterface;
use App\Service\FileConfigService;

#[Route('/api/tfgs')]
class TFGFileController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private TFGRepository $tfgRepository,
        private UploadHandler $uploadHandler,
        private ValidatorInterface $validator,
        private LoggerInterface $logger,
        private FileConfigService $fileConfig
    ) {}

    #[Route('/{id}/upload', name: 'api_tfg_upload', methods: ['POST'])]
    #[IsGranted('ROLE_ESTUDIANTE')]
    public function upload(int $id, Request $request): JsonResponse
    {
        try {
            $tfg = $this->tfgRepository->find($id);
            
            if (!$tfg) {
                return new JsonResponse(['error' => 'TFG no encontrado'], 404);
            }

            /** @var User $user */
            $user = $this->getUser();
            if ($tfg->getEstudiante()->getId() !== $user->getId()) {
                return new JsonResponse(['error' => 'No tiene permisos para modificar este TFG'], 403);
            }

            if (!$tfg->isEditable()) {
                return new JsonResponse(['error' => 'No se puede subir archivo en el estado actual del TFG'], 400);
            }

            /** @var UploadedFile $uploadedFile */
            $uploadedFile = $request->files->get('archivo');
            
            if (!$uploadedFile) {
                return new JsonResponse(['error' => 'No se proporcionó ningún archivo'], 400);
            }

            if (!$this->validateFile($uploadedFile)) {
                return new JsonResponse(['error' => 'Archivo no válido. Solo se permiten archivos PDF de hasta 50MB'], 400);
            }

            $tfg->setArchivoFile($uploadedFile);

            $violations = $this->validator->validate($tfg);
            if (count($violations) > 0) {
                $errors = [];
                foreach ($violations as $violation) {
                    $errors[] = $violation->getMessage();
                }
                return new JsonResponse(['errors' => $errors], 400);
            }

            $this->uploadHandler->upload($tfg, 'archivoFile');
            $this->entityManager->persist($tfg);
            $this->entityManager->flush();

            $this->logger->info('TFG archivo subido exitosamente', [
                'tfg_id' => $tfg->getId(),
                'user_id' => $user->getId(),
                'filename' => $tfg->getArchivoOriginalName()
            ]);

            return new JsonResponse([
                'message' => 'Archivo subido correctamente',
                'archivo' => [
                    'nombre' => $tfg->getArchivoOriginalName(),
                    'size' => $tfg->getArchivoSize(),
                    'size_formatted' => $tfg->getArchivoSizeFormatted(),
                    'mime_type' => $tfg->getArchivoMimeType(),
                    'url' => $this->generateUrl('api_tfg_download', ['id' => $tfg->getId()])
                ]
            ], 201);

        } catch (FileException $e) {
            $this->logger->error('Error en upload de archivo TFG', [
                'tfg_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return new JsonResponse(['error' => 'Error al procesar el archivo'], 500);
        } catch (\Exception $e) {
            $this->logger->error('Error inesperado en upload TFG', [
                'tfg_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return new JsonResponse(['error' => 'Error interno del servidor'], 500);
        }
    }

    #[Route('/{id}/download', name: 'api_tfg_download', methods: ['GET'])]
    #[IsGranted('ROLE_ESTUDIANTE')]
    public function download(int $id): Response
    {
        try {
            $tfg = $this->tfgRepository->find($id);
            
            if (!$tfg) {
                return new JsonResponse(['error' => 'TFG no encontrado'], 404);
            }

            if (!$tfg->hasArchivo()) {
                return new JsonResponse(['error' => 'TFG no tiene archivo asociado'], 404);
            }

            if (!$this->canDownloadTFG($tfg)) {
                return new JsonResponse(['error' => 'No tiene permisos para descargar este archivo'], 403);
            }

            $filePath = $this->fileConfig->getUploadsDirectory() . '/tfgs/' . $tfg->getArchivoPath();
            
            if (!file_exists($filePath)) {
                $this->logger->error('Archivo TFG no encontrado en sistema de archivos', [
                    'tfg_id' => $tfg->getId(),
                    'path' => $filePath
                ]);
                
                return new JsonResponse(['error' => 'Archivo no encontrado en el servidor'], 404);
            }

            $response = new BinaryFileResponse($filePath);
            $response->setContentDisposition(
                ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                $tfg->getArchivoOriginalName()
            );

            $response->headers->set('Content-Type', 'application/pdf');
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('X-Frame-Options', 'DENY');

            $this->logger->info('TFG archivo descargado', [
                'tfg_id' => $tfg->getId(),
                'user_id' => $this->getUser()->getId(),
                'filename' => $tfg->getArchivoOriginalName()
            ]);

            return $response;

        } catch (\Exception $e) {
            $this->logger->error('Error en descarga de archivo TFG', [
                'tfg_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return new JsonResponse(['error' => 'Error al descargar el archivo'], 500);
        }
    }

    #[Route('/{id}/delete-file', name: 'api_tfg_delete_file', methods: ['DELETE'])]
    #[IsGranted('ROLE_ESTUDIANTE')]
    public function deleteFile(int $id): JsonResponse
    {
        try {
            $tfg = $this->tfgRepository->find($id);
            
            if (!$tfg) {
                return new JsonResponse(['error' => 'TFG no encontrado'], 404);
            }

            /** @var User $user */
            $user = $this->getUser();
            if ($tfg->getEstudiante()->getId() !== $user->getId()) {
                return new JsonResponse(['error' => 'No tiene permisos para modificar este TFG'], 403);
            }

            if (!$tfg->hasArchivo()) {
                return new JsonResponse(['error' => 'TFG no tiene archivo para eliminar'], 404);
            }

            if (!$tfg->isEditable()) {
                return new JsonResponse(['error' => 'No se puede eliminar archivo en el estado actual del TFG'], 400);
            }

            $this->uploadHandler->remove($tfg, 'archivoFile');

            $tfg->setArchivoPath(null);
            $tfg->setArchivoOriginalName(null);
            $tfg->setArchivoSize(null);
            $tfg->setArchivoMimeType(null);

            $this->entityManager->persist($tfg);
            $this->entityManager->flush();

            $this->logger->info('TFG archivo eliminado', [
                'tfg_id' => $tfg->getId(),
                'user_id' => $user->getId()
            ]);

            return new JsonResponse(['message' => 'Archivo eliminado correctamente']);

        } catch (\Exception $e) {
            $this->logger->error('Error al eliminar archivo TFG', [
                'tfg_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return new JsonResponse(['error' => 'Error al eliminar el archivo'], 500);
        }
    }

    #[Route('/{id}/info', name: 'api_tfg_file_info', methods: ['GET'])]
    #[IsGranted('ROLE_ESTUDIANTE')]
    public function getFileInfo(int $id): JsonResponse
    {
        $tfg = $this->tfgRepository->find($id);
        
        if (!$tfg) {
            return new JsonResponse(['error' => 'TFG no encontrado'], 404);
        }

        if (!$this->canViewTFG($tfg)) {
            return new JsonResponse(['error' => 'No tiene permisos para ver este TFG'], 403);
        }

        if (!$tfg->hasArchivo()) {
            return new JsonResponse([
                'has_file' => false,
                'archivo' => null
            ]);
        }

        return new JsonResponse([
            'has_file' => true,
            'archivo' => [
                'nombre' => $tfg->getArchivoOriginalName(),
                'size' => $tfg->getArchivoSize(),
                'size_formatted' => $tfg->getArchivoSizeFormatted(),
                'mime_type' => $tfg->getArchivoMimeType(),
                'updated_at' => $tfg->getUpdatedAt()->format('c'),
                'download_url' => $this->generateUrl('api_tfg_download', ['id' => $tfg->getId()])
            ]
        ]);
    }

    private function validateFile(UploadedFile $file): bool
    {
        // Validar tamaño usando configuración
        if (!$this->fileConfig->isValidFileSize($file->getSize())) {
            return false;
        }

        // Validar tipo MIME usando configuración
        if (!$this->fileConfig->isValidMimeType($file->getMimeType())) {
            return false;
        }

        // Validar extensión usando configuración
        $extension = strtolower($file->getClientOriginalExtension());
        if (!$this->fileConfig->isValidExtension($extension)) {
            return false;
        }

        // Validar que el archivo no esté corrupto
        if ($file->getError() !== UPLOAD_ERR_OK) {
            return false;
        }

        return true;
    }

    private function canDownloadTFG(TFG $tfg): bool
    {
        /** @var User $user */
        $user = $this->getUser();

        // Admin puede descargar cualquier TFG
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        // Estudiante puede descargar su propio TFG
        if ($tfg->getEstudiante()->getId() === $user->getId()) {
            return true;
        }

        // Tutor puede descargar TFGs asignados
        if ($tfg->getTutor()->getId() === $user->getId()) {
            return true;
        }

        // Cotutor puede descargar TFGs asignados
        if ($tfg->getCotutor() && $tfg->getCotutor()->getId() === $user->getId()) {
            return true;
        }

        // Presidente de tribunal puede descargar TFGs de su tribunal
        if (in_array('ROLE_PRESIDENTE_TRIBUNAL', $user->getRoles())) {
            if ($tfg->getDefensa()) {
                $tribunal = $tfg->getDefensa()->getTribunal();
                return $tribunal && (
                    $tribunal->getPresidente()->getId() === $user->getId() ||
                    $tribunal->getSecretario()->getId() === $user->getId() ||
                    $tribunal->getVocal()->getId() === $user->getId()
                );
            }
        }

        // Profesor puede descargar TFGs donde participa como miembro de tribunal
        if (in_array('ROLE_PROFESOR', $user->getRoles())) {
            if ($tfg->getDefensa()) {
                $tribunal = $tfg->getDefensa()->getTribunal();
                return $tribunal && (
                    $tribunal->getPresidente()->getId() === $user->getId() ||
                    $tribunal->getSecretario()->getId() === $user->getId() ||
                    $tribunal->getVocal()->getId() === $user->getId()
                );
            }
        }

        return false;
    }

    private function canViewTFG(TFG $tfg): bool
    {
        /** @var User $user */
        $user = $this->getUser();
        $roles = $user->getRoles();

        // Admin puede ver cualquier TFG
        if (in_array('ROLE_ADMIN', $roles)) {
            return true;
        }

        // El estudiante puede ver su propio TFG
        if ($tfg->getEstudiante()->getId() === $user->getId()) {
            return true;
        }

        // Tutor/cotutor pueden ver TFGs asignados
        if ($tfg->getTutor()->getId() === $user->getId() || 
            ($tfg->getCotutor() && $tfg->getCotutor()->getId() === $user->getId())) {
            return true;
        }

        // Miembros de tribunal pueden ver TFGs en defensa
        if (in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles) || in_array('ROLE_PROFESOR', $roles)) {
            if ($tfg->getDefensa()) {
                $tribunal = $tfg->getDefensa()->getTribunal();
                return $tribunal && (
                    $tribunal->getPresidente()->getId() === $user->getId() ||
                    $tribunal->getSecretario()->getId() === $user->getId() ||
                    $tribunal->getVocal()->getId() === $user->getId()
                );
            }
        }

        return false;
    }
}