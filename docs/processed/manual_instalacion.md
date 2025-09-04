# Anexo A. Manual de instalación

Este manual proporciona instrucciones detalladas para la instalación y configuración de la Plataforma de Gestión de TFG en diferentes entornos.

## A.1. Requisitos del sistema

### A.1.1. Requisitos mínimos de hardware

**Para desarrollo local:**
- **CPU**: 4 núcleos (Intel i5 o AMD Ryzen 5 equivalente)
- **RAM**: 8 GB mínimo, 16 GB recomendado
- **Almacenamiento**: 50 GB de espacio libre en SSD
- **Red**: Conexión a Internet estable (100 Mbps recomendado)

**Para producción:**
- **CPU**: 8 núcleos (Intel i7 o AMD Ryzen 7)
- **RAM**: 16 GB mínimo, 32 GB recomendado
- **Almacenamiento**: 200 GB SSD para sistema + almacenamiento adicional para archivos
- **Red**: Conexión dedicada con ancho de banda adecuado

### A.1.2. Requisitos de software

**Sistema operativo soportado:**
- Windows 10/11 (desarrollo)
- Linux Ubuntu 20.04+ (desarrollo y producción)
- macOS 12+ (desarrollo)

**Software base requerido:**
- **Docker Desktop**: Versión 4.12+
- **Node.js**: Versión 18.x LTS
- **Git**: Versión 2.30+
- **Editor de código**: VS Code recomendado

## A.2. Instalación para desarrollo

### A.2.1. Configuración inicial del proyecto

#### Paso 1: Clonar el repositorio

```bash
# Clonar el repositorio principal
git clone https://github.com/tu-usuario/plataforma-tfg.git
cd plataforma-tfg

# Verificar la estructura del proyecto
ls -la
```

**Estructura esperada:**
```
plataforma-tfg/
├── README.md
├── CLAUDE.md
├── DOCUMENTACION.md
├── backend.md
├── package.json
├── .gitignore
├── docs/
├── frontend/           # Aplicación React
└── backend/           # API Symfony (si existe)
```

#### Paso 2: Configurar variables de entorno

**Frontend (.env.local):**
```bash
# Crear archivo de configuración para desarrollo
cd frontend
cp .env.example .env.local

# Editar variables según tu entorno
nano .env.local
```

```bash
# Contenido de frontend/.env.local
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Plataforma de Gestión de TFG
VITE_ENVIRONMENT=development
VITE_ENABLE_DEV_TOOLS=true
```

**Backend (.env.local)** (cuando esté disponible):
```bash
cd backend
cp .env.example .env.local
nano .env.local
```

```bash
# Contenido de backend/.env.local
APP_ENV=dev
APP_DEBUG=true
APP_SECRET=your-secret-key-for-development

DATABASE_URL="mysql://root:password@127.0.0.1:3306/tfg_development"
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your-jwt-passphrase

MAILER_DSN=smtp://localhost:1025
CORS_ALLOW_ORIGIN=http://localhost:5173
```

### A.2.2. Configuración con DDEV (Recomendado)

#### Paso 1: Instalación de DDEV

**En Windows:**
```powershell
# Usar Chocolatey
choco install ddev

# O descargar desde GitHub releases
# https://github.com/drud/ddev/releases
```

**En macOS:**
```bash
# Usar Homebrew
brew install drud/ddev/ddev
```

**En Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://apt.fury.io/drud/gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/ddev.gpg
echo "deb [signed-by=/etc/apt/keyrings/ddev.gpg] https://apt.fury.io/drud/ * *" | sudo tee /etc/apt/sources.list.d/ddev.list
sudo apt update && sudo apt install ddev
```

#### Paso 2: Configuración inicial de DDEV

```bash
# Ir al directorio raíz del proyecto
cd plataforma-tfg

# Inicializar DDEV
ddev config

# Configuración interactiva:
# - Project name: plataforma-tfg
# - Docroot: public (para Symfony) o dist (para React)
# - Project type: symfony o react
```

#### Paso 3: Configuración específica de DDEV

**Crear archivo .ddev/config.yaml:**
```yaml
name: plataforma-tfg
type: php
docroot: backend/public
php_version: "8.2"
webserver_type: nginx-fpm
router_http_port: "80"
router_https_port: "443"
xdebug_enabled: true
additional_hostnames: []
additional_fqdns: []
database:
  type: mysql
  version: "8.0"
  
# Servicios adicionales
services:
  redis:
    type: redis
    version: "7"
  mailpit:
    type: mailpit

# Configuración de Node.js para frontend
nodejs_version: "18"

# Comandos personalizados
hooks:
  post-start:
    - exec: "cd frontend && npm install"
    - exec: "cd backend && composer install"
```

#### Paso 4: Iniciar el entorno DDEV

```bash
# Iniciar todos los servicios
ddev start

# Verificar estado
ddev status

# Ver URLs disponibles
ddev describe
```

**URLs típicas generadas:**
- **Aplicación principal**: https://plataforma-tfg.ddev.site
- **PHPMyAdmin**: https://plataforma-tfg.ddev.site:8036
- **Mailpit**: https://plataforma-tfg.ddev.site:8025

### A.2.3. Configuración del frontend

#### Paso 1: Instalación de dependencias

```bash
# Dentro del contenedor DDEV o localmente
cd frontend

# Instalar dependencias
npm install

# Verificar instalación
npm list --depth=0
```

#### Paso 2: Configuración de herramientas de desarrollo

**ESLint y Prettier:**
```bash
# Verificar configuración
npm run lint

# Corregir errores automáticamente
npm run lint:fix

# Verificar formateo
npm run format
```

**Configuración de VS Code (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "html"
  }
}
```

#### Paso 3: Iniciar servidor de desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en:
# http://localhost:5173
```

### A.2.4. Configuración del backend (Symfony)

#### Paso 1: Instalación de Composer y dependencias

```bash
# Dentro del contenedor DDEV
ddev ssh

# Ir al directorio backend
cd backend

# Instalar dependencias
composer install

# Verificar instalación
composer show
```

#### Paso 2: Configuración de la base de datos

```bash
# Crear la base de datos
ddev exec php bin/console doctrine:database:create

# Ejecutar migraciones (cuando estén disponibles)
ddev exec php bin/console doctrine:migrations:migrate

# Cargar datos de prueba (fixtures)
ddev exec php bin/console doctrine:fixtures:load --no-interaction
```

#### Paso 3: Generar claves JWT

```bash
# Generar par de claves JWT
ddev exec php bin/console lexik:jwt:generate-keypair

# Las claves se generarán en:
# config/jwt/private.pem
# config/jwt/public.pem
```

#### Paso 4: Configurar caché y logs

```bash
# Limpiar caché
ddev exec php bin/console cache:clear

# Verificar configuración
ddev exec php bin/console debug:config

# Verificar servicios
ddev exec php bin/console debug:autowiring
```

## A.3. Configuración de la base de datos

### A.3.1. Configuración de MySQL

#### Opción A: Usando DDEV (Recomendado)

```bash
# DDEV gestiona automáticamente MySQL
# Acceso a la base de datos:
ddev mysql

# Información de conexión:
# Host: db
# Port: 3306  
# Database: db
# Username: db
# Password: db
```

#### Opción B: MySQL local

```bash
# Instalar MySQL 8.0
# Ubuntu/Debian:
sudo apt update
sudo apt install mysql-server-8.0

# Configurar seguridad
sudo mysql_secure_installation

# Crear base de datos y usuario
mysql -u root -p
```

```sql
-- Crear base de datos
CREATE DATABASE tfg_development CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario específico
CREATE USER 'tfg_user'@'localhost' IDENTIFIED BY 'secure_password';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON tfg_development.* TO 'tfg_user'@'localhost';
FLUSH PRIVILEGES;

-- Verificar creación
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'tfg_user';
```

### A.3.2. Esquema inicial de la base de datos

**Ejecutar migraciones iniciales:**
```bash
# Con DDEV
ddev exec php bin/console doctrine:migrations:migrate

# O localmente
php bin/console doctrine:migrations:migrate
```

**Estructura de tablas creadas:**
- `users` - Usuarios del sistema con roles
- `tfgs` - Trabajos de Fin de Grado
- `tribunales` - Tribunales evaluadores
- `defensas` - Defensas programadas
- `calificaciones` - Calificaciones de defensas
- `notificaciones` - Sistema de notificaciones
- `comentarios` - Comentarios en TFGs

### A.3.3. Datos de prueba

```bash
# Cargar fixtures con datos de prueba
ddev exec php bin/console doctrine:fixtures:load --no-interaction

# Los siguientes usuarios de prueba estarán disponibles:
# estudiante@uni.es / 123456 (ROLE_ESTUDIANTE)
# profesor@uni.es / 123456 (ROLE_PROFESOR)
# presidente@uni.es / 123456 (ROLE_PRESIDENTE_TRIBUNAL)
# admin@uni.es / 123456 (ROLE_ADMIN)
```

## A.4. Configuración de desarrollo avanzada

### A.4.1. Debugging y logs

#### Configuración de Xdebug (PHP)

**En .ddev/config.yaml:**
```yaml
xdebug_enabled: true
```

**Configuración en VS Code (launch.json):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for Xdebug",
      "type": "php",
      "request": "launch",
      "port": 9003,
      "pathMappings": {
        "/var/www/html": "${workspaceFolder}/backend"
      }
    }
  ]
}
```

#### Configuración de logs

**Frontend (React Developer Tools):**
```bash
# Instalar extensión React Developer Tools en el navegador
# Chrome: https://chrome.google.com/webstore/detail/fmkadmapgofadopljbjfkapdkoienihi
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

**Backend (Symfony Profiler):**
```yaml
# config/packages/dev/web_profiler.yaml
web_profiler:
    toolbar: true
    intercept_redirects: false
```

### A.4.2. Testing environment

#### Configuración para testing del frontend

```bash
cd frontend

# Instalar dependencias de testing
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Ejecutar tests
npm run test

# Ejecutar con coverage
npm run test:coverage
```

#### Configuración para testing del backend

```bash
# Crear base de datos de testing
ddev exec php bin/console doctrine:database:create --env=test

# Ejecutar migraciones en testing
ddev exec php bin/console doctrine:migrations:migrate --env=test --no-interaction

# Ejecutar tests
ddev exec php bin/phpunit

# Con coverage
ddev exec php bin/phpunit --coverage-html coverage/
```

### A.4.3. Herramientas de desarrollo adicionales

#### Git hooks para calidad de código

```bash
# Instalar husky para git hooks
cd frontend
npm install --save-dev husky lint-staged

# Configurar pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

#### Extensiones recomendadas de VS Code

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "bmewburn.vscode-intelephense-client",
    "ms-vscode.vscode-docker",
    "ms-vscode.vscode-json"
  ]
}
```

## A.5. Solución de problemas comunes

### A.5.1. Problemas de DDEV

**Error: "Port already in use"**
```bash
# Verificar puertos en uso
ddev stop --all

# Cambiar puerto en configuración
ddev config --router-http-port=8080 --router-https-port=8443

# Reiniciar
ddev start
```

**Error: "Database connection failed"**
```bash
# Verificar estado de servicios
ddev status

# Reiniciar base de datos
ddev restart

# Verificar logs
ddev logs db
```

### A.5.2. Problemas del frontend

**Error: "Module not found"**
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 5173 is already in use"**
```bash
# Cambiar puerto en vite.config.js
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### A.5.3. Problemas del backend

**Error: "JWT keys not found"**
```bash
# Generar nuevas claves JWT
ddev exec php bin/console lexik:jwt:generate-keypair --skip-if-exists

# Verificar permisos
ddev exec chmod 644 config/jwt/*.pem
```

**Error: "Unable to write in cache directory"**
```bash
# Corregir permisos de caché
ddev exec chmod -R 777 var/

# Limpiar caché
ddev exec php bin/console cache:clear --no-warmup
```

### A.5.4. Problemas de rendimiento

**Frontend lento en desarrollo:**
```javascript
// vite.config.js - Optimizaciones para desarrollo
export default defineConfig({
  server: {
    hmr: {
      overlay: false // Disable error overlay for faster reloads
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'] // Pre-bundle heavy dependencies
  }
})
```

**Backend lento:**
```yaml
# config/packages/dev/doctrine.yaml
doctrine:
    dbal:
        profiling_collect_backtrace: false
    orm:
        auto_generate_proxy_classes: true
```

## A.6. Comandos útiles de desarrollo

### A.6.1. Comandos DDEV frecuentes

```bash
# Gestión de servicios
ddev start              # Iniciar proyecto
ddev stop               # Parar proyecto
ddev restart            # Reiniciar proyecto
ddev poweroff           # Parar todos los proyectos DDEV

# Información del proyecto
ddev describe           # Mostrar URLs y detalles
ddev status             # Estado de servicios
ddev list               # Listar proyectos DDEV

# Acceso a servicios
ddev ssh                # SSH al contenedor web
ddev mysql              # Acceso a MySQL CLI
ddev logs               # Ver logs generales
ddev logs web           # Ver logs del servidor web

# Utilidades
ddev import-db --src=dump.sql  # Importar base de datos
ddev export-db > dump.sql      # Exportar base de datos
ddev snapshot               # Crear snapshot del proyecto
```

### A.6.2. Comandos del frontend

```bash
# Desarrollo
npm run dev             # Servidor de desarrollo
npm run build           # Build de producción
npm run preview         # Preview del build

# Calidad de código
npm run lint            # Ejecutar ESLint
npm run lint:fix        # Corregir errores de ESLint
npm run format          # Formatear con Prettier

# Testing
npm run test            # Ejecutar tests
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Tests con coverage
```

### A.6.3. Comandos del backend

```bash
# Doctrine
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load

# Caché
php bin/console cache:clear
php bin/console cache:warmup

# Debugging
php bin/console debug:config
php bin/console debug:container
php bin/console debug:autowiring

# JWT
php bin/console lexik:jwt:generate-keypair

# Testing
php bin/phpunit
php bin/phpunit --coverage-html coverage/
```

## A.7. Verificación de la instalación

### A.7.1. Checklist de verificación

**✅ Entorno DDEV:**
- [ ] DDEV instalado y funcionando
- [ ] Proyecto iniciado sin errores
- [ ] URLs accesibles (web, PHPMyAdmin, Mailpit)
- [ ] Base de datos creada y accesible

**✅ Frontend:**
- [ ] Dependencias instaladas correctamente
- [ ] Servidor de desarrollo inicia sin errores
- [ ] Linting y formateo funcionando
- [ ] Tests básicos pasando

**✅ Backend:**
- [ ] Composer dependencies instaladas
- [ ] Migraciones ejecutadas correctamente
- [ ] Claves JWT generadas
- [ ] Fixtures cargados
- [ ] API endpoints respondiendo

**✅ Integración:**
- [ ] Frontend puede conectar con backend
- [ ] Autenticación JWT funcionando
- [ ] CORS configurado correctamente
- [ ] Logs accesibles y configurados

### A.7.2. Script de verificación automatizada

```bash
#!/bin/bash
# scripts/verify-installation.sh

echo "🔍 Verificando instalación de la Plataforma de Gestión de TFG..."

# Verificar DDEV
if ! command -v ddev &> /dev/null; then
    echo "❌ DDEV no está instalado"
    exit 1
fi

# Verificar estado del proyecto
if ! ddev status | grep -q "running"; then
    echo "❌ El proyecto DDEV no está ejecutándose"
    exit 1
fi

# Verificar frontend
if [ -d "frontend/node_modules" ]; then
    echo "✅ Dependencias del frontend instaladas"
else
    echo "❌ Falta instalar dependencias del frontend"
fi

# Verificar backend
if [ -d "backend/vendor" ]; then
    echo "✅ Dependencias del backend instaladas"
else
    echo "❌ Falta instalar dependencias del backend"
fi

# Verificar base de datos
if ddev mysql -e "SELECT 1" &> /dev/null; then
    echo "✅ Base de datos accesible"
else
    echo "❌ Problema con la base de datos"
fi

# Test de conectividad
if curl -f -s https://plataforma-tfg.ddev.site > /dev/null; then
    echo "✅ Aplicación web accesible"
else
    echo "❌ La aplicación web no responde"
fi

echo "🎉 Verificación completada"
```

---

*Fecha de elaboración: 31 de agosto de 2025*  
*Versión: 1.0*  
*Anexo A del documento técnico ISO/IEEE 16326*