#!/bin/bash

echo "🔧 Instalando dependencias para generación de PDF en macOS..."

# Verificar que Homebrew esté instalado
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew no está instalado. Instálalo desde https://brew.sh"
    exit 1
fi

echo "✅ Homebrew detectado"

# Actualizar Homebrew
echo "📦 Actualizando Homebrew..."
brew update

# Pandoc
if ! command -v pandoc &> /dev/null; then
    echo "📝 Instalando Pandoc..."
    brew install pandoc
else
    echo "✅ Pandoc ya instalado"
fi

# LaTeX
if ! command -v xelatex &> /dev/null; then
    echo "📝 Instalando MacTeX (LaTeX para macOS)..."
    brew install --cask mactex
    echo "⚠️  MacTeX instalado. Necesitarás reiniciar la terminal para que esté en el PATH"
else
    echo "✅ LaTeX ya instalado"
fi

# Verificar Python3 (viene preinstalado en macOS)
if ! command -v python3 &> /dev/null; then
    echo "🐍 Instalando Python3..."
    brew install python
else
    echo "✅ Python3 detectado: $(python3 --version)"
fi

# Verificar Node.js (ya lo tienes)
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
else
    echo "✅ Node.js detectado: $(node --version)"
fi

# PlantUML
if ! command -v plantuml &> /dev/null; then
    echo "☕ Instalando Java y PlantUML..."
    brew install openjdk
    brew install plantuml
else
    echo "✅ PlantUML ya instalado"
fi

# Mermaid CLI
if ! command -v mmdc &> /dev/null; then
    echo "🌊 Instalando Mermaid CLI..."
    npm install -g @mermaid-js/mermaid-cli
else
    echo "✅ Mermaid CLI ya instalado"
fi

# Graphviz para diagramas DOT
if ! command -v dot &> /dev/null; then
    echo "🔧 Instalando Graphviz..."
    brew install graphviz
else
    echo "✅ Graphviz ya instalado"
fi

# Python dependencies para gráficos
echo "📊 Instalando librerías Python para gráficos..."
pip3 install --upgrade pip
pip3 install Pillow matplotlib seaborn plotly kaleido

# Crear directorio para configuraciones
mkdir -p ~/.config/mermaid

# Configuración básica de Mermaid
cat > ~/.config/mermaid/config.json << 'EOF'
{
  "theme": "default",
  "width": 1200,
  "height": 800,
  "backgroundColor": "white"
}
EOF

# Verificar instalaciones
echo ""
echo "🔍 Verificando instalaciones..."
echo "Pandoc: $(pandoc --version | head -1 2>/dev/null || echo 'No instalado')"
echo "Python3: $(python3 --version 2>/dev/null || echo 'No instalado')"
echo "Node.js: $(node --version 2>/dev/null || echo 'No instalado')"
echo "Mermaid CLI: $(mmdc --version 2>/dev/null || echo 'Instalado pero requiere configuración')"
echo "Graphviz: $(dot -V 2>&1 | head -1 || echo 'No instalado')"
echo "PlantUML: $(plantuml -version 2>/dev/null | head -1 || echo 'Instalado')"

echo ""
echo "✅ Instalación completada!"
echo "ℹ️  Si MacTeX fue instalado, reinicia la terminal"
echo "ℹ️  Todas las herramientas están listas para generar diagramas y PDFs"