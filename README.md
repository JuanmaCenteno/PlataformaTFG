# 📚 Plataforma de Gestión de TFG

Una plataforma completa para la gestión de Trabajos de Fin de Grado (TFG) desarrollada con React y diseñada para ser integrada con un backend Symfony. La aplicación maneja el ciclo completo desde la subida del TFG hasta la defensa y calificación final.

## 🚀 Estado Actual del Proyecto

**✅ FASE 6 COMPLETADA** - Sistema administrativo y reportes implementados

### Fases Implementadas (1-6)

- ✅ **Fase 1**: Setup inicial y routing básico
- ✅ **Fase 2**: Sistema de autenticación y roles
- ✅ **Fase 3**: Módulo de estudiante completo
- ✅ **Fase 4**: Módulo de profesor/tutor
- ✅ **Fase 5**: Sistema de defensas y calendario
- ✅ **Fase 6**: Panel administrativo y reportes

### Próximas Fases (7-8)

- 🔄 **Fase 7**: Backend Symfony (Semana 7-9)
- 🔄 **Fase 8**: Pulimiento y deploy (Semana 9-10)

## 🎯 Funcionalidades por Rol

### 👨‍🎓 Estudiante
- Subida de TFG con metadatos (título, resumen, palabras clave)
- Upload de archivos PDF con progress bar
- Seguimiento del estado del TFG (borrador → revisión → aprobado → defendido)
- Visualización de comentarios del tutor
- Consulta de fecha y detalles de defensa
- Sistema de notificaciones integrado

### 👨‍🏫 Profesor/Tutor
- Gestión de TFGs asignados para supervisión
- Sistema de feedback y calificaciones
- Cambio de estados de TFG
- Participación en tribunales
- Evaluación de TFGs para defensa
- Calendario integrado para gestión de defensas

### 👑 Presidente del Tribunal
- Creación y gestión de tribunales
- Asignación de profesores a tribunales
- Programación de fechas de defensa
- Coordinación de disponibilidad de miembros
- Generación de actas digitales

### 🔧 Administrador
- CRUD completo de usuarios del sistema
- Asignación y gestión de roles
- Reportes y estadísticas avanzadas
- Exportación de datos (PDF, Excel)
- Gestión de permisos del sistema

## 🛠️ Stack Tecnológico

### Frontend (React)
- **React 19** - Framework principal con hooks modernos
- **Vite** - Build tool y desarrollo con HMR
- **React Router DOM v7** - Navegación con rutas protegidas por rol
- **Tailwind CSS v4** - Framework de estilos utility-first
- **FullCalendar.js** - Gestión avanzada de calendario para defensas
- **React Hook Form** - Manejo de formularios complejos
- **Axios** - Cliente HTTP para comunicación con API

### Backend (Planificado - Fase 7)
- **Symfony** - Framework PHP robusto
- **Doctrine ORM** - Manejo de base de datos y relaciones complejas
- **FOSUserBundle** - Sistema de autenticación con roles
- **API Platform** - APIs REST rápidas y documentadas
- **Mailer Component** - Sistema de notificaciones por email

## 🗂️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout.jsx          # Layout principal con navegación
│   ├── ProtectedRoute.jsx  # Componente para rutas protegidas
│   ├── NotificacionesDropdown.jsx
│   ├── calendario/         # Componentes de calendario
│   └── dashboards/         # Dashboards específicos por rol
├── pages/              # Páginas principales organizadas por rol
│   ├── auth/              # Login y autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── estudiante/        # Páginas específicas de estudiante
│   ├── profesor/          # Páginas específicas de profesor
│   └── admin/             # Panel administrativo
├── context/            # Context providers para estado global
│   ├── AuthContext.jsx    # Gestión de autenticación y roles
│   └── NotificacionesContext.jsx  # Sistema de notificaciones
├── hooks/              # Custom hooks para lógica reutilizable
│   ├── useCalendario.js   # Gestión de calendario
│   ├── useTFGs.js         # Operaciones con TFGs
│   ├── useTribunales.js   # Gestión de tribunales
│   ├── useUsuarios.js     # Gestión de usuarios
│   └── useReportes.js     # Generación de reportes
└── services/           # Llamadas a API (preparado para Symfony)
```

## 🎨 Características de la Interfaz

- **Diseño Responsive** - Adaptado para desktop, tablet y móvil
- **Navegación Intuitiva** - Menús dinámicos basados en rol de usuario
- **Sistema de Notificaciones** - Notificaciones in-app y preparado para email
- **Iconografía con Emojis** - Interfaz visual clara y amigable
- **Estados de Carga** - Loading states para mejor UX
- **Interfaz en Español** - Completamente localizada

## 🚦 Sistema de Estados de TFG

```
Borrador → En Revisión → Aprobado → Defendido
```

Cada estado tiene permisos y acciones específicas según el rol del usuario.

## 🗄️ Modelo de Datos (Planificado)

### Entidades Principales
- **Usuarios** - Roles múltiples (estudiante, profesor, admin)
- **TFGs** - Estados, metadatos, archivos asociados
- **Tribunales** - Presidente + miembros, asignaciones
- **Defensas** - Fecha, hora, aula, tribunal asignado
- **Calificaciones** - Notas y evaluaciones
- **Notificaciones** - Sistema de alertas y comunicaciones

## 🔐 Sistema de Autenticación

### Usuarios de Prueba (Mock)
```
📧 estudiante@uni.es | 🔑 123456 | 👨‍🎓 Estudiante
📧 profesor@uni.es   | 🔑 123456 | 👨‍🏫 Profesor  
📧 admin@uni.es      | 🔑 123456 | 🔧 Admin
```

## 🏃‍♂️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Verificar calidad del código
npm run lint

# Preview de build de producción
npm run preview
```

## 📋 Roadmap de Desarrollo

### Fase 7: Backend Symfony (Próxima)
- [ ] Setup inicial del proyecto Symfony
- [ ] Diseño e implementación de base de datos
- [ ] Sistema de autenticación con JWT
- [ ] APIs REST para todas las funcionalidades
- [ ] Validaciones y sistema de seguridad
- [ ] Manejo de archivos y uploads
- [ ] Sistema de notificaciones por email

### Fase 8: Pulimiento y Deploy
- [ ] Testing unitario e integración
- [ ] Optimización de rendimiento
- [ ] Deploy de frontend y backend
- [ ] Documentación técnica completa
- [ ] Manual de usuario

## 🧪 Testing

Actualmente sin framework de testing configurado. Se implementará en la Fase 8 con:
- Jest para testing unitario
- React Testing Library para componentes
- Cypress para testing E2E

## 📝 Notas Técnicas

- La aplicación está preparada para integración con Symfony mediante Axios
- Sistema de roles completamente funcional con rutas protegidas
- Arquitectura modular y escalable
- Código mantenible con ESLint configurado
- Preparado para PWA y notificaciones push

## 🤝 Contribución

Este es un proyecto académico de TFG. El desarrollo sigue una metodología estructurada por fases con objetivos específicos y fechas de entrega.

## 📄 Licencia

Proyecto académico - Universidad © 2025
