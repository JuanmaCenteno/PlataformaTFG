#!/bin/bash
# scripts/generate-pdf.sh

echo "📄 Generando documentación PDF profesional..."

# Crear directorio de salida
mkdir -p pdf-output

# Configurar variables
TITLE="Plataforma de Gestión de TFG - Documentación Técnica"
AUTHOR="Tu Nombre"
DATE=$(date +"%d de %B de %Y")

# Generar PDF unificado con todos los capítulos
pandoc docs/01_vision_general.md \
        docs/02_contexto_proyecto.md \
        docs/03_planificacion.md \
        docs/04_analisis_sistema.md \
        docs/05_diseno.md \
        docs/06_implementacion.md \
        docs/07_entrega_producto.md \
        docs/08_procesos_soporte.md \
        docs/09_conclusiones.md \
        docs/anexos/manual_instalacion.md \
        -o "pdf-output/Documentacion_Tecnica_TFG.pdf" \
        --pdf-engine=xelatex \
        --template=template.tex \
        --toc \
        --toc-depth=3 \
        --number-sections \
        --highlight-style=github \
        --geometry=margin=2.5cm \
        --fontsize=11pt \
        --linestretch=1.2 \
        --metadata title="$TITLE" \
        --metadata author="$AUTHOR" \
        --metadata date="$DATE" \
        --metadata documentclass="report" \
        --metadata geometry="a4paper" \
        --metadata lang="es-ES"

echo "✅ PDF generado: pdf-output/Documentacion_Tecnica_TFG.pdf"