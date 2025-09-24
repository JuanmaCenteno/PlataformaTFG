<?php

namespace App\Controller\Api;

use App\Entity\Defensa;
use App\Entity\TFG;
use App\Entity\Tribunal;
use App\Entity\User;
use App\Entity\Calificacion;
use App\Repository\DefensaRepository;
use App\Repository\TFGRepository;
use App\Repository\TribunalRepository;
use App\Repository\CalificacionRepository;
use App\Service\NotificacionService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/defensas')]
#[IsGranted('ROLE_USER')]
class DefensaController extends AbstractController
{
    public function __construct(
        private DefensaRepository $defensaRepository,
        private TFGRepository $tfgRepository,
        private TribunalRepository $tribunalRepository,
        private CalificacionRepository $calificacionRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private NotificacionService $notificacionService
    ) {}

    /**
     * GET /api/defensas
     * Listar defensas según rol del usuario
     */
    #[Route('', name: 'api_defensas_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $roles = $user->getRoles();
        $page = max(1, $request->query->getInt('page', 1));
        $perPage = min(50, max(1, $request->query->getInt('per_page', 10)));
        $estado = $request->query->get('estado');
        $fechaInicio = $request->query->get('fecha_inicio');
        $fechaFin = $request->query->get('fecha_fin');

        // Determinar qué defensas puede ver según su rol
        $defensas = match(true) {
            in_array('ROLE_ADMIN', $roles) => 
                $this->defensaRepository->findAllPaginated($page, $perPage, $estado, $fechaInicio, $fechaFin),
            in_array('ROLE_PRESIDENTE_TRIBUNAL', $roles) || in_array('ROLE_PROFESOR', $roles) => 
                $this->defensaRepository->findByTribunalMember($user, $page, $perPage, $estado, $fechaInicio, $fechaFin),
            default => 
                ['data' => [], 'total' => 0]
        };

        return $this->json([
            'data' => $defensas['data'],
            'meta' => [
                'total' => $defensas['total'],
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($defensas['total'] / $perPage)
            ]
        ], 200, [], ['groups' => ['defensa:read', 'tfg:basic', 'tribunal:basic', 'user:basic']]);
    }

    /**
     * GET /api/defensas/calendario
     * Vista de calendario de defensas para FullCalendar.js
     */
    #[Route('/calendario', name: 'api_defensas_calendario', methods: ['GET'])]
    public function calendario(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        // Soportar tanto el formato FullCalendar (start/end) como nuestro formato (fecha_inicio/fecha_fin)
        $fechaInicio = $request->query->get('start') ?: $request->query->get('fecha_inicio');
        $fechaFin = $request->query->get('end') ?: $request->query->get('fecha_fin');

        // Si no se proporcionan fechas, usar el mes actual
        if (!$fechaInicio || !$fechaFin) {
            $now = new \DateTime();
            $fechaInicio = $now->format('Y-m-01'); // Primer día del mes actual
            $fechaFin = $now->format('Y-m-t'); // Último día del mes actual
        }

        try {
            $inicio = new \DateTime($fechaInicio);
            $fin = new \DateTime($fechaFin);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Formato de fecha inválido'], 400);
        }

        $defensas = $this->defensaRepository->findForCalendar($user, $inicio, $fin);

        $events = [];
        foreach ($defensas as $defensa) {
            $tfg = $defensa->getTfg();
            $estudiante = $tfg->getEstudiante();
            
            $color = match($defensa->getEstado()) {
                'programada' => '#28a745',
                'completada' => '#007bff',
                'cancelada' => '#dc3545',
                default => '#6c757d'
            };

            $events[] = [
                'id' => $defensa->getId(),
                'title' => "Defensa: {$tfg->getTitulo()}",
                'start' => $defensa->getFechaDefensa()->format('c'),
                'end' => $defensa->getFechaDefensa()->add(
                    new \DateInterval('PT' . ($defensa->getDuracionEstimada() ?? 30) . 'M')
                )->format('c'),
                'backgroundColor' => $color,
                'borderColor' => $color,
                'textColor' => '#ffffff',
                'extendedProps' => [
                    'defensa_id' => $defensa->getId(),
                    'tfg_id' => $tfg->getId(),
                    'estudiante' => $estudiante->getNombreCompleto(),
                    'tribunal' => $defensa->getTribunal()->getNombre(),
                    'aula' => $defensa->getAula(),
                    'estado' => $defensa->getEstado(),
                    'duracion' => $defensa->getDuracionEstimada(),
                    'observaciones' => $defensa->getObservaciones()
                ]
            ];
        }

        return $this->json($events);
    }

    /**
     * POST /api/defensas
     * Programar nueva defensa (solo presidentes de tribunal y admin)
     */
    #[Route('', name: 'api_defensas_create', methods: ['POST'])]
    #[IsGranted('ROLE_PRESIDENTE_TRIBUNAL')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Datos JSON inválidos'], 400);
        }

        // Validar campos requeridos
        $requiredFields = ['tfg_id', 'tribunal_id', 'fecha_defensa', 'aula'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->json(['error' => "Campo '{$field}' requerido"], 400);
            }
        }

        // Buscar y validar TFG
        $tfg = $this->tfgRepository->find($data['tfg_id']);
        if (!$tfg) {
            return $this->json(['error' => 'TFG no encontrado'], 404);
        }

        if ($tfg->getEstado() !== TFG::ESTADO_APROBADO) {
            return $this->json(['error' => 'El TFG debe estar aprobado para programar defensa'], 400);
        }

        // Verificar que no tiene defensa ya programada
        if ($tfg->getDefensa()) {
            return $this->json(['error' => 'El TFG ya tiene una defensa programada'], 400);
        }

        // Buscar y validar tribunal
        $tribunal = $this->tribunalRepository->find($data['tribunal_id']);
        if (!$tribunal) {
            return $this->json(['error' => 'Tribunal no encontrado'], 404);
        }

        if (!$tribunal->isActivo()) {
            return $this->json(['error' => 'El tribunal no está activo'], 400);
        }

        // Verificar permisos sobre el tribunal
        $this->denyAccessUnlessGranted('tribunal_schedule_defense', $tribunal);

        // Validar fecha
        try {
            $fechaDefensa = new \DateTime($data['fecha_defensa']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Formato de fecha inválido'], 400);
        }

        // Verificar que la fecha no sea en el pasado
        if ($fechaDefensa <= new \DateTime()) {
            return $this->json(['error' => 'La fecha de defensa debe ser futura'], 400);
        }

        // Verificar disponibilidad del tribunal en esa fecha/hora
        $conflicto = $this->defensaRepository->findConflict($tribunal, $fechaDefensa, $data['duracion_estimada'] ?? 30);
        if ($conflicto) {
            return $this->json([
                'error' => 'El tribunal ya tiene una defensa programada en ese horario',
                'conflicto' => [
                    'fecha' => $conflicto->getFechaDefensa()->format('c'),
                    'tfg' => $conflicto->getTfg()->getTitulo()
                ]
            ], 400);
        }

        // Verificar disponibilidad del aula (opcional, según tu lógica de negocio)
        $aulaOcupada = $this->defensaRepository->findAulaConflict($data['aula'], $fechaDefensa, $data['duracion_estimada'] ?? 30);
        if ($aulaOcupada) {
            return $this->json([
                'error' => 'El aula ya está ocupada en ese horario',
                'ocupada_por' => $aulaOcupada->getTfg()->getTitulo()
            ], 400);
        }

        // Crear defensa
        $defensa = new Defensa();
        $defensa->setTfg($tfg);
        $defensa->setTribunal($tribunal);
        $defensa->setFechaDefensa($fechaDefensa);
        $defensa->setAula($data['aula']);
        $defensa->setDuracionEstimada($data['duracion_estimada'] ?? 30);
        $defensa->setObservaciones($data['observaciones'] ?? '');
        $defensa->setEstado('programada');

        // Validar entidad
        $errors = $this->validator->validate($defensa);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->persist($defensa);
        $this->entityManager->flush();

        // Notificaciones
        $estudiante = $tfg->getEstudiante();
        $miembrosTribunal = [$tribunal->getPresidente(), $tribunal->getSecretario(), $tribunal->getVocal()];

        // Notificar al estudiante
        $this->notificacionService->notificarDefensaProgramada(
            $estudiante,
            $tfg->getTitulo(),
            $fechaDefensa,
            $data['aula'],
            $miembrosTribunal
        );

        // Notificar al tutor
        if ($tfg->getTutor()) {
            $this->notificacionService->crearNotificacion(
                $tfg->getTutor(),
                'Defensa Programada',
                "La defensa del TFG '{$tfg->getTitulo()}' de {$estudiante->getNombreCompleto()} ha sido programada para el " . 
                $fechaDefensa->format('d/m/Y \a \l\a\s H:i') . " en {$data['aula']}.",
                'success',
                [
                    'tipo_evento' => 'defensa_programada_tutor',
                    'defensa_id' => $defensa->getId(),
                    'tfg_id' => $tfg->getId()
                ],
                true
            );
        }

        return $this->json($defensa, 201, [], ['groups' => ['defensa:read', 'tfg:basic', 'tribunal:basic', 'user:basic']]);
    }

    /**
     * GET /api/defensas/{id}
     * Ver defensa específica
     */
    #[Route('/{id}', name: 'api_defensas_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $defensa = $this->defensaRepository->find($id);
        
        if (!$defensa) {
            return $this->json(['error' => 'Defensa no encontrada'], 404);
        }

        // Verificar permisos
        $this->denyAccessUnlessGranted('defensa_view', $defensa);

        return $this->json($defensa, 200, [], ['groups' => ['defensa:read', 'tfg:read', 'tribunal:read', 'user:basic', 'calificacion:read']]);
    }

    /**
     * PUT /api/defensas/{id}
     * Actualizar defensa
     */
    #[Route('/{id}', name: 'api_defensas_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $defensa = $this->defensaRepository->find($id);
        
        if (!$defensa) {
            return $this->json(['error' => 'Defensa no encontrada'], 404);
        }

        // Verificar permisos
        $this->denyAccessUnlessGranted('defensa_edit', $defensa);

        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Datos JSON inválidos'], 400);
        }

        // Solo se puede actualizar si está programada
        if ($defensa->getEstado() !== 'programada') {
            return $this->json(['error' => 'Solo se pueden modificar defensas programadas'], 400);
        }

        // Actualizar campos permitidos
        if (isset($data['fecha_defensa'])) {
            try {
                $nuevaFecha = new \DateTime($data['fecha_defensa']);
                if ($nuevaFecha <= new \DateTime()) {
                    return $this->json(['error' => 'La fecha debe ser futura'], 400);
                }
                
                // Verificar conflictos con la nueva fecha
                $conflicto = $this->defensaRepository->findConflict(
                    $defensa->getTribunal(), 
                    $nuevaFecha, 
                    $data['duracion_estimada'] ?? $defensa->getDuracionEstimada(),
                    $defensa->getId() // Excluir la defensa actual
                );
                
                if ($conflicto) {
                    return $this->json(['error' => 'Conflicto de horario con otra defensa'], 400);
                }
                
                $defensa->setFechaDefensa($nuevaFecha);
            } catch (\Exception $e) {
                return $this->json(['error' => 'Formato de fecha inválido'], 400);
            }
        }

        if (isset($data['aula'])) {
            $defensa->setAula($data['aula']);
        }

        if (isset($data['duracion_estimada'])) {
            $defensa->setDuracionEstimada($data['duracion_estimada']);
        }

        if (isset($data['observaciones'])) {
            $defensa->setObservaciones($data['observaciones']);
        }

        // Validar
        $errors = $this->validator->validate($defensa);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->flush();

        // Si se cambió la fecha, notificar a todos los involucrados
        if (isset($data['fecha_defensa'])) {
            $tfg = $defensa->getTfg();
            $estudiante = $tfg->getEstudiante();
            $tribunal = $defensa->getTribunal();
            
            $mensaje = "La fecha de defensa del TFG '{$tfg->getTitulo()}' ha sido reprogramada para el " . 
                      $defensa->getFechaDefensa()->format('d/m/Y \a \l\a\s H:i') . " en {$defensa->getAula()}.";
            
            // Notificar estudiante
            $this->notificacionService->crearNotificacion(
                $estudiante,
                'Defensa Reprogramada',
                $mensaje,
                'warning',
                ['tipo_evento' => 'defensa_reprogramada', 'defensa_id' => $defensa->getId()],
                true
            );

            // Notificar tribunal
            $miembros = [$tribunal->getPresidente(), $tribunal->getSecretario(), $tribunal->getVocal()];
            foreach ($miembros as $miembro) {
                if ($miembro) {
                    $this->notificacionService->crearNotificacion(
                        $miembro,
                        'Defensa Reprogramada',
                        $mensaje,
                        'warning',
                        ['tipo_evento' => 'defensa_reprogramada', 'defensa_id' => $defensa->getId()],
                        true
                    );
                }
            }
        }

        return $this->json($defensa, 200, [], ['groups' => ['defensa:read', 'tfg:basic', 'tribunal:basic', 'user:basic']]);
    }

    /**
     * PUT /api/defensas/{id}/estado
     * Cambiar estado de la defensa (completar, cancelar)
     */
    #[Route('/{id}/estado', name: 'api_defensas_change_estado', methods: ['PUT'])]
    public function changeEstado(int $id, Request $request): JsonResponse
    {
        $defensa = $this->defensaRepository->find($id);
        
        if (!$defensa) {
            return $this->json(['error' => 'Defensa no encontrada'], 404);
        }

        $this->denyAccessUnlessGranted('defensa_manage_estado', $defensa);

        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['estado'])) {
            return $this->json(['error' => 'Campo estado requerido'], 400);
        }

        $nuevoEstado = $data['estado'];
        $comentario = $data['comentario'] ?? '';

        // Validar transición de estado
        if (!$defensa->canTransitionTo($nuevoEstado)) {
            return $this->json([
                'error' => "No se puede cambiar de '{$defensa->getEstado()}' a '{$nuevoEstado}'"
            ], 400);
        }

        $estadoAnterior = $defensa->getEstado();
        $defensa->setEstado($nuevoEstado);

        // Si se marca como completada, actualizar el TFG a defendido
        if ($nuevoEstado === 'completada') {
            $tfg = $defensa->getTfg();
            $tfg->setEstado(TFG::ESTADO_DEFENDIDO);
            $tfg->setFechaFinReal(new \DateTime());
            
            // Marcar acta como generada (lógica futura)
            $defensa->setActaGenerada(true);
        }

        $this->entityManager->flush();

        // Notificaciones según el nuevo estado
        $tfg = $defensa->getTfg();
        $estudiante = $tfg->getEstudiante();

        match($nuevoEstado) {
            'completada' => $this->notificacionService->crearNotificacion(
                $estudiante,
                '¡Defensa Completada!',
                "Has completado exitosamente la defensa de tu TFG '{$tfg->getTitulo()}'. ¡Felicidades!" . 
                ($comentario ? "\n\nComentarios: {$comentario}" : ''),
                'success',
                ['tipo_evento' => 'defensa_completada', 'defensa_id' => $defensa->getId()],
                true
            ),
            'cancelada' => $this->notificacionService->crearNotificacion(
                $estudiante,
                'Defensa Cancelada',
                "La defensa de tu TFG '{$tfg->getTitulo()}' ha sido cancelada." . 
                ($comentario ? "\n\nMotivo: {$comentario}" : ''),
                'error',
                ['tipo_evento' => 'defensa_cancelada', 'defensa_id' => $defensa->getId()],
                true
            ),
            default => null
        };

        return $this->json([
            'id' => $defensa->getId(),
            'estado' => $defensa->getEstado(),
            'tfg_estado' => $defensa->getTfg()->getEstado(),
            'updated_at' => $defensa->getUpdatedAt()->format('c')
        ]);
    }

    /**
     * POST /api/defensas/{id}/calificaciones
     * Registrar calificaciones de la defensa
     */
    #[Route('/{id}/calificaciones', name: 'api_defensas_calificar', methods: ['POST'])]
    public function calificar(int $id, Request $request): JsonResponse
    {
        $defensa = $this->defensaRepository->find($id);
        
        if (!$defensa) {
            return $this->json(['error' => 'Defensa no encontrada'], 404);
        }

        if ($defensa->getEstado() !== 'completada') {
            return $this->json(['error' => 'Solo se pueden calificar defensas completadas'], 400);
        }

        $this->denyAccessUnlessGranted('defensa_calificar', $defensa);

        $data = json_decode($request->getContent(), true);
        
        if (!$data || !isset($data['calificaciones'])) {
            return $this->json(['error' => 'Datos de calificaciones requeridos'], 400);
        }

        /** @var User $evaluador */
        $evaluador = $this->getUser();
        
        // Verificar que el usuario es miembro del tribunal
        $tribunal = $defensa->getTribunal();
        if (!in_array($evaluador, [$tribunal->getPresidente(), $tribunal->getSecretario(), $tribunal->getVocal()])) {
            return $this->json(['error' => 'Solo los miembros del tribunal pueden calificar'], 403);
        }

        // Verificar si ya calificó
        $calificacionExistente = $this->calificacionRepository->findOneBy([
            'defensa' => $defensa,
            'evaluador' => $evaluador
        ]);

        if ($calificacionExistente) {
            return $this->json(['error' => 'Ya has calificado esta defensa'], 400);
        }

        // Crear calificación
        $calificacionData = $data['calificaciones'];
        $calificacion = new Calificacion();
        $calificacion->setDefensa($defensa);
        $calificacion->setEvaluador($evaluador);
        $calificacion->setNotaPresentacion($calificacionData['nota_presentacion'] ?? null);
        $calificacion->setNotaContenido($calificacionData['nota_contenido'] ?? null);
        $calificacion->setNotaDefensa($calificacionData['nota_defensa'] ?? null);
        $calificacion->setComentarios($calificacionData['comentarios'] ?? '');

        // Calcular nota final (promedio)
        $notas = array_filter([
            $calificacion->getNotaPresentacion(),
            $calificacion->getNotaContenido(),
            $calificacion->getNotaDefensa()
        ]);

        if (!empty($notas)) {
            $notaFinal = array_sum($notas) / count($notas);
            $calificacion->setNotaFinal($notaFinal);
        }

        // Validar
        $errors = $this->validator->validate($calificacion);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->persist($calificacion);

        // Si todos los miembros han calificado, calcular nota final del TFG
        $totalMiembros = 3;
        $calificacionesCount = $this->calificacionRepository->count(['defensa' => $defensa]) + 1; // +1 por la actual

        if ($calificacionesCount >= $totalMiembros) {
            $notaFinalTfg = $this->calificacionRepository->calcularNotaFinal($defensa);
            $defensa->getTfg()->setCalificacion($notaFinalTfg);

            // Notificar al estudiante
            $this->notificacionService->notificarCalificacionPublicada(
                $defensa->getTfg()->getEstudiante(),
                $defensa->getTfg()->getTitulo(),
                $notaFinalTfg
            );
        }

        $this->entityManager->flush();

        return $this->json($calificacion, 201, [], ['groups' => ['calificacion:read', 'user:basic']]);
    }

    /**
     * DELETE /api/defensas/{id}
     * Cancelar/eliminar defensa (solo antes de que ocurra)
     */
    #[Route('/{id}', name: 'api_defensas_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $defensa = $this->defensaRepository->find($id);
        
        if (!$defensa) {
            return $this->json(['error' => 'Defensa no encontrada'], 404);
        }

        $this->denyAccessUnlessGranted('defensa_delete', $defensa);

        // Solo se puede eliminar si está programada y es futura
        if ($defensa->getEstado() !== 'programada') {
            return $this->json(['error' => 'Solo se pueden eliminar defensas programadas'], 400);
        }

        if ($defensa->getFechaDefensa() <= new \DateTime()) {
            return $this->json(['error' => 'No se puede eliminar una defensa pasada'], 400);
        }

        // Notificar cancelación antes de eliminar
        $tfg = $defensa->getTfg();
        $estudiante = $tfg->getEstudiante();
        $tribunal = $defensa->getTribunal();

        $mensaje = "La defensa del TFG '{$tfg->getTitulo()}' programada para el " . 
                  $defensa->getFechaDefensa()->format('d/m/Y \a \l\a\s H:i') . " ha sido cancelada.";

        // Notificar estudiante
        $this->notificacionService->crearNotificacion(
            $estudiante,
            'Defensa Cancelada',
            $mensaje,
            'error',
            ['tipo_evento' => 'defensa_eliminada'],
            true
        );

        // Notificar tribunal
        $miembros = [$tribunal->getPresidente(), $tribunal->getSecretario(), $tribunal->getVocal()];
        foreach ($miembros as $miembro) {
            if ($miembro) {
                $this->notificacionService->crearNotificacion(
                    $miembro,
                    'Defensa Cancelada',
                    $mensaje,
                    'warning',
                    ['tipo_evento' => 'defensa_eliminada']
                );
            }
        }

        $this->entityManager->remove($defensa);
        $this->entityManager->flush();

        return $this->json(['message' => 'Defensa eliminada correctamente']);
    }
}