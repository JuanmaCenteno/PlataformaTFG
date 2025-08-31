🏆 OPCIÓN RECOMENDADA: Pandoc + LaTeX

  Paso 1: Instalar herramientas

  # Windows (con Chocolatey)
  choco install pandoc miktex

  # macOS (con Homebrew)
  brew install pandoc basictex

  # Ubuntu/Linux
  sudo apt install pandoc texlive-full

  Paso 2: Script de conversión profesional

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

  Paso 3: Template LaTeX personalizado

  % template.tex - Template personalizado para documentación académica
  \documentclass[11pt,a4paper]{report}

  % Paquetes para idioma español
  \usepackage[spanish]{babel}
  \usepackage[utf8]{inputenc}
  \usepackage[T1]{fontenc}

  % Paquetes para diseño profesional
  \usepackage{geometry}
  \usepackage{fancyhdr}
  \usepackage{titlesec}
  \usepackage{tocloft}
  \usepackage{xcolor}
  \usepackage{graphicx}
  \usepackage{float}
  \usepackage{hyperref}

  % Configuración de geometría
  \geometry{
      a4paper,
      left=3cm,
      right=2.5cm,
      top=2.5cm,
      bottom=2.5cm
  }

  % Colores corporativos
  \definecolor{primary}{RGB}{59, 130, 246}
  \definecolor{secondary}{RGB}{107, 114, 128}

  % Configuración de hipervínculos
  \hypersetup{
      colorlinks=true,
      linkcolor=primary,
      urlcolor=primary,
      citecolor=primary,
      pdfborder={0 0 0}
  }

  % Encabezados y pies de página
  \pagestyle{fancy}
  \fancyhf{}
  \fancyhead[L]{\leftmark}
  \fancyhead[R]{\thepage}
  \fancyfoot[C]{Plataforma de Gestión de TFG - Documentación Técnica}

  % Formato de títulos
  \titleformat{\chapter}[display]
  {\normalfont\huge\bfseries\color{primary}}
  {\chaptertitlename\ \thechapter}{20pt}{\Huge}

  \titleformat{\section}
  {\normalfont\Large\bfseries\color{primary}}
  {\thesection}{1em}{}

  % Portada personalizada
  \makeatletter
  \def\maketitle{%
  \begin{titlepage}
  \centering
  \vspace*{2cm}

  {\Huge\bfseries\color{primary} Plataforma de Gestión de TFG \par}
  \vspace{0.5cm}
  {\LARGE\bfseries Documentación Técnica \par}
  \vspace{1cm}
  {\large Estándar ISO/IEEE 16326:2009 \par}

  \vspace{2cm}
  \includegraphics[width=0.3\textwidth]{logo-universidad.png}
  \vspace{1cm}

  {\Large\itshape \@author \par}
  \vspace{0.5cm}
  {\large Universidad \par}
  \vspace{0.5cm}
  {\large Grado en Ingeniería Informática \par}

  \vfill
  {\large \@date \par}
  \end{titlepage}
  }
  \makeatother

  % Configuración del índice
  \renewcommand{\contentsname}{Índice general}
  \renewcommand{\listfigurename}{Índice de figuras}
  \renewcommand{\listtablename}{Índice de tablas}

  \begin{document}
  \maketitle
  \tableofcontents
  \listoffigures
  \listoftables

  $body$

  \end{document}

  🚀 ALTERNATIVA RÁPIDA: GitBook (Recomendada para principiantes)

  Opción A: GitBook Online

  1. Ve a https://gitbook.com
  2. Crea cuenta gratuita
  3. Importa tu repositorio GitHub
  4. GitBook genera automáticamente PDF profesional

  Opción B: GitBook CLI Local

  # Instalar GitBook CLI
  npm install -g gitbook-cli

  # Inicializar libro
  gitbook init

  # Configurar book.json
  echo '{
    "title": "Plataforma de Gestión de TFG",
    "author": "Tu Nombre",
    "description": "Documentación Técnica ISO/IEEE 16326",
    "language": "es",
    "plugins": ["github", "anchors", "edit-link", "prism", "-highlight"],
    "pdf": {
      "pageNumbers": true,
      "fontSize": 12,
      "fontFamily": "Arial",
      "paperSize": "a4",
      "margin": {
        "right": 62,
        "left": 62,
        "top": 56,
        "bottom": 56
      }
    }
  }' > book.json

  # Generar PDF
  gitbook pdf . ./documentacion-tfg.pdf

  📚 OPCIÓN PROFESIONAL: Typora + CSS

  Paso 1: Instalar Typora

  - Descargar desde https://typora.io
  - Editor WYSIWYG especializado en Markdown

  Paso 2: CSS personalizado para exportar

  /* academic-theme.css */
  @media print {
    body {
      font-family: 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
    }

    h1 {
      color: #2563eb;
      font-size: 24pt;
      page-break-before: always;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
    }

    h2 {
      color: #2563eb;
      font-size: 18pt;
      margin-top: 20pt;
    }

    h3 {
      color: #374151;
      font-size: 14pt;
    }

    pre, code {
      font-family: 'Courier New', monospace;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 8px;
    }

    blockquote {
      border-left: 4px solid #2563eb;
      padding-left: 16px;
      margin-left: 0;
      font-style: italic;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }

    th, td {
      border: 1px solid #d1d5db;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #f3f4f6;
      font-weight: bold;
    }
  }

  ⚡ OPCIÓN ULTRA-RÁPIDA: Extensión VS Code

  Markdown PDF Extension

  1. Instalar extensión "Markdown PDF" en VS Code
  2. Abrir cualquier archivo .md
  3. Ctrl+Shift+P → "Markdown PDF: Export (pdf)"
  4. Configurar en settings.json:

  {
    "markdown-pdf.format": "A4",
    "markdown-pdf.displayHeaderFooter": true,
    "markdown-pdf.headerTemplate": "<div style='font-size:9px; margin-left:1cm;'><span class='title'></span></div>",
    "markdown-pdf.footerTemplate": "<div style='font-size:9px; margin:0 auto;'><span class='pageNumber'></span> / <span 
  class='totalPages'></span></div>",
    "markdown-pdf.margin": {
      "top": "2.5cm",
      "bottom": "2.5cm",
      "right": "2cm",
      "left": "3cm"
    }
  }

  🎨 MI RECOMENDACIÓN FINAL

  Para máxima calidad profesional:
  1. Pandoc + LaTeX (opción más profesional)
  2. Usa el script que te proporcioné
  3. Personaliza el template LaTeX con logo de tu universidad
  4. Resultado: PDF de calidad editorial

  Para rapidez y simplicidad:
  1. GitBook (más fácil, resultado muy profesional)
  2. Solo sube tus archivos .md
  3. Descarga PDF generado automáticamente

  ¿Cuál prefieres que desarrolle más detalladamente?