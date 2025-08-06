# 📚 Plataforma de Gestión de TFG

Una plataforma completa para la gestión de Trabajos de Fin de Grado (TFG) desarrollada con React y Symfony. La aplicación maneja el ciclo completo desde la subida del TFG hasta la defensa y calificación final.

## 🚀 Estado Actual del Proyecto

**✅ FASE 6 COMPLETADA** - Sistema administrativo y reportes implementados  
**🔄 FASE 7 EN PROGRESO** - Backend Symfony con DDEV

### Fases Implementadas (1-6)

- ✅ **Fase 1**: Setup inicial y routing básico
- ✅ **Fase 2**: Sistema de autenticación y roles
- ✅ **Fase 3**: Módulo de estudiante completo
- ✅ **Fase 4**: Módulo de profesor/tutor
- ✅ **Fase 5**: Sistema de defensas y calendario
- ✅ **Fase 6**: Panel administrativo y reportes

### Fases en Desarrollo (7-8)

- 🔄 **Fase 7**: Backend Symfony con DDEV (En progreso)
  - Setup Symfony 6.4 con DDEV
  - Sistema de autenticación JWT
  - APIs REST completas
  - Base de datos MySQL con Doctrine
- 🔄 **Fase 8**: Pulimiento y deploy (Próxima)

## 📁 Estructura del Monorepo

```
tfg-platform/
├── README.md                    # Este archivo
├── .gitignore                   # Gitignore global
├── package.json                 # Scripts globales del monorepo
├── docs/                        # Documentación del proyecto
│   ├── BACKEND.md              # Especificaciones del backend
│   ├── API.md                  # Documentación de APIs
│   └── DEPLOYMENT.md           # Guías de despliegue
├── frontend/                    # Aplicación React
│   ├── package.json
│   ├── src/
│   ├── public/
│   ├── .gitignore
│   └── README.md
└── backend/                     # API Symfony
    ├── .ddev/                  # Configuración DDEV
    ├── composer.json
    ├── src/
    ├── config/
    ├── public/
    ├── var/
    └── .env.local
```

## 🎯 Funcionalidades por Rol

### 👨‍🎓 Estudiante
- Subida de TFG con metadatos (título, resumen, palabras clave)
- Upload de archivos PDF con progress bar y validación
- Seguimiento del estado del TFG (borrador → revisión → aprobado → defendido)
- Visualización de comentarios del tutor
- Consulta de fecha y detalles de defensa
- Sistema de notificaciones integrado (in-app + email)

### 👨‍🏫 Profesor/Tutor
- Gestión de TFGs asignados para supervisión
- Sistema de feedback y calificaciones con formularios avanzados
- Cambio de estados de TFG con validaciones
- Participación en tribunales y evaluaciones
- Calendario integrado para gestión de defensas
- Notificaciones automáticas de cambios de estado

### 👑 Presidente del Tribunal
- Creación y gestión de tribunales
- Asignación de profesores a tribunales con verificación de disponibilidad
- Programación de fechas de defensa con calendario interactivo
- Coordinación de disponibilidad de miembros
- Generación automática de actas digitales (PDF)

### 🔧 Administrador
- CRUD completo de usuarios del sistema con roles granulares
- Asignación y gestión de permisos avanzados
- Reportes y estadísticas avanzadas con gráficos
- Exportación de datos (PDF, Excel) con filtros personalizables
- Gestión de configuración del sistema

## 🛠️ Stack Tecnológico

### Frontend (React)
- **React 19** - Framework principal con hooks modernos y Suspense
- **Vite** - Build tool ultra-rápido con HMR
- **React Router DOM v7** - Navegación con rutas protegidas por rol
- **Tailwind CSS v4** - Framework de estilos utility-first con nuevas características
- **FullCalendar.js** - Gestión avanzada de calendario para defensas
- **React Hook Form** - Manejo eficiente de formularios complejos
- **Axios** - Cliente HTTP con interceptores y manejo de errores

### Backend (Symfony - Fase 7)
- **Symfony 6.4 LTS** - Framework PHP robusto y escalable
- **PHP 8.2+** - Versión moderna con mejoras de rendimiento
- **Doctrine ORM** - Mapeo objeto-relacional con migraciones automáticas
- **LexikJWTAuthenticationBundle** - Autenticación JWT segura
- **API Platform 3.x** - APIs REST auto-documentadas con OpenAPI
- **VichUploaderBundle** - Gestión segura de uploads de archivos
- **Symfony Mailer** - Sistema de notificaciones por email con templates
- **MySQL 8.0** - Base de datos relacional optimizada

### Herramientas de Desarrollo
- **DDEV** - Entorno de desarrollo containerizado con Docker
- **Composer** - Gestión de dependencias PHP
- **PHPUnit** - Testing unitario y funcional
- **ESLint + Prettier** - Calidad de código frontend
- **PHP CS Fixer** - Formateo automático de código PHP
- **PHPStan** - Análisis estático de código PHP

## 🏃‍♂️ Quick Start

### Desarrollo Completo (Frontend + Backend)

```bash
# Clonar el repositorio
git clone tu-repositorio/tfg-platform.git
cd tfg-platform

# Instalar dependencias globales
npm install

# Instalar dependencias del frontend
npm run install:frontend

# Configurar e iniciar el backend con DDEV
npm run install:backend

# Iniciar ambos servicios simultáneamente
npm run dev
```

### Solo Frontend

```bash
cd frontend
npm install
npm run dev
```

### Solo Backend

```bash
cd backend
ddev start
ddev launch
```

## 📋 Scripts Disponibles

### Scripts Globales (Root)

```bash
npm run dev                  # Inicia frontend y backend simultáneamente
npm run dev:frontend         # Solo frontend en desarrollo
npm run dev:backend          # Solo backend con DDEV
npm run build:frontend       # Build de producción del frontend
npm run test:frontend        # Tests del frontend
npm run test:backend         # Tests del backend (PHPUnit)
npm run install:frontend     # Instala dependencias del frontend
npm run install:backend      # Configura DDEV e instala composer
npm run lint                 # Linting de todo el proyecto
```

### Scripts del Frontend

```bash
cd frontend/
npm run dev                  # Servidor de desarrollo (Vite)
npm run build                # Build de producción
npm run preview              # Preview del build
npm run lint                 # ESLint
npm run lint:fix             # Corregir errores de linting automáticamente
```

### Scripts del Backend

```bash
cd backend/
ddev start                   # Iniciar entorno DDEV
ddev stop                    # Parar entorno DDEV
ddev composer install        # Instalar dependencias PHP
ddev exec php bin/console    # Ejecutar comandos Symfony
ddev mysql                   # Acceder a MySQL CLI
ddev phpmyadmin             # Abrir PHPMyAdmin en navegador
ddev logs                   # Ver logs del servidor
```

## 🌐 URLs de Desarrollo

- **Frontend React:** `http://localhost:5173`
- **Backend API:** `https://tfg-backend.ddev.site`
- **PHPMyAdmin:** `https://tfg-backend.ddev.site:8036`
- **API Documentation:** `https://tfg-backend.ddev.site/api/docs`

## 🗄️ Modelo de Datos

### Entidades Principales (Backend Symfony)

- **Users** - Sistema de roles múltiples con jerarquías
- **TFGs** - Estados, metadatos, archivos PDF, relaciones
- **Tribunales** - Presidente + miembros, gestión de disponibilidad
- **Defensas** - Programación con calendario, aulas, duraciones
- **Calificaciones** - Sistema de evaluación multi-criterio
- **Notificaciones** - Sistema de alertas in-app y por email
- **Comentarios** - Feedback estructurado entre roles

### Relaciones Principales

```
User 1:N TFG (como estudiante)
User 1:N TFG (como tutor)
User N:M Tribunal (como miembro)
TFG 1:1 Defensa
Defensa N:M Calificacion
User 1:N Notificacion
TFG 1:N Comentario
```

## 🔐 Sistema de Autenticación

### Tokens JWT (Backend)
- Access Token: 1 hora de duración
- Refresh Token: 30 días
- Renovación automática en frontend

### Usuarios de Prueba (Desarrollo)

```
📧 estudiante@uni.es | 🔑 123456 | 👨‍🎓 ROLE_ESTUDIANTE
📧 profesor@uni.es   | 🔑 123456 | 👨‍🏫 ROLE_PROFESOR  
📧 presidente@uni.es | 🔑 123456 | 👑 ROLE_PRESIDENTE_TRIBUNAL
📧 admin@uni.es      | 🔑 123456 | 🔧 ROLE_ADMIN
```

## 🚦 Sistema de Estados de TFG

```
Borrador → En Revisión → Aprobado → Defendido
   ↓           ↓           ↓         ↓
[Create]   [Review]   [Schedule]  [Grade]
```

Cada transición tiene validaciones específicas y notificaciones automáticas.

## 🧪 Testing

### Frontend
- **Vitest** - Testing unitario rápido
- **React Testing Library** - Testing de componentes
- **MSW** - Mock Service Worker para APIs

### Backend
- **PHPUnit** - Testing unitario y funcional
- **Symfony Test Pack** - Herramientas de testing integradas
- **DoctrineFixturesBundle** - Datos de prueba

```bash
# Ejecutar tests
npm run test:frontend        # Tests del frontend
npm run test:backend         # Tests del backend
npm run test                 # Todos los tests
```

## 📊 APIs REST

### Endpoints Principales

```
POST   /api/auth/login              # Autenticación
POST   /api/auth/refresh            # Renovar token
GET    /api/tfgs/mis-tfgs          # TFGs por usuario
POST   /api/tfgs                   # Crear TFG
PUT    /api/tfgs/{id}/estado       # Cambiar estado
POST   /api/tfgs/{id}/upload       # Subir archivo
GET    /api/tribunales             # Listar tribunales
POST   /api/defensas               # Programar defensa
GET    /api/notificaciones         # Notificaciones del usuario
```

Documentación completa disponible en `/api/docs` (OpenAPI/Swagger).

## 🚀 Roadmap de Desarrollo

### Fase 7: Backend Symfony (En Progreso)
- [x] Setup inicial con DDEV
- [x] Configuración de base de datos
- [ ] Entidades y migraciones
- [ ] Sistema de autenticación JWT
- [ ] APIs REST completas
- [ ] Sistema de archivos con validaciones
- [ ] Notificaciones por email
- [ ] Tests unitarios y funcionales

### Fase 8: Pulimiento y Deploy
- [ ] Integración completa frontend-backend
- [ ] Testing E2E con Cypress
- [ ] Optimización de rendimiento
- [ ] Deploy con Docker/Kubernetes
- [ ] Documentación técnica completa
- [ ] Manual de usuario final

## 🔧 Configuración de Desarrollo

### Variables de Entorno

#### Frontend (.env.local)
```
VITE_API_BASE_URL=https://tfg-backend.ddev.site/api
VITE_APP_NAME="TFG Platform"
```

#### Backend (.env.local)
```
APP_ENV=dev
APP_SECRET=tu-clave-secreta
DATABASE_URL=mysql://db:db@db:3306/db
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
MAILER_DSN=smtp://mailpit:1025
```

## 📝 Contribución y Desarrollo

### Flujo de Trabajo

1. **Feature Branch:** `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollo:** Implementar cambios en frontend y/o backend
3. **Testing:** Ejecutar tests antes del commit
4. **Commit:** Mensajes descriptivos siguiendo Conventional Commits
5. **Pull Request:** Review de código antes de merge

### Estándares de Código

- **Frontend:** ESLint + Prettier configurados
- **Backend:** PHP CS Fixer + PHPStan nivel 8
- **Git:** Conventional Commits para mensajes
- **Documentación:** JSDoc para funciones complejas

## 📄 Licencia

Proyecto académico - Universidad © 2025

---

## 🤝 Soporte

Para dudas técnicas o problemas de desarrollo:
- Consultar la documentación en `/docs`
- Revisar issues conocidos en GitHub
- Contactar al equipo de desarrollo