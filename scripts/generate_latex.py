#!/usr/bin/env python3
import subprocess
import sys
import os
from pathlib import Path

def generate_latex_from_combined():
    """
    Convierte el archivo combined_complete.md a LaTeX usando pandoc
    """
    print("🚀 Iniciando conversión de Markdown a LaTeX...")
    
    # Verificar que existe el archivo combined_complete.md
    combined_file = Path("docs/combined_complete.md")
    if not combined_file.exists():
        print("❌ Error: No se encuentra el archivo docs/combined_complete.md")
        print("   Ejecuta primero generate_pdf_complete.py para generar el archivo combinado")
        return False
    
    # Crear directorio de salida si no existe
    output_dir = Path("docs/latex_output")
    output_dir.mkdir(exist_ok=True)
    
    # Verificar que existe el template LaTeX
    template_file = Path("docs/template/template_complete.tex")
    if not template_file.exists():
        print("❌ Error: No se encuentra el template LaTeX en docs/template/template_complete.tex")
        print("   Ejecuta primero generate_pdf_complete.py para generar el template")
        return False
    
    # Archivo de salida LaTeX
    output_file = output_dir / "combined_complete.tex"
    
    # Comando pandoc para convertir a LaTeX
    pandoc_cmd = [
        'pandoc', 'combined_complete.md',
        '-f', 'markdown+table_captions+grid_tables',
        '--template=template/template_complete.tex',
        '--toc',
        '--toc-depth=3', 
        '--number-sections',
        '--top-level-division=chapter',
        '--listings',
        '-t', 'latex',  # Salida en formato LaTeX
        '-V', 'documentclass=report',
        '-V', 'fontsize=12pt',
        '-V', 'lang=es',
        '--highlight-style=tango',
        '-o', f'latex_output/{output_file.name}'
    ]
    
    try:
        print("📝 Ejecutando Pandoc para generar LaTeX...")
        # Cambiar al directorio docs para ejecutar pandoc
        original_cwd = os.getcwd()
        os.chdir('docs')
        
        # Asegurarse de que el directorio latex_output existe y tiene permisos
        latex_output_path = Path('latex_output')
        latex_output_path.mkdir(exist_ok=True)
        
        # Usar ruta absoluta para el archivo de salida
        abs_output_file = latex_output_path / 'combined_complete.tex'
        pandoc_cmd[-1] = str(abs_output_file.absolute())
        
        subprocess.run(pandoc_cmd, check=True)
        os.chdir(original_cwd)
        
        print(f"✅ Archivo LaTeX generado exitosamente: {output_file}")
        print("📄 El archivo LaTeX incluye:")
        print("   - Estructura completa del documento")
        print("   - Portada profesional")
        print("   - Tabla de contenidos") 
        print("   - Numeración automática de secciones")
        print("   - Todos los capítulos procesados")
        print("   - Configuración de código con syntax highlighting")
        print("")
        print("🔧 Ahora puedes editar el archivo LaTeX manualmente:")
        print(f"   - Archivo principal: {output_file}")
        print(f"   - Template base: docs/template/template_complete.tex")
        print(f"   - Portada: docs/template/portada.tex")
        print("")
        print("📝 Para compilar a PDF después de editar:")
        print(f"   cd {output_dir}")
        print("   xelatex combined_complete.tex")
        print("   xelatex combined_complete.tex  # Segunda pasada para referencias")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error generando LaTeX: {e}")
        print("🔍 Verifica que pandoc esté instalado y funcionando correctamente")
        return False
    except FileNotFoundError:
        print("❌ Error: pandoc no está instalado o no se encuentra en el PATH")
        print("💡 Instala pandoc con: brew install pandoc (macOS) o sudo apt-get install pandoc (Ubuntu)")
        return False

def copy_supporting_files():
    """
    Copia archivos de soporte necesarios para el LaTeX
    """
    print("📁 Copiando archivos de soporte...")
    
    output_dir = Path("docs/latex_output")
    
    # Copiar directorio de imágenes si existe
    images_source = Path("docs/processed/images")
    images_dest = output_dir / "processed" / "images"
    
    if images_source.exists():
        images_dest.parent.mkdir(exist_ok=True)
        import shutil
        if images_dest.exists():
            shutil.rmtree(images_dest)
        shutil.copytree(images_source, images_dest)
        print(f"   ✅ Imágenes copiadas a {images_dest}")
    
    # Copiar template
    template_source = Path("docs/template")
    template_dest = output_dir / "template"
    
    if template_source.exists():
        import shutil
        if template_dest.exists():
            shutil.rmtree(template_dest)
        shutil.copytree(template_source, template_dest)
        print(f"   ✅ Templates copiados a {template_dest}")

def main():
    """Función principal"""
    print("📚 Generador de LaTeX desde combined_complete.md")
    print("=" * 50)
    
    # Generar el archivo LaTeX
    if generate_latex_from_combined():
        # Copiar archivos de soporte
        copy_supporting_files()
        
        print("")
        print("🎉 ¡Proceso completado exitosamente!")
        print("🎯 El archivo LaTeX está listo para ser editado y compilado")
        print("")
        print("💡 Siguientes pasos recomendados:")
        print("   1. Edita el archivo docs/latex_output/combined_complete.tex")
        print("   2. Modifica docs/latex_output/template/portada.tex si necesitas cambiar la portada")
        print("   3. Compila con: cd docs/latex_output && xelatex combined_complete.tex")
        
    else:
        print("❌ No se pudo generar el archivo LaTeX")
        sys.exit(1)

if __name__ == "__main__":
    main()