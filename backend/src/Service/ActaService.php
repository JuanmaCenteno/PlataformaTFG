<?php

namespace App\Service;

use App\Entity\Defensa;
use App\Entity\Calificacion;
use TCPDF;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class ActaService
{
    private const ACTAS_DIR = '/var/www/html/public/uploads/actas/';

    public function __construct(
        private EntityManagerInterface $entityManager,
        private ParameterBagInterface $params
    ) {}

    /**
     * Genera el acta de defensa en PDF y la guarda
     */
    public function generarActaDefensa(Defensa $defensa): string
    {
        // Crear directorio si no existe
        $actasDir = $this->getActasDirectory();
        if (!is_dir($actasDir)) {
            mkdir($actasDir, 0755, true);
        }

        // Generar nombre único del archivo
        $nombreArchivo = $this->generarNombreArchivo($defensa);
        $rutaCompleta = $actasDir . $nombreArchivo;

        // Crear el PDF
        $pdf = $this->crearPDF($defensa);

        // Guardar el archivo
        $pdf->Output($rutaCompleta, 'F');

        return $nombreArchivo;
    }

    /**
     * Crea el PDF del acta con toda la información
     */
    private function crearPDF(Defensa $defensa): TCPDF
    {
        $tfg = $defensa->getTfg();
        $tribunal = $defensa->getTribunal();
        $calificaciones = $defensa->getCalificaciones();

        // Configurar PDF
        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8');

        // Configuración del documento
        $pdf->SetCreator('Plataforma TFG');
        $pdf->SetAuthor('Universidad - Sistema TFG');
        $pdf->SetTitle('Acta de Defensa - ' . $tfg->getTitulo());
        $pdf->SetSubject('Acta de Defensa de TFG');

        // Configurar márgenes
        $pdf->SetMargins(20, 30, 20);
        $pdf->SetHeaderMargin(10);
        $pdf->SetFooterMargin(15);

        // Configurar fuente
        $pdf->SetFont('helvetica', '', 11);

        // Agregar página
        $pdf->AddPage();

        // Contenido del acta
        $this->agregarEncabezado($pdf, $defensa);
        $this->agregarDatosTFG($pdf, $tfg);
        $this->agregarDatosTribunal($pdf, $tribunal);
        $this->agregarCalificaciones($pdf, $calificaciones);
        $this->agregarResumenFinal($pdf, $tfg);
        $this->agregarFirmas($pdf, $tribunal, $defensa);

        return $pdf;
    }

    /**
     * Agrega el encabezado del acta
     */
    private function agregarEncabezado(TCPDF $pdf, Defensa $defensa): void
    {
        // Logo y título principal
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 15, 'UNIVERSIDAD DE CÁDIZ - ACTA DE DEFENSA DE TFG', 0, 1, 'C');

        $pdf->Ln(5);

        // Información básica
        $pdf->SetFont('helvetica', '', 11);
        $fechaDefensa = $defensa->getFechaDefensa()->format('d/m/Y');
        $horaDefensa = $defensa->getFechaDefensa()->format('H:i');

        $pdf->Cell(0, 8, 'Fecha de Defensa: ' . $fechaDefensa, 0, 1, 'L');
        $pdf->Cell(0, 8, 'Hora: ' . $horaDefensa, 0, 1, 'L');
        $pdf->Cell(0, 8, 'Ubicación: ' . ($defensa->getAula() ?: 'No especificada'), 0, 1, 'L');

        $pdf->Ln(10);
    }

    /**
     * Agrega datos del TFG
     */
    private function agregarDatosTFG(TCPDF $pdf, $tfg): void
    {
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->Cell(0, 10, 'DATOS DEL TRABAJO FIN DE GRADO', 0, 1, 'L');
        $pdf->Ln(5);

        $pdf->SetFont('helvetica', '', 11);

        // Título del TFG
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(30, 8, 'Título: ', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', 11);
        $pdf->MultiCell(0, 8, $tfg->getTitulo(), 0, 'L');
        $pdf->Ln(3);

        // Estudiante
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(30, 8, 'Estudiante: ', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(0, 8, $tfg->getEstudiante()->getNombreCompleto(), 0, 1, 'L');

        // Email estudiante
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(30, 8, 'Email: ', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(0, 8, $tfg->getEstudiante()->getEmail(), 0, 1, 'L');

        // Tutor
        if ($tfg->getTutor()) {
            $pdf->SetFont('helvetica', 'B', 11);
            $pdf->Cell(30, 8, 'Tutor: ', 0, 0, 'L');
            $pdf->SetFont('helvetica', '', 11);
            $pdf->Cell(0, 8, $tfg->getTutor()->getNombreCompleto(), 0, 1, 'L');
        }

        // Resumen si existe
        if ($tfg->getResumen()) {
            $pdf->Ln(5);
            $pdf->SetFont('helvetica', 'B', 11);
            $pdf->Cell(0, 8, 'Resumen:', 0, 1, 'L');
            $pdf->SetFont('helvetica', '', 10);
            $pdf->MultiCell(0, 6, $tfg->getResumen(), 0, 'J');
        }

        // Palabras clave
        if ($tfg->getPalabrasClave()) {
            $palabras = is_array($tfg->getPalabrasClave()) ?
                implode(', ', $tfg->getPalabrasClave()) :
                $tfg->getPalabrasClave();
            $pdf->Ln(3);
            $pdf->SetFont('helvetica', 'B', 11);
            $pdf->Cell(40, 8, 'Palabras clave: ', 0, 0, 'L');
            $pdf->SetFont('helvetica', '', 11);
            $pdf->MultiCell(0, 8, $palabras, 0, 'L');
        }

        $pdf->Ln(10);
    }

    /**
     * Agrega datos del tribunal
     */
    private function agregarDatosTribunal(TCPDF $pdf, $tribunal): void
    {
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->Cell(0, 10, 'COMPOSICIÓN DEL TRIBUNAL', 0, 1, 'L');
        $pdf->Ln(5);

        $pdf->SetFont('helvetica', '', 11);

        // Presidente
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(30, 8, 'Presidente: ', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(0, 8, $tribunal->getPresidente()->getNombreCompleto(), 0, 1, 'L');

        // Secretario
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(30, 8, 'Secretario: ', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(0, 8, $tribunal->getSecretario()->getNombreCompleto(), 0, 1, 'L');

        // Vocal
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(30, 8, 'Vocal: ', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(0, 8, $tribunal->getVocal()->getNombreCompleto(), 0, 1, 'L');

        $pdf->Ln(10);
    }

    /**
     * Agrega las calificaciones individuales
     */
    private function agregarCalificaciones(TCPDF $pdf, $calificaciones): void
    {
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->Cell(0, 10, 'CALIFICACIONES', 0, 1, 'L');
        $pdf->Ln(5);

        // Ordenar calificaciones por rol (Presidente, Secretario, Vocal)
        $calificacionesOrdenadas = [];
        foreach ($calificaciones as $calificacion) {
            $rol = $calificacion->getRolEvaluador();
            $calificacionesOrdenadas[$rol] = $calificacion;
        }

        // Orden específico para mostrar
        $ordenRoles = ['Presidente', 'Secretario', 'Vocal'];

        foreach ($ordenRoles as $rol) {
            if (isset($calificacionesOrdenadas[$rol])) {
                $calificacion = $calificacionesOrdenadas[$rol];
                $evaluador = $calificacion->getEvaluador();

                $pdf->SetFont('helvetica', 'B', 12);
                $pdf->Cell(0, 8, $rol . ': ' . $evaluador->getNombreCompleto(), 0, 1, 'L');

                $pdf->SetFont('helvetica', '', 11);

                // Primera fila de calificaciones
                $pdf->Cell(35, 6, 'Originalidad: ', 0, 0, 'L');
                $pdf->Cell(20, 6, number_format((float)$calificacion->getNotaOriginalidad(), 2) . '/10', 0, 0, 'L');
                $pdf->Cell(35, 6, 'Presentación: ', 0, 0, 'L');
                $pdf->Cell(20, 6, number_format((float)$calificacion->getNotaPresentacion(), 2) . '/10', 0, 0, 'L');
                $pdf->Cell(35, 6, 'Implementación: ', 0, 0, 'L');
                $pdf->Cell(0, 6, number_format((float)$calificacion->getNotaImplementacion(), 2) . '/10', 0, 1, 'L');

                // Segunda fila de calificaciones
                $pdf->Cell(35, 6, 'Contenido: ', 0, 0, 'L');
                $pdf->Cell(20, 6, number_format((float)$calificacion->getNotaContenido(), 2) . '/10', 0, 0, 'L');
                $pdf->Cell(35, 6, 'Defensa: ', 0, 0, 'L');
                $pdf->Cell(20, 6, number_format((float)$calificacion->getNotaDefensa(), 2) . '/10', 0, 0, 'L');
                $pdf->Cell(35, 6, 'Nota Final: ', 0, 0, 'L');
                $pdf->Cell(0, 6, number_format((float)$calificacion->getNotaFinal(), 2) . '/10', 0, 1, 'L');

                if ($calificacion->getComentarios()) {
                    $pdf->Ln(2);
                    $pdf->SetFont('helvetica', 'B', 10);
                    $pdf->Cell(0, 6, 'Comentarios: ', 0, 1, 'L');
                    $pdf->SetFont('helvetica', 'I', 10);
                    $pdf->MultiCell(0, 5, $calificacion->getComentarios(), 0, 'L');
                }

                $pdf->Ln(5);
            }
        }
    }

    /**
     * Agrega el resumen final con la nota media
     */
    private function agregarResumenFinal(TCPDF $pdf, $tfg): void
    {
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->Cell(0, 10, 'RESULTADO DE LA EVALUACIÓN', 0, 1, 'L');
        $pdf->Ln(5);

        // Configurar color de fondo para la calificación final
        $pdf->SetFillColor(230, 230, 230);
        $pdf->SetFont('helvetica', 'B', 13);
        $notaFinal = number_format($tfg->getCalificacion(), 2);
        $pdf->Cell(0, 10, 'CALIFICACIÓN FINAL: ' . $notaFinal . '/10', 1, 1, 'C', true);

        $pdf->SetFont('helvetica', 'B', 12);
        $nivel = $this->obtenerNivelCalificacion($tfg->getCalificacion());
        $pdf->Cell(0, 8, 'NIVEL: ' . $nivel, 0, 1, 'C');

        $pdf->Ln(5);

        $pdf->SetFont('helvetica', 'B', 11);
        $resultado = $tfg->getCalificacion() >= 5.0 ? 'APROBADO' : 'SUSPENSO';
        $pdf->Cell(0, 8, 'RESULTADO: ' . $resultado, 0, 1, 'C');

        $pdf->Ln(10);
    }

    /**
     * Agrega las firmas del tribunal
     */
    private function agregarFirmas(TCPDF $pdf, $tribunal, Defensa $defensa): void
    {
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 10, 'FIRMAS DEL TRIBUNAL', 0, 1, 'L');
        $pdf->Ln(10);

        // Calcular ancho para tres columnas centradas
        $anchoTotal = 170; // Ancho disponible (210 - márgenes)
        $anchoColumna = 50;
        $separacion = 10;

        // Añadir firmas falsas usando curvas Bézier para simular escritura
        $this->agregarFirmaFalsa($pdf, 35, $pdf->GetY(), 'Presidente');
        $this->agregarFirmaFalsa($pdf, 95, $pdf->GetY(), 'Secretario');
        $this->agregarFirmaFalsa($pdf, 155, $pdf->GetY(), 'Vocal');

        $pdf->Ln(25);

        // Líneas para firmas
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell($anchoColumna, 0, '', 'B', 0, 'C');
        $pdf->Cell($separacion, 0, '', 0, 0, 'C');
        $pdf->Cell($anchoColumna, 0, '', 'B', 0, 'C');
        $pdf->Cell($separacion, 0, '', 0, 0, 'C');
        $pdf->Cell($anchoColumna, 0, '', 'B', 1, 'C');

        $pdf->Ln(3);

        // Títulos de roles
        $pdf->Cell($anchoColumna, 6, 'Presidente', 0, 0, 'C');
        $pdf->Cell($separacion, 6, '', 0, 0, 'C');
        $pdf->Cell($anchoColumna, 6, 'Secretario', 0, 0, 'C');
        $pdf->Cell($separacion, 6, '', 0, 0, 'C');
        $pdf->Cell($anchoColumna, 6, 'Vocal', 0, 1, 'C');

        $pdf->Ln(3);

        // Nombres de los miembros del tribunal
        $pdf->SetFont('helvetica', '', 8);
        $pdf->Cell($anchoColumna, 4, $tribunal->getPresidente()->getNombreCompleto(), 0, 0, 'C');
        $pdf->Cell($separacion, 4, '', 0, 0, 'C');
        $pdf->Cell($anchoColumna, 4, $tribunal->getSecretario()->getNombreCompleto(), 0, 0, 'C');
        $pdf->Cell($separacion, 4, '', 0, 0, 'C');
        $pdf->Cell($anchoColumna, 4, $tribunal->getVocal()->getNombreCompleto(), 0, 1, 'C');

        // Fecha y lugar
        $pdf->Ln(15);
        $pdf->SetFont('helvetica', '', 10);
        $fechaDefensa = $defensa->getFechaDefensa()->format('d/m/Y');
        $pdf->Cell(0, 8, 'En Cádiz, a ' . $fechaDefensa, 0, 1, 'C');
    }

    /**
     * Agrega una firma falsa usando gráficos vectoriales
     */
    private function agregarFirmaFalsa(TCPDF $pdf, float $x, float $y, string $tipo): void
    {
        // Guardar estado actual
        $pdf->StartTransform();

        // Configurar color y grosor de línea
        $pdf->SetDrawColor(0, 0, 0);
        $pdf->SetLineWidth(0.3);

        // Diferentes estilos de firma según el tipo
        switch ($tipo) {
            case 'Presidente':
                // Firma elegante con bucles
                $pdf->Curve(25, $y + 5, 30, $y, 35, $y + 8, 40, $y + 3);
                $pdf->Curve(40, $y + 3, 45, $y - 2, 50, $y + 5, 55, $y + 2);
                $pdf->Line(25, $y + 8, 55, $y + 8);
                break;

            case 'Secretario':
                // Firma con rúbrica más simple
                $pdf->Curve(85, $y + 6, 90, $y + 2, 95, $y + 7, 100, $y + 4);
                $pdf->Curve(100, $y + 4, 105, $y + 1, 110, $y + 6, 115, $y + 3);
                $pdf->Line(85, $y + 9, 95, $y + 6);
                $pdf->Line(105, $y + 6, 115, $y + 9);
                break;

            case 'Vocal':
                // Firma más compacta
                $pdf->Curve(145, $y + 5, 150, $y + 1, 155, $y + 6, 160, $y + 3);
                $pdf->Curve(160, $y + 3, 165, $y, 170, $y + 5, 175, $y + 2);
                $pdf->Line(145, $y + 7, 175, $y + 7);
                break;
        }

        // Restaurar estado
        $pdf->StopTransform();
    }

    /**
     * Genera nombre único para el archivo del acta
     */
    private function generarNombreArchivo(Defensa $defensa): string
    {
        $tfg = $defensa->getTfg();
        $fecha = $defensa->getFechaDefensa()->format('Y-m-d');
        $nombreLimpio = preg_replace('/[^a-zA-Z0-9\-_]/', '_', $tfg->getTitulo());
        $nombreLimpio = substr($nombreLimpio, 0, 50); // Limitar longitud

        return sprintf(
            'acta_defensa_%d_%s_%s.pdf',
            $defensa->getId(),
            $fecha,
            $nombreLimpio
        );
    }

    /**
     * Obtiene el directorio donde se guardan las actas
     */
    private function getActasDirectory(): string
    {
        return self::ACTAS_DIR;
    }

    /**
     * Obtiene el nivel de calificación según la nota
     */
    private function obtenerNivelCalificacion(float $nota): string
    {
        return match(true) {
            $nota >= 9.0 => 'SOBRESALIENTE',
            $nota >= 7.0 => 'NOTABLE',
            $nota >= 5.0 => 'APROBADO',
            default => 'SUSPENSO'
        };
    }

    /**
     * Verifica si un acta existe
     */
    public function actaExiste(string $nombreArchivo): bool
    {
        $rutaCompleta = $this->getActasDirectory() . $nombreArchivo;
        return file_exists($rutaCompleta);
    }

    /**
     * Obtiene la ruta completa del acta
     */
    public function obtenerRutaActa(string $nombreArchivo): string
    {
        return $this->getActasDirectory() . $nombreArchivo;
    }
}