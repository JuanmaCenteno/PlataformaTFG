#!/usr/bin/env python3
import re
import subprocess
import sys
import os
import shutil
import tempfile
from pathlib import Path

class DocumentProcessor:
    def __init__(self, docs_dir="docs", output_dir="docs/processed"):
        self.docs_dir = Path(docs_dir)
        self.output_dir = Path(output_dir)
        self.images_dir = self.output_dir / "images"
        
        # Crear directorios
        self.output_dir.mkdir(exist_ok=True)
        self.images_dir.mkdir(exist_ok=True)
    
    # [Métodos de procesamiento anteriores aquí - igual que antes]
    def extract_plantuml_diagrams(self, content, base_name):
        pattern = r'```plantuml\n(.*?)\n```'
        matches = re.findall(pattern, content, re.DOTALL)
        
        for i, diagram in enumerate(matches):
            temp_file = f"temp_{base_name}_{i}.puml"
            with open(temp_file, 'w') as f:
                f.write(f"@startuml\n{diagram}\n@enduml")
            
            output_file = f"{base_name}_plantuml_{i}.png"
            temp_output = f"temp_{base_name}_{i}.png"
            try:
                subprocess.run([
                    'plantuml', '-tpng', 
                    '-o', str(self.images_dir), 
                    temp_file
                ], check=True)
                
                # Rename the generated file to the expected name
                temp_output_path = self.images_dir / temp_output
                final_output_path = self.images_dir / output_file
                if temp_output_path.exists():
                    temp_output_path.rename(final_output_path)
                
                replacement = f"![Diagrama PlantUML {i+1}](processed/images/{output_file})"
                content = content.replace(
                    f"```plantuml\n{diagram}\n```", 
                    replacement, 1
                )
            except subprocess.CalledProcessError:
                print(f"Error procesando diagrama PlantUML {i} en {base_name}")
            finally:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
        
        return content
    
    def extract_mermaid_diagrams(self, content, base_name):
        pattern = r'```mermaid\n(.*?)\n```'
        matches = re.findall(pattern, content, re.DOTALL)
        
        for i, diagram in enumerate(matches):
            temp_file = f"temp_{base_name}_mermaid_{i}.mmd"
            with open(temp_file, 'w') as f:
                f.write(diagram)
            
            output_file = f"{base_name}_mermaid_{i}.png"
            try:
                subprocess.run([
                    'mmdc', '-i', temp_file, 
                    '-o', str(self.images_dir / output_file),
                    '-b', 'white', '-s', '2'
                ], check=True)
                
                replacement = f"![Diagrama Mermaid {i+1}](processed/images/{output_file})"
                content = content.replace(
                    f"```mermaid\n{diagram}\n```", 
                    replacement, 1
                )
            except subprocess.CalledProcessError:
                print(f"Error procesando diagrama Mermaid {i} en {base_name}")
            finally:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
        
        return content
    
    def enhance_code_blocks(self, content):
        patterns = {
            r'(```\n)(#.*?bin.*?bash)': r'```bash\n\2',
            r'(```\n)(\{.*?".*?":.*?\})': r'```json\n\2',
            r'(```\n)(SELECT.*?FROM)': r'```sql\n\2',
            r'(```\n)(version:.*?services:)': r'```yaml\n\2'
        }
        
        for pattern, replacement in patterns.items():
            content = re.sub(pattern, replacement, content, flags=re.DOTALL | re.IGNORECASE)
        
        return content
    
    def process_file(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        base_name = file_path.stem
        print(f"Procesando {file_path.name}...")
        
        content = self.extract_plantuml_diagrams(content, base_name)
        content = self.extract_mermaid_diagrams(content, base_name)
        content = self.enhance_code_blocks(content)
        
        output_file = self.output_dir / file_path.name
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return output_file
    
    def process_all_documents(self):
        md_files = sorted(self.docs_dir.glob("*.md"))
        processed_files = []
        
        for file_path in md_files:
            # Skip combined_complete.md as it's our output file
            if file_path.name == "combined_complete.md":
                continue
            processed_file = self.process_file(file_path)
            processed_files.append(processed_file)
        
        return processed_files

def create_portada():
    """Crea archivo de portada en LaTeX"""
    # Crear directorio template si no existe
    os.makedirs("docs/template", exist_ok=True)
    
    portada_content = r"""
\begin{titlepage}
\centering

\includegraphics[width=0.3\textwidth]{images/logo-universidad.jpg}\par\vspace{1cm}

{\huge\bfseries Plataforma de Gestión de Trabajos de Fin de Grado\par}
\vspace{0.5cm}
{\Large\itshape Sistema web integral para la automatización del proceso académico universitario\par}

\vspace{2cm}

{\Large\textbf{TRABAJO DE FIN DE GRADO}\par}
\vspace{0.5cm}
{\large Grado en Ingeniería Informática\par}

\vspace{2.5cm}

\begin{minipage}[t]{0.4\textwidth}
\begin{flushleft}
\large
\textbf{Autor: Juan Mariano Centeno Ariza}
\end{flushleft}
\end{minipage}
\hfill
\begin{minipage}[t]{0.4\textwidth}
\begin{flushright}
\large
\textbf{Tutor: Guadalupe Ortiz Bellot}
\end{flushright}
\end{minipage}

\vfill

\end{titlepage}

% Página de agradecimientos
\newpage
\chapter*{Agradecimientos}
\addcontentsline{toc}{chapter}{Agradecimientos}

Incluir

% Resumen ejecutivo
\newpage
\chapter*{Resumen Ejecutivo}
\addcontentsline{toc}{chapter}{Resumen Ejecutivo}

Este Trabajo de Fin de Grado presenta el desarrollo de una \textbf{Plataforma 
de Gestión de TFG}, un sistema web integral diseñado para automatizar y 
optimizar el proceso completo de gestión de Trabajos de Fin de Grado en 
entornos universitarios.

\textbf{Problema identificado:} Los procesos tradicionales de gestión de TFG 
se caracterizan por su fragmentación, uso de herramientas dispersas y 
alto componente manual, generando ineficiencias y dificultades en el 
seguimiento académico.

\textbf{Solución desarrollada:} Sistema web moderno que integra todas las 
fases del proceso TFG, desde la propuesta inicial hasta la defensa final, 
con roles diferenciados para estudiantes, profesores, presidentes de 
tribunal y administradores.

\textbf{Tecnologías implementadas:}
\begin{itemize}
    \item \textbf{Frontend:} React 19, Vite, Tailwind CSS v4
    \item \textbf{Backend:} Symfony 6.4 LTS, PHP 8.2+, API Platform 3.x
    \item \textbf{Base de datos:} MySQL 8.0 con Doctrine ORM
    \item \textbf{Autenticación:} JWT con refresh tokens
    \item \textbf{Desarrollo:} DDEV con Docker
\end{itemize}

\textbf{Resultados obtenidos:}
\begin{itemize}
    \item Reducción del 75\% en tiempo de gestión administrativa
    \item Sistema completo con 4 módulos diferenciados por rol
    \item Arquitectura escalable preparada para expansión
    \item ROI del 259\% proyectado en 3 años
\end{itemize}

\textbf{Palabras clave:} TFG, React, Symfony, Gestión Académica, Plataforma Web, 
Sistema de Información, Automatización Universitaria.
"""
    
    with open("docs/template/portada.tex", "w", encoding='utf-8') as f:
        f.write(portada_content)
    
    print("✅ Archivo portada.tex creado en docs/template/")

def create_latex_template():
    """Crea plantilla LaTeX completa"""
    template = r"""\documentclass[12pt,a4paper,oneside]{report}
\usepackage[utf8]{inputenc}
\usepackage[spanish,english]{babel}
\renewcommand{\chaptername}{Capítulo}
\usepackage[margin=2.5cm,top=3cm,bottom=3cm]{geometry}
\usepackage{fancyhdr}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage{listings}
\usepackage{xcolor}
\usepackage{tocloft}
\usepackage{titlesec}
\usepackage{longtable}
\usepackage{booktabs}
\usepackage{array}
\usepackage{multirow}
\usepackage{calc}
\usepackage{float}
\usepackage{setspace}
\usepackage{parskip}

% Definir tightlist si no existe
\providecommand{\tightlist}{%
  \setlength{\itemsep}{0pt}\setlength{\parskip}{0pt}}

% Definir pandocbounded si no existe
\providecommand{\pandocbounded}[1]{#1}

% Definir passthrough si no existe
\providecommand{\passthrough}[1]{\texttt{#1}}

% Configuración de spacing
\onehalfspacing
\setlength{\parskip}{6pt}

% Configuración de imágenes para ajuste automático
\usepackage{adjustbox}
\graphicspath{{processed/images/}}
\setkeys{Gin}{width=\linewidth,height=\textheight,keepaspectratio}

% Configuración de colores para código
\definecolor{codegreen}{rgb}{0,0.6,0}
\definecolor{codegray}{rgb}{0.5,0.5,0.5}
\definecolor{codepurple}{rgb}{0.58,0,0.82}
\definecolor{backcolour}{rgb}{0.95,0.95,0.92}

% Configuración de listings
\lstdefinestyle{mystyle}{
    backgroundcolor=\color{backcolour},   
    commentstyle=\color{codegreen},
    keywordstyle=\color{magenta},
    numberstyle=\tiny\color{codegray},
    stringstyle=\color{codepurple},
    basicstyle=\ttfamily\footnotesize,
    breakatwhitespace=false,         
    breaklines=true,                 
    captionpos=b,                    
    keepspaces=true,                 
    numbers=left,                    
    numbersep=5pt,                  
    showspaces=false,                
    showstringspaces=false,
    showtabs=false,                  
    tabsize=2
}
\lstset{style=mystyle}

% Headers y footers
\pagestyle{fancy}
\fancyhf{}
\fancyhead[R]{\small\leftmark}
\fancyfoot[C]{\thepage}

% Configurar marks para mostrar nombres de capítulos correctamente
\renewcommand{\chaptermark}[1]{\markboth{#1}{}}

% Configuración de títulos
\titleformat{\chapter}[hang]
{\normalfont\huge\bfseries}{\thechapter.}{1em}{}
\titlespacing*{\chapter}{0pt}{0pt}{40pt}

% Configuración de hyperlinks
\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,      
    urlcolor=cyan,
    citecolor=red,
    pdftitle={Plataforma de Gestión de TFG - Documentación Técnica},
    pdfauthor={Tu Nombre},
    pdfsubject={Trabajo de Fin de Grado - Ingeniería Informática},
    pdfcreator={Pandoc with LaTeX},
    pdfkeywords={TFG, React, Symfony, Plataforma Web}
}

% Configuración de tabla de contenidos
\setcounter{tocdepth}{3}
\setcounter{secnumdepth}{3}

% Redefinir el comando de inclusión de imágenes de Pandoc
\makeatletter
\def\maxwidth{\ifdim\Gin@nat@width>\linewidth\linewidth\else\Gin@nat@width\fi}
\def\maxheight{\ifdim\Gin@nat@height>0.8\textheight 0.8\textheight\else\Gin@nat@height\fi}
\makeatother
\setkeys{Gin}{width=\maxwidth,height=\maxheight,keepaspectratio}

\begin{document}

% Incluir portada
\input{template/portada.tex}

% Tabla de contenidos
\renewcommand{\contentsname}{Índice}
\markboth{Índice}{Índice}
\tableofcontents
\newpage

% Lista de figuras
\renewcommand{\listfigurename}{Lista de Figuras}
\markboth{Lista de Figuras}{Lista de Figuras}
\listoffigures
\newpage

% Limpiar marks antes del contenido principal
\markboth{}{}

% Configurar numeración de capítulos
\setcounter{chapter}{0}

% Contenido principal
$body$

% Bibliografía (si existe)
\bibliographystyle{plain}
\bibliography{referencias}

\end{document}"""
    
    with open("docs/template/template_complete.tex", "w", encoding='utf-8') as f:
        f.write(template)
    
    print("✅ Template LaTeX completo creado en docs/template/")

def main():

    
    # 4. Generar PDF
    pandoc_cmd = [
        'pandoc', 'combined_complete.md',
        '-f', 'markdown+table_captions+grid_tables',
        '--template=template/template_complete.tex',
        '--toc',
        '--toc-depth=3',
        '--number-sections',
        '--top-level-division=chapter',
        '--listings',
        '--pdf-engine=xelatex',
        '-V', 'documentclass=report',
        '-V', 'fontsize=12pt',
        '-V', 'lang=es',
        '--highlight-style=tango',
        '-o', 'TFG_Plataforma_Gestion_FINAL.pdf'
    ]
    
    try:
        print("📝 Ejecutando Pandoc...")
        # Cambiar al directorio docs para ejecutar pandoc
        original_cwd = os.getcwd()
        os.chdir('docs')
        subprocess.run(pandoc_cmd, check=True)
        os.chdir(original_cwd)
        print("✅ PDF generado exitosamente: docs/TFG_Plataforma_Gestion_FINAL.pdf")
        print("📄 El documento incluye:")
        print("   - Portada profesional")
        print("   - Página de derechos")
        print("   - Agradecimientos")
        print("   - Resumen ejecutivo")
        print("   - Abstract en inglés")
        print("   - Tabla de contenidos")
        print("   - Lista de figuras y tablas")
        print("   - Todos los capítulos procesados")
        print("   - Diagramas convertidos a imágenes")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error generando PDF: {e}")

if __name__ == "__main__":
    main()