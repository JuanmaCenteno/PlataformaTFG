# 📋 Checklist de Pruebas Frontend - Plataforma TFG

## 🎯 Propósito
Este documento contiene una lista exhaustiva de todas las pruebas que deben realizarse en el frontend para verificar la correcta funcionalidad de la plataforma y la comunicación con el backend Symfony.

## 🏃‍♂️ Preparación Previa

### Requisitos
- [ ] Backend Symfony corriendo en `https://tfg-backend.ddev.site`
- [ ] Frontend React corriendo en `http://localhost:5173`
- [ ] Base de datos con fixtures cargadas
- [ ] Usuarios de prueba disponibles

### Usuarios de Prueba
```
📧 estudiante@uni.es | 🔑 123456 | 👨‍🎓 ROLE_ESTUDIANTE
📧 profesor@uni.es   | 🔑 123456 | 👨‍🏫 ROLE_PROFESOR
📧 presidente@uni.es | 🔑 123456 | 👑 ROLE_PRESIDENTE_TRIBUNAL
📧 admin@uni.es      | 🔑 123456 | 🔧 ROLE_ADMIN
```

---

## 🔐 PRUEBAS DE AUTENTICACIÓN

### Login y Logout
- [ ] **Login con credenciales válidas** - Estudiante
  - Navegar a `/login`
  - Introducir `estudiante@uni.es` / `123456`
  - Verificar redirección al dashboard correcto
  - Verificar que el token JWT se almacena correctamente

- [ ] **Login con credenciales válidas** - Profesor
  - Usar `profesor@uni.es` / `123456`
  - Verificar redirección a dashboard de profesor
  - Verificar menú específico de profesor

- [ ] **Login con credenciales válidas** - Presidente
  - Usar `presidente@uni.es` / `123456`
  - Verificar redirección y menú de presidente

- [ ] **Login con credenciales válidas** - Admin
  - Usar `admin@uni.es` / `123456`
  - Verificar acceso completo a todas las secciones

- [ ] **Login con credenciales inválidas**
  - Intentar login con email incorrecto
  - Intentar login con contraseña incorrecta
  - Verificar mensajes de error apropiados

- [ ] **Logout funcional**
  - Hacer logout desde cualquier rol
  - Verificar redirección a página de login
  - Verificar que el token se elimina correctamente
  - Intentar acceder a ruta protegida tras logout

### Renovación de Tokens
- [ ] **Refresh token automático**
  - Dejar la sesión inactiva hasta que el token expire (1 hora)
  - Realizar una acción que requiera autenticación
  - Verificar que el token se renueva automáticamente

- [ ] **Manejo de refresh token expirado**
  - Simular refresh token expirado (30 días)
  - Verificar redirección automática al login

---

## 🛡️ PRUEBAS DE RUTAS PROTEGIDAS

### Control de Acceso por Rol
- [ ] **Rutas de Estudiante** (`/estudiante/*`)
  - Acceder con usuario estudiante ✅
  - Intentar acceder con profesor ❌
  - Intentar acceder con presidente ❌
  - Intentar acceder sin autenticación ❌

- [ ] **Rutas de Profesor** (`/profesor/*`)
  - Acceder con usuario profesor ✅
  - Intentar acceder con estudiante ❌
  - Intentar acceder con presidente ✅ (herencia de roles)
  - Intentar acceder sin autenticación ❌

- [ ] **Rutas de Presidente** (`/presidente/*`)
  - Acceder con usuario presidente ✅
  - Intentar acceder con profesor ❌
  - Intentar acceder con estudiante ❌
  - Intentar acceder sin autenticación ❌

- [ ] **Rutas de Admin** (`/admin/*`)
  - Acceder con usuario admin ✅
  - Intentar acceder con cualquier otro rol ❌
  - Intentar acceder sin autenticación ❌

### Navegación y Menús
- [ ] **Menú dinámico por rol**
  - Verificar que cada rol ve solo sus opciones de menú
  - Verificar iconos y textos apropiados
  - Verificar contadores de notificaciones

- [ ] **Breadcrumbs y navegación**
  - Verificar breadcrumbs en todas las páginas
  - Verificar botones de "Volver" funcionales

---

## 👨‍🎓 PRUEBAS DEL MÓDULO ESTUDIANTE

### Dashboard Estudiante
- [ ] **Vista general del dashboard**
  - Verificar carga de estadísticas del estudiante
  - Verificar widgets informativos
  - Verificar links de navegación rápida

### Gestión de TFGs (Estudiante)
- [ ] **Crear nuevo TFG** (`/estudiante/subir-tfg`)
  - Rellenar formulario completo:
    - Título del TFG
    - Descripción detallada
    - Resumen ejecutivo
    - Palabras clave (array)
    - Seleccionar tutor de la lista
  - Subir archivo PDF válido
  - Verificar creación exitosa y estado "borrador"
  - Verificar notificación de éxito

- [ ] **Upload de archivo PDF**
  - Subir archivo PDF válido (<50MB)
  - Verificar progress bar funcionando
  - Intentar subir archivo no-PDF (debería fallar)
  - Intentar subir archivo muy grande (debería fallar)
  - Verificar validaciones de frontend y backend

- [ ] **Ver mis TFGs** (`/estudiante/mis-tfgs`)
  - Verificar listado de TFGs del estudiante
  - Verificar información mostrada (título, estado, tutor, fecha)
  - Verificar botones de acción disponibles según estado
  - Verificar paginación si hay muchos TFGs

- [ ] **Editar TFG existente**
  - Editar TFG en estado "borrador"
  - Intentar editar TFG en estado "revision" (debería ser limitado)
  - Verificar actualización de metadatos
  - Verificar reemplazo de archivo PDF

- [ ] **Ver detalles de TFG**
  - Ver detalles completos del TFG
  - Verificar descarga del archivo PDF
  - Ver comentarios del tutor (si existen)
  - Ver información del tribunal asignado (si existe)

### Seguimiento de Estado
- [ ] **Estados de TFG**
  - Verificar TFG en estado "borrador"
  - Ver TFG cambiar a "revision" (acción del tutor)
  - Ver TFG cambiar a "aprobado" (acción del tutor)
  - Ver TFG cambiar a "defendido" (tras la defensa)

- [ ] **Vista de defensa** (`/estudiante/mi-defensa`)
  - Ver detalles de defensa programada (si existe)
  - Verificar fecha, hora, aula, tribunal
  - Verificar información de contacto del tribunal
  - Ver estado de la defensa

### Notificaciones (Estudiante)
- [ ] **Centro de notificaciones**
  - Ver notificaciones recibidas
  - Marcar notificaciones como leídas
  - Filtrar por tipo de notificación
  - Verificar notificaciones de cambios de estado del TFG

---

## 👨‍🏫 PRUEBAS DEL MÓDULO PROFESOR

### Dashboard Profesor
- [ ] **Vista general del dashboard**
  - Verificar carga de TFGs asignados
  - Verificar estadísticas de supervisión
  - Verificar accesos rápidos a funciones principales

### Gestión de TFGs Asignados
- [ ] **Ver TFGs asignados** (`/profesor/tfgs-asignados`)
  - Verificar listado de TFGs donde es tutor
  - Verificar filtros por estado
  - Verificar información de cada TFG y estudiante
  - Verificar acciones disponibles por cada TFG

- [ ] **Revisar TFG en detalle**
  - Ver detalles completos del TFG
  - Descargar archivo PDF del TFG
  - Verificar información del estudiante
  - Ver historial de comentarios

- [ ] **Cambiar estado de TFG**
  - Cambiar TFG de "borrador" a "revision"
  - Cambiar TFG de "revision" a "aprobado"
  - Intentar cambios de estado no válidos
  - Agregar comentarios obligatorios en cambios de estado
  - Verificar notificaciones automáticas al estudiante

- [ ] **Sistema de comentarios**
  - Agregar comentario de feedback al TFG
  - Agregar comentario de revision
  - Agregar comentario de aprobación
  - Verificar que los comentarios se muestran al estudiante

### Evaluación y Calificación
- [ ] **Calificar TFG defendido**
  - Acceder a TFG en estado "defendido"
  - Rellenar formulario de evaluación:
    - Nota de presentación
    - Nota de contenido
    - Nota de defensa
    - Nota final calculada
    - Comentarios de evaluación
  - Verificar cálculo automático de nota final

### Gestión de Tribunales (Como Miembro)
- [ ] **Ver tribunales asignados** (`/profesor/mis-tribunales`)
  - Ver tribunales donde participa (como secretario o vocal)
  - Ver información de otros miembros del tribunal
  - Ver TFGs asignados a cada tribunal

- [ ] **Participar en evaluación grupal**
  - Acceder a evaluación de TFG como miembro de tribunal
  - Rellenar evaluación individual
  - Ver evaluaciones de otros miembros (si están disponibles)

### Calendario de Defensas
- [ ] **Vista de calendario** (`/profesor/calendario`)
  - Ver calendario con defensas programadas
  - Filtrar por mis tribunales
  - Ver detalles de cada defensa
  - Verificar integración con FullCalendar.js

---

## 👑 PRUEBAS DEL MÓDULO PRESIDENTE

### Dashboard Presidente
- [ ] **Vista general del dashboard**
  - Verificar estadísticas de tribunales gestionados
  - Ver resumen de defensas programadas
  - Accesos rápidos a funciones principales

### Gestión de Tribunales
- [ ] **Crear nuevo tribunal** (`/presidente/crear-tribunal`)
  - Rellenar datos del tribunal:
    - Nombre del tribunal
    - Descripción
    - Seleccionar secretario de lista de profesores
    - Seleccionar vocal de lista de profesores
  - Verificar creación exitosa
  - Verificar validaciones (no se pueden repetir miembros)

- [ ] **Ver tribunales creados** (`/presidente/mis-tribunales`)
  - Listar tribunales donde es presidente
  - Ver información de miembros de cada tribunal
  - Ver TFGs asignados a cada tribunal
  - Editar información de tribunales

- [ ] **Asignar TFGs a tribunal**
  - Seleccionar TFGs aprobados disponibles
  - Asignar al tribunal correspondiente
  - Verificar que solo TFGs en estado "aprobado" son asignables

### Programación de Defensas
- [ ] **Programar nueva defensa** (`/presidente/programar-defensa`)
  - Seleccionar TFG aprobado
  - Seleccionar tribunal asignado
  - Elegir fecha y hora en calendario
  - Asignar aula disponible
  - Establecer duración estimada
  - Agregar observaciones
  - Verificar creación y notificaciones automáticas

- [ ] **Calendario de defensas** (`/presidente/calendario-defensas`)
  - Ver calendario completo con todas las defensas
  - Filtrar por tribunal
  - Filtrar por rango de fechas
  - Ver detalles al hacer click en evento
  - Verificar detección de conflictos de horarios

- [ ] **Gestión de conflictos**
  - Intentar programar defensas en mismo horario/aula
  - Verificar alertas de conflictos
  - Reprogramar defensas existentes
  - Cancelar defensas si es necesario

### Coordinación de Disponibilidad
- [ ] **Verificar disponibilidad de miembros**
  - Al programar defensa, verificar que los miembros estén disponibles
  - Ver alertas si hay conflictos con otros tribunales
  - Gestionar cambios de último momento

### Generación de Actas
- [ ] **Generar acta de defensa**
  - Acceder a defensa completada
  - Generar acta digital automática
  - Verificar datos incluidos (tribunal, estudiante, calificaciones)
  - Descargar PDF del acta
  - Verificar almacenamiento del acta en sistema

---

## 🔧 PRUEBAS DEL MÓDULO ADMIN

### Dashboard Administrador
- [ ] **Vista general del dashboard**
  - Ver estadísticas globales del sistema
  - Ver gráficos y métricas importantes
  - Accesos rápidos a todas las funciones administrativas

### Gestión de Usuarios
- [ ] **Ver todos los usuarios** (`/admin/usuarios`)
  - Listar todos los usuarios del sistema
  - Verificar paginación
  - Verificar filtros por rol
  - Verificar búsqueda por nombre/email
  - Ver información detallada de cada usuario

- [ ] **Crear nuevo usuario** (`/admin/crear-usuario`)
  - Rellenar formulario completo:
    - Email (único)
    - Contraseña
    - Nombre y apellidos
    - DNI, teléfono
    - Universidad, departamento
    - Roles (múltiples selecciones posibles)
  - Verificar validaciones de campos obligatorios
  - Verificar validación de email único
  - Verificar validación de DNI único

- [ ] **Editar usuario existente**
  - Modificar datos de usuario
  - Cambiar roles asignados
  - Activar/desactivar usuarios
  - Cambiar contraseñas
  - Verificar actualizaciones correctas

- [ ] **Eliminar usuario**
  - Eliminar usuario sin TFGs asociados
  - Intentar eliminar usuario con TFGs (debería mostrar advertencia)
  - Verificar confirmación antes de eliminar
  - Verificar eliminación efectiva

### Asignación de Roles y Permisos
- [ ] **Gestión granular de roles**
  - Asignar múltiples roles a un usuario
  - Verificar jerarquía de roles funcionando
  - Cambiar roles y verificar cambios en permisos inmediatamente

- [ ] **Verificar herencia de permisos**
  - Usuario con ROLE_ADMIN puede acceder a todo
  - Usuario con ROLE_PRESIDENTE puede acceder a funciones de profesor
  - Verificar restricciones apropiadas por rol

### Reportes y Estadísticas
- [ ] **Dashboard de reportes** (`/admin/reportes`)
  - Ver estadísticas de TFGs por estado
  - Ver estadísticas de usuarios por rol
  - Ver estadísticas de defensas por mes
  - Verificar gráficos interactivos funcionando

- [ ] **Reportes detallados**
  - Generar reporte de TFGs por tutor
  - Generar reporte de defensas por tribunal
  - Generar reporte de calificaciones
  - Verificar filtros por fechas, roles, estados

### Exportación de Datos
- [ ] **Exportar a PDF**
  - Exportar listado de usuarios
  - Exportar listado de TFGs
  - Exportar reporte de defensas
  - Verificar formato y contenido del PDF

- [ ] **Exportar a Excel**
  - Exportar datos de usuarios a Excel
  - Exportar datos de TFGs a Excel
  - Verificar formato y columnas en Excel
  - Verificar que los datos son correctos

### Configuración del Sistema
- [ ] **Configuraciones globales**
  - Modificar configuraciones de la plataforma
  - Establecer límites de archivo
  - Configurar notificaciones del sistema
  - Verificar aplicación inmediata de cambios

---

## 📅 PRUEBAS DEL SISTEMA DE CALENDARIO

### Integración FullCalendar.js
- [ ] **Vista de calendario principal**
  - Verificar carga correcta del calendario
  - Verificar navegación entre meses
  - Verificar diferentes vistas (mes, semana, día)
  - Verificar eventos se muestran correctamente

- [ ] **Eventos de defensa**
  - Ver defensas programadas en calendario
  - Verificar colores diferentes por tipo/estado
  - Verificar información en tooltip al hover
  - Click en evento para ver detalles completos

- [ ] **Programación desde calendario**
  - Click en fecha libre para programar defensa
  - Drag & drop de defensas existentes
  - Verificar validaciones de conflictos
  - Verificar actualización inmediata

### Filtros y Búsquedas
- [ ] **Filtros de calendario**
  - Filtrar por tribunal específico
  - Filtrar por rango de fechas
  - Filtrar por tipo de evento
  - Combinar múltiples filtros

- [ ] **Búsqueda de eventos**
  - Buscar por nombre de estudiante
  - Buscar por título de TFG
  - Buscar por aula
  - Verificar resultados de búsqueda

---

## 🔔 PRUEBAS DEL SISTEMA DE NOTIFICACIONES

### Notificaciones In-App
- [ ] **Centro de notificaciones**
  - Ver dropdown de notificaciones en header
  - Verificar contador de no leídas
  - Ver listado completo de notificaciones
  - Paginación en listado extenso

- [ ] **Tipos de notificación**
  - Notificaciones de cambio de estado de TFG
  - Notificaciones de asignación de tribunal
  - Notificaciones de programación de defensa
  - Notificaciones de nuevos comentarios
  - Verificar iconos y colores apropiados por tipo

- [ ] **Gestión de notificaciones**
  - Marcar individual como leída
  - Marcar todas como leídas
  - Eliminar notificaciones antigas
  - Filtrar por tipo de notificación

### Automatización de Notificaciones
- [ ] **Notificaciones automáticas**
  - Al subir TFG → notificar tutor
  - Al cambiar estado TFG → notificar estudiante
  - Al programar defensa → notificar tribunal y estudiante
  - Al calificar TFG → notificar estudiante
  - Verificar que todas se envían correctamente

- [ ] **Notificaciones por rol**
  - Verificar que cada rol recibe solo notificaciones relevantes
  - Verificar que no hay cross-contamination entre usuarios
  - Verificar permisos apropiados

---

## 📁 PRUEBAS DE GESTIÓN DE ARCHIVOS

### Upload de Archivos TFG
- [ ] **Upload básico**
  - Subir archivo PDF válido
  - Verificar progress bar funcionando
  - Verificar almacenamiento correcto
  - Verificar información del archivo (tamaño, nombre)

- [ ] **Validaciones de upload**
  - Intentar subir archivo no-PDF → rechazar
  - Intentar subir archivo muy grande (>50MB) → rechazar
  - Intentar subir archivo corrupto → rechazar
  - Verificar mensajes de error apropiados

- [ ] **Reemplazo de archivos**
  - Reemplazar archivo existente
  - Verificar que archivo anterior se elimina
  - Verificar que metadatos se actualizan
  - Verificar notificaciones de cambio

### Descarga de Archivos
- [ ] **Descarga autorizada**
  - Descargar propio TFG como estudiante
  - Descargar TFG asignado como tutor
  - Descargar TFG de tribunal como miembro
  - Verificar headers HTTP correctos

- [ ] **Control de acceso a archivos**
  - Intentar descargar TFG no autorizado → denegar acceso
  - Verificar que URLs de descarga requieren autenticación
  - Verificar que no se pueden acceder archivos directamente

### Gestión de Storage
- [ ] **Información de archivos**
  - Ver tamaño de archivo correctamente
  - Ver nombre original del archivo
  - Ver fecha de última actualización
  - Ver tipo MIME correcto

---

## 🧪 PRUEBAS DE INTEGRACIÓN FRONTEND-BACKEND

### Comunicación HTTP
- [ ] **Peticiones exitosas**
  - Verificar todas las peticiones GET funcionan
  - Verificar todas las peticiones POST funcionan
  - Verificar todas las peticiones PUT funcionan
  - Verificar todas las peticiones DELETE funcionan

- [ ] **Manejo de errores HTTP**
  - Error 401 (No autorizado) → redirección a login
  - Error 403 (Prohibido) → mensaje de permisos insuficientes
  - Error 404 (No encontrado) → mensaje de recurso no encontrado
  - Error 422 (Validación) → mostrar errores de validación
  - Error 500 (Servidor) → mensaje de error general

- [ ] **Headers y CORS**
  - Verificar headers de autorización se envían correctamente
  - Verificar CORS configurado correctamente
  - Verificar Content-Type apropiado en requests
  - Verificar manejo de respuestas JSON

### Sincronización de Datos
- [ ] **Actualización en tiempo real**
  - Cambio de estado de TFG se refleja inmediatamente
  - Nuevas notificaciones aparecen automáticamente
  - Calendario se actualiza tras programar defensa
  - Contadores se actualizan correctamente

- [ ] **Consistencia de datos**
  - Datos mostrados en frontend coinciden con backend
  - Filtros y búsquedas retornan resultados correctos
  - Paginación funciona correctamente
  - Validaciones frontend coinciden con backend

---

## 🎨 PRUEBAS DE UI/UX

### Responsive Design
- [ ] **Diferentes resoluciones**
  - Probar en resolución desktop (1920x1080)
  - Probar en resolución laptop (1366x768)
  - Probar en tablet horizontal (1024x768)
  - Probar en tablet vertical (768x1024)
  - Probar en móvil (375x667)

- [ ] **Elementos adaptativos**
  - Menús colapsables en móvil
  - Tablas responsive con scroll horizontal
  - Formularios se adaptan correctamente
  - Calendario responsive funcionando

### Accesibilidad
- [ ] **Navegación por teclado**
  - Tab entre elementos funciona correctamente
  - Enter para activar botones
  - Escape para cerrar modales
  - Foco visible en elementos activos

- [ ] **Lectores de pantalla**
  - Alt text en imágenes importantes
  - Labels apropiados en formularios
  - Headings jerárquicos correctos
  - ARIA labels donde sea necesario

### Usabilidad
- [ ] **Feedback visual**
  - Loading spinners durante peticiones
  - Botones deshabilitados durante procesamiento
  - Mensajes de éxito claros y visibles
  - Mensajes de error informativos

- [ ] **Navegación intuitiva**
  - Breadcrumbs funcionando correctamente
  - Botones "Volver" en páginas apropiadas
  - Enlaces internos funcionando
  - Menú de navegación consistente

---

## 🔧 PRUEBAS TÉCNICAS

### Performance
- [ ] **Tiempos de carga**
  - Página inicial carga en <3 segundos
  - Transiciones entre páginas son fluidas
  - Upload de archivos tiene feedback de progreso
  - Paginación de listas es rápida

- [ ] **Optimización**
  - Imágenes se cargan correctamente
  - CSS y JS se cargan sin errores
  - No hay memory leaks evidentes
  - Bundle size es razonable

### Compatibilidad de Navegadores
- [ ] **Navegadores modernos**
  - Chrome (última versión)
  - Firefox (última versión)
  - Safari (última versión)
  - Edge (última versión)

- [ ] **Funcionalidades específicas**
  - Local Storage funcionando
  - Session Storage funcionando
  - File API para uploads
  - DatePicker nativo/polyfill

### Seguridad Frontend
- [ ] **Manejo de tokens**
  - Tokens se almacenan de forma segura
  - Tokens se eliminan al hacer logout
  - Refresh automático funcionando
  - No se exponen credenciales en código

- [ ] **Validación de inputs**
  - XSS prevention básico
  - Validación de formularios antes de envío
  - Sanitización de datos mostrados
  - URLs maliciosas rechazadas

---

## 📊 CHECKLIST DE VALIDACIÓN FINAL

### Funcionalidades Core
- [ ] Sistema completo de autenticación y autorización
- [ ] Gestión completa de TFGs (CRUD + estados)
- [ ] Sistema de tribunales y asignaciones
- [ ] Programación y gestión de defensas
- [ ] Sistema de calificaciones
- [ ] Notificaciones en tiempo real
- [ ] Gestión de archivos (upload/download)
- [ ] Reportes y exportación de datos
- [ ] Calendario interactivo de defensas

### Roles y Permisos
- [ ] Estudiante: puede gestionar sus TFGs
- [ ] Profesor: puede supervisar TFGs asignados
- [ ] Presidente: puede gestionar tribunales y defensas
- [ ] Admin: puede gestionar todo el sistema
- [ ] Herencia de roles funcionando correctamente

### Integraciones
- [ ] Frontend-Backend comunicación estable
- [ ] Autenticación JWT funcionando
- [ ] Base de datos persistiendo datos correctamente
- [ ] Sistema de archivos funcionando
- [ ] CORS configurado correctamente

### Calidad y Estabilidad
- [ ] No hay errores JavaScript en consola
- [ ] No hay errores de red no manejados
- [ ] Manejo apropiado de estados de error
- [ ] Performance aceptable en todas las operaciones
- [ ] UI consistente en todas las páginas

---

## 🚀 RESULTADO ESPERADO

Al completar todas estas pruebas, deberías tener:
- ✅ **95-100% de funcionalidades verificadas**
- ✅ **Comunicación frontend-backend estable**
- ✅ **Sistema de roles completamente funcional**
- ✅ **Gestión de archivos robusta**
- ✅ **UI/UX consistente y usable**
- ✅ **Performance aceptable**

## 📝 NOTAS DE EJECUCIÓN

### Orden Recomendado
1. Autenticación y rutas protegidas
2. Módulo de Estudiante
3. Módulo de Profesor
4. Módulo de Presidente
5. Módulo de Admin
6. Sistema de archivos
7. Integración y comunicación
8. UI/UX y performance

### Documentación de Issues
Para cada prueba que falle, documenta:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Rol de usuario usado
- Navegador/dispositivo de prueba

### Criterios de Éxito
- ✅ **Crítico**: Funcionalidad básica debe funcionar 100%
- ✅ **Importante**: Características avanzadas deben funcionar 90%
- ⚠️ **Opcional**: Mejoras de UX pueden tener issues menores

---

**¡Éxito en las pruebas! 🎉**