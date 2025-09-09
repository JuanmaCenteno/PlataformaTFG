#!/usr/bin/env python3
import subprocess
import sys
import os
from pathlib import Path
import shutil

def compile_latex_to_pdf():
    """
    Compila el archivo LaTeX generado a PDF usando xelatex
    """
    print("🚀 Iniciando compilación de LaTeX a PDF...")
    
    # Verificar que existe el archivo LaTeX
    latex_dir = Path("docs/latex_output")
    latex_file = latex_dir / "combined_complete.tex"
    
    if not latex_file.exists():
        print("❌ Error: No se encuentra el archivo docs/latex_output/combined_complete.tex")
        print("   Ejecuta primero generate_latex.py para generar el archivo LaTeX")
        return False
    
    print(f"📁 Cambiando al directorio: {latex_dir}")
    
    try:
        # Cambiar al directorio donde está el archivo LaTeX
        original_cwd = os.getcwd()
        os.chdir(latex_dir)
        
        print("📝 Primera pasada con xelatex...")
        # Primera compilación
        result1 = subprocess.run([
            'xelatex', 
            '-interaction=nonstopmode',  # No parar por errores menores
            'combined_complete.tex'
        ], capture_output=True, text=True)
        
        if result1.returncode != 0:
            print("❌ Error en primera pasada:")
            print("STDOUT:", result1.stdout[-1000:])  # Más líneas del output
            print("STDERR:", result1.stderr[-1000:])
        
        print("📝 Segunda pasada con xelatex (para referencias cruzadas)...")
        # Segunda compilación para resolver referencias
        result2 = subprocess.run([
            'xelatex',
            '-interaction=nonstopmode',
            'combined_complete.tex'
        ], capture_output=True, text=True)
        
        if result2.returncode != 0:
            print("❌ Error en segunda pasada:")
            print("STDOUT:", result2.stdout[-1000:])
            print("STDERR:", result2.stderr[-1000:])
        
        # Verificar que se generó el PDF
        pdf_file = Path("combined_complete.pdf")
        if pdf_file.exists() and pdf_file.stat().st_size > 1000:  # Al menos 1KB
            print("✅ PDF generado exitosamente!")
            
            # Mover el PDF al directorio docs
            final_pdf = Path("../../TFG_Plataforma_Gestion_LATEX.pdf")
            if final_pdf.exists():
                final_pdf.unlink()  # Eliminar PDF anterior
            shutil.move(str(pdf_file), str(final_pdf))
            
            print(f"📄 PDF final guardado como: {final_pdf.resolve()}")
            print(f"📏 Tamaño del PDF: {final_pdf.stat().st_size} bytes")
            
            # Limpiar archivos auxiliares (comentado para debug)
            # cleanup_auxiliary_files()
            
            return True
        else:
            print("❌ Error: No se pudo generar el archivo PDF")
            if pdf_file.exists():
                print(f"⚠️ Se generó un PDF pero es muy pequeño: {pdf_file.stat().st_size} bytes")
            print("🔍 Revisa los errores en la compilación LaTeX")
            print("🔧 Los errores más comunes son:")
            print("   - Imágenes faltantes")
            print("   - Referencias rotas") 
            print("   - Comandos LaTeX no válidos")
            return False
            
    except FileNotFoundError:
        print("❌ Error: xelatex no está instalado o no se encuentra en el PATH")
        print("💡 Instala LaTeX con:")
        print("   - macOS: brew install --cask mactex")
        print("   - Ubuntu: sudo apt-get install texlive-xetex texlive-fonts-recommended")
        print("   - Windows: Instala MiKTeX o TeX Live")
        return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en la compilación LaTeX: {e}")
        return False
    finally:
        # Volver al directorio original
        os.chdir(original_cwd)

def cleanup_auxiliary_files():
    """
    Limpia archivos auxiliares generados por LaTeX
    """
    print("🧹 Limpiando archivos auxiliares...")
    
    auxiliary_extensions = ['.aux', '.log', '.toc', '.out', '.fdb_latexmk', 
                          '.fls', '.synctex.gz', '.lof', '.lot', '.bbl', '.blg']
    
    for ext in auxiliary_extensions:
        aux_file = Path(f"combined_complete{ext}")
        if aux_file.exists():
            aux_file.unlink()
            print(f"   🗑️  Eliminado: {aux_file.name}")

def show_compilation_info():
    """
    Muestra información sobre el proceso de compilación
    """
    print("📚 Información sobre la compilación LaTeX:")
    print("=" * 50)
    print("🔧 El script realiza:")
    print("   1. Primera pasada con xelatex (genera estructura básica)")
    print("   2. Segunda pasada con xelatex (resuelve referencias cruzadas)")
    print("   3. Limpia archivos auxiliares")
    print("   4. Mueve el PDF final a docs/")
    print("")
    print("⚙️  Configuración usada:")
    print("   - Motor: xelatex (soporta fuentes y Unicode)")
    print("   - Modo: nonstopmode (continúa ante errores menores)")
    print("   - Salida: TFG_Plataforma_Gestion_LATEX.pdf")

def main():
    """Función principal"""
    show_compilation_info()
    print("")
    
    # Compilar LaTeX a PDF
    if compile_latex_to_pdf():
        print("")
        print("🎉 ¡Compilación completada exitosamente!")
        print("📄 Tu documento PDF está listo")
        print("")
        print("💡 El archivo se guardó como: docs/TFG_Plataforma_Gestion_LATEX.pdf")
        print("🔍 Puedes abrirlo para revisar el resultado final")
        
    else:
        print("")
        print("❌ La compilación falló")
        print("🔧 Revisa el archivo LaTeX en docs/latex_output/combined_complete.tex")
        print("📝 Busca errores de sintaxis LaTeX o referencias rotas")
        sys.exit(1)

if __name__ == "__main__":
    main()