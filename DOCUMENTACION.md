# 📋 DOCUMENTACIÓN TÉCNICA - PLATAFORMA DE GESTIÓN DE TFG
## Estándar ISO/IEEE 16326

### 🎯 OBJETIVO DEL DOCUMENTO
Crear la documentación técnica completa del proyecto "Plataforma de Gestión de TFG" siguiendo el estándar ISO/IEEE 16326 para documentación de sistemas software, adaptado al contexto académico universitario.

### 📊 ESTADO ACTUAL DE LA DOCUMENTACIÓN
- **Iniciado**: 31/08/2025
- **Estándar**: ISO/IEEE 16326
- **Progreso**: 🔄 En desarrollo
- **Capítulos completados**: 0/9
- **Anexos completados**: 0/3

---

## 📚 ÍNDICE COMPLETO PLANIFICADO

### 1. VISIÓN GENERAL DEL PROYECTO
- 1.1. Motivación
- 1.2. Objetivos
- 1.3. Alcance
- 1.4. Visión general del documento
- 1.5. Estandarización del documento
- 1.6. Acrónimos
- 1.7. Definiciones

### 2. CONTEXTO DEL PROYECTO
- 2.1. Descripción general del proyecto
- 2.2. Características del usuario
- 2.3. Modelo de ciclo de vida
- 2.4. Tecnologías
  - 2.4.1. React 19
  - 2.4.2. Symfony 6.4 LTS
  - 2.4.3. MySQL 8.0
  - 2.4.4. API REST con API Platform
  - 2.4.5. JWT Authentication
  - 2.4.6. FullCalendar.js
  - 2.4.7. Tailwind CSS v4
  - 2.4.8. DDEV
- 2.5. Lenguajes
  - 2.5.1. JavaScript/TypeScript
  - 2.5.2. PHP 8.2+
  - 2.5.3. SQL
  - 2.5.4. HTML/CSS
- 2.6. Herramientas
  - 2.6.1. VS Code
  - 2.6.2. Vite
  - 2.6.3. Composer
  - 2.6.4. Docker
  - 2.6.5. PHPMyAdmin
  - 2.6.6. Postman/Insomnia

### 3. PLANIFICACIÓN
- 3.1. Iniciación del proyecto
- 3.2. Iteraciones del proceso de desarrollo
  - 3.2.1. Fase 1-2: Setup inicial y autenticación
  - 3.2.2. Fase 3: Módulo de estudiante
  - 3.2.3. Fase 4: Módulo de profesor
  - 3.2.4. Fase 5: Sistema de defensas
  - 3.2.5. Fase 6: Panel administrativo
  - 3.2.6. Fase 7: Backend Symfony (En progreso)
  - 3.2.7. Fase 8: Pulimiento final
- 3.3. Diagrama de Gantt
- 3.4. Cronograma académico

### 4. ANÁLISIS DEL SISTEMA
- 4.1. Especificación de requisitos
  - 4.1.1. Requisitos de información
  - 4.1.2. Requisitos funcionales por rol
  - 4.1.3. Diagrama de casos de uso
  - 4.1.4. Descripción de casos de uso
  - 4.1.5. Diagramas de secuencia
  - 4.1.6. Requisitos no funcionales
- 4.2. Garantía de calidad
  - 4.2.1. Seguridad (JWT, roles, CORS)
  - 4.2.2. Interoperabilidad (REST APIs)
  - 4.2.3. Operabilidad (Responsive, UX)
  - 4.2.4. Transferibilidad (Docker, DDEV)
  - 4.2.5. Eficiencia (Performance)
  - 4.2.6. Mantenibilidad (Clean Code)
- 4.3. Gestión del presupuesto

### 5. DISEÑO
- 5.1. Arquitectura física
  - 5.1.1. Módulo frontend (React)
  - 5.1.2. Módulo backend (Symfony)
  - 5.1.3. Módulo de base de datos
  - 5.1.4. Módulo de archivos
- 5.2. Arquitectura lógica
  - 5.2.1. Capa de presentación
  - 5.2.2. Capa de lógica de negocio
  - 5.2.3. Capa de persistencia
  - 5.2.4. Capa de servicios
- 5.3. Esquema de la base de datos
- 5.4. Diseño de la interfaz de usuario
  - 5.4.1. Diseño responsive
  - 5.4.2. Sistema de navegación por roles
  - 5.4.3. UX/UI patterns

### 6. IMPLEMENTACIÓN
- 6.1. Arquitectura de componentes React
- 6.2. Sistema de autenticación y roles
- 6.3. Gestión de estado (Context API)
- 6.4. APIs REST y endpoints
- 6.5. Sistema de archivos y uploads
- 6.6. Calendario y defensas
- 6.7. Sistema de notificaciones
- 6.8. Panel administrativo

### 7. ENTREGA DEL PRODUCTO
- 7.1. Configuración de producción
- 7.2. Despliegue con Docker
- 7.3. CI/CD Pipeline
- 7.4. Documentación de entrega

### 8. PROCESOS DE SOPORTE Y PRUEBAS
- 8.1. Gestión y toma de decisiones
- 8.2. Gestión de riesgos
  - 8.2.1. Análisis de riesgos
  - 8.2.2. Plan de contingencia
- 8.3. Verificación y validación del software
  - 8.3.1. Frontend (Vitest, RTL)
  - 8.3.2. Backend (PHPUnit)
  - 8.3.3. APIs REST (Postman/Insomnia)
  - 8.3.4. Integración E2E
  - 8.3.5. Pruebas de carga

### 9. CONCLUSIONES Y TRABAJO FUTURO
- 9.1. Valoración del proyecto
- 9.2. Cumplimiento de los objetivos propuestos
- 9.3. Trabajo futuro
- 9.4. Lecciones aprendidas

### BIBLIOGRAFÍA

### ANEXOS
- **A. Manual de instalación**
  - i. Configuración de desarrollo
  - ii. DDEV setup
  - iii. Base de datos
  - iv. Variables de entorno
- **B. Manual de usuario**
  - i. Manual de estudiante
  - ii. Manual de profesor
  - iii. Manual de administrador
- **C. Documentación técnica adicional**
  - i. Diagramas UML
  - ii. Esquemas de base de datos
  - iii. Capturas de pantalla
  - iv. Código fuente relevante

---

## 🛠️ METODOLOGÍA DE TRABAJO

### Análisis Técnico Requerido
1. **Revisión exhaustiva del código fuente** en:
   - `/src` - Componentes React y lógica frontend
   - `/hooks` - Custom hooks y lógica de negocio
   - `/context` - Gestión de estado global
   - `/services` - Servicios de API y comunicaciones
   - `/pages` - Páginas por rol y funcionalidad

2. **Documentación de arquitectura**:
   - Diagramas UML de casos de uso
   - Diagramas de secuencia para flujos principales
   - Esquemas de base de datos (actual y propuesto)
   - Diagramas de arquitectura física y lógica

3. **Especificaciones técnicas**:
   - Requisitos funcionales por rol de usuario
   - APIs REST documentadas con OpenAPI
   - Casos de prueba y validación
   - Métricas de rendimiento y calidad

### Entregables por Fase
- **Fase 1**: Capítulos 1-3 (Visión, contexto, planificación)
- **Fase 2**: Capítulo 4 (Análisis completo del sistema)
- **Fase 3**: Capítulo 5 (Diseño y arquitectura)
- **Fase 4**: Capítulo 6 (Implementación detallada)
- **Fase 5**: Capítulos 7-9 (Entrega, pruebas, conclusiones)
- **Fase 6**: Anexos y manuales

---

## 📝 NOTAS DE PROGRESO

### Próximos Pasos
1. ✅ **Completado**: Análisis de estructura ISO/IEEE 16326
2. 🔄 **En progreso**: Creación del índice detallado
3. ⏳ **Pendiente**: Inicio del Capítulo 1 - Visión general del proyecto

### Decisiones Técnicas Importantes
- **Estándar**: ISO/IEEE 16326 adaptado para TFG académico
- **Formato**: Markdown con posibilidad de conversión a LaTeX/PDF
- **Enfoque**: Documentación técnica rigurosa pero accesible
- **Diagramas**: UML estándar con herramientas profesionales

### Información Clave del Proyecto
- **Stack**: React 19 + Symfony 6.4 + MySQL 8.0
- **Arquitectura**: Monorepo con frontend/backend separados
- **Roles**: 4 tipos de usuario con permisos diferenciados
- **Estado**: Fase 6 completada, Fase 7 (backend) en progreso
- **Características**: Sistema completo de gestión de TFG universitario

---

## 🔄 PARA CONTINUAR EN SESIONES FUTURAS

**Comando para retomar**: "Continúa con la documentación ISO/IEEE 16326 donde lo dejamos"

**Contexto necesario**:
1. Revisar este documento (DOCUMENTACION.md)
2. Leer CLAUDE.md, README.md y backend.md para contexto técnico
3. Revisar la todo list para ver el progreso actual
4. Continuar con el siguiente capítulo/sección pendiente

**Archivos clave del proyecto**:
- `/src` - Todo el código fuente frontend
- `/hooks` - Lógica de negocio personalizada  
- `/context` - Gestión de estado global
- `/pages` - Páginas organizadas por roles
- `package.json` - Dependencies y scripts
- **Backend** (fase 7): Pendiente de análisis detallado

---

*Última actualización: 31/08/2025 - Estado: Índice en desarrollo*