# 2. Contexto del proyecto

## 2.1. Descripción general del proyecto

La Plataforma de Gestión de TFG es un sistema web integral diseñado para automatizar y optimizar el ciclo completo de gestión de Trabajos de Fin de Grado en entornos universitarios. El sistema implementa una arquitectura moderna basada en tecnologías web actuales, proporcionando una solución escalable que aborda las necesidades específicas de cuatro tipos de usuarios diferenciados.

La plataforma gestiona el flujo completo del proceso académico, desde la creación inicial del TFG por parte del estudiante hasta la calificación final tras la defensa ante el tribunal. El sistema implementa un modelo de estados bien definido (Borrador → En Revisión → Aprobado → Defendido) que garantiza la trazabilidad y el cumplimiento de los procedimientos académicos establecidos.

La arquitectura del sistema se basa en un patrón de separación de responsabilidades, donde el frontend desarrollado en React 19 se encarga de la presentación e interacción con el usuario, mientras que el backend implementado en Symfony 6.4 LTS gestiona la lógica de negocio, la persistencia de datos y la seguridad del sistema. Esta separación permite una mayor flexibilidad, escalabilidad y mantenibilidad del código.

El sistema incorpora funcionalidades avanzadas como un calendario interactivo para la programación de defensas, un sistema de notificaciones en tiempo real, gestión segura de archivos PDF, y un completo panel administrativo con capacidades de reporting y exportación de datos.

## 2.2. Características del usuario

El sistema ha sido diseñado para satisfacer las necesidades específicas de cuatro perfiles de usuario claramente diferenciados, cada uno con roles, permisos y flujos de trabajo particulares.

### 2.2.1. Estudiante

**Perfil**: Estudiante universitario en proceso de realización de su Trabajo de Fin de Grado, con conocimientos básicos de tecnologías web y experiencia en el uso de plataformas académicas digitales.

**Responsabilidades principales**:
- Creación y actualización de la información básica del TFG (título, resumen, palabras clave)
- Subida y gestión de archivos PDF con el contenido del trabajo
- Seguimiento del estado de progreso de su TFG a través del sistema
- Consulta de comentarios y feedback proporcionado por el tutor
- Visualización de información relacionada con la defensa (fecha, tribunal, aula)
- Recepción y gestión de notificaciones sobre cambios de estado

**Competencias técnicas esperadas**:
- Manejo básico de navegadores web y formularios online
- Capacidad para subir y descargar archivos
- Comprensión de conceptos básicos de gestión documental digital
- Familiaridad con herramientas de notificación electrónica

### 2.2.2. Profesor/Tutor

**Perfil**: Docente universitario con experiencia en dirección de TFG, responsable de la supervisión académica y evaluación de trabajos asignados.

**Responsabilidades principales**:
- Supervisión y seguimiento del progreso de TFG asignados
- Revisión y evaluación de documentos subidos por estudiantes
- Provisión de feedback estructurado mediante sistema de comentarios
- Gestión de cambios de estado de TFG (aprobación para defensa)
- Participación en tribunales de evaluación como miembro
- Coordinación con otros miembros del tribunal para programación de defensas

**Competencias técnicas esperadas**:
- Experiencia en evaluación de trabajos académicos
- Manejo avanzado de herramientas digitales de gestión académica
- Capacidad para proporcionar feedback constructivo a través de plataformas digitales
- Comprensión de flujos de trabajo colaborativos online

### 2.2.3. Presidente del Tribunal

**Perfil**: Profesor universitario con experiencia avanzada en evaluación académica, responsable de liderar tribunales de evaluación y coordinar el proceso de defensas.

**Responsabilidades principales**:
- Creación y configuración de tribunales de evaluación
- Asignación de miembros de tribunal y distribución de responsabilidades
- Programación de fechas y horarios de defensas utilizando el calendario integrado
- Coordinación de disponibilidad entre miembros del tribunal
- Supervisión del proceso de evaluación y calificación
- Generación de actas de defensa y documentación oficial

**Competencias técnicas esperadas**:
- Experiencia avanzada en gestión de procesos académicos
- Capacidad de liderazgo y coordinación de equipos de trabajo
- Manejo experto de herramientas de calendario y programación
- Comprensión de procedimientos administrativos universitarios

### 2.2.4. Administrador

**Perfil**: Personal técnico o administrativo responsable de la gestión global del sistema, con conocimientos avanzados en administración de plataformas web y gestión de usuarios.

**Responsabilidades principales**:
- Gestión completa del catálogo de usuarios del sistema (CRUD)
- Asignación y modificación de roles y permisos de acceso
- Generación de reportes estadísticos y analíticos del sistema
- Exportación de datos en múltiples formatos (PDF, Excel)
- Configuración y mantenimiento de parámetros del sistema
- Supervisión del funcionamiento general de la plataforma

**Competencias técnicas esperadas**:
- Experiencia avanzada en administración de sistemas web
- Conocimientos en gestión de bases de datos y reportes
- Capacidad analítica para interpretación de estadísticas
- Comprensión de conceptos de seguridad y gestión de accesos

## 2.3. Modelo de ciclo de vida

El desarrollo de la plataforma sigue un **modelo de ciclo de vida iterativo incremental**, estructurado en ocho fases bien definidas que permiten la entrega progresiva de funcionalidades y la validación continua de los requisitos.

### 2.3.1. Metodología de desarrollo

**Enfoque adoptado**: El proyecto implementa una metodología ágil adaptada al contexto académico, combinando elementos de Scrum para la gestión iterativa con prácticas de desarrollo incremental que permiten la entrega de valor en cada fase.

**Justificación de la metodología**:
- **Flexibilidad**: Permite adaptarse a cambios de requisitos durante el desarrollo
- **Validación temprana**: Cada fase entrega funcionalidades operativas
- **Gestión de riesgos**: Identificación y mitigación progresiva de problemas técnicos
- **Feedback continuo**: Posibilidad de ajustes basados en evaluación de fases anteriores

### 2.3.2. Fases del proyecto

**Fase 1-2: Fundación del sistema (Semanas 1-2)**
- Configuración del entorno de desarrollo
- Implementación del sistema de ruteo y navegación
- Desarrollo del sistema de autenticación básico
- Establecimiento de la arquitectura de componentes React

**Fase 3: Módulo de estudiante (Semanas 3-4)**
- Implementación completa de funcionalidades para estudiantes
- Sistema de subida y gestión de archivos
- Interfaces de seguimiento de estado de TFG
- Integración con sistema de notificaciones

**Fase 4: Módulo de profesor (Semanas 4-5)**
- Desarrollo de herramientas de supervisión para tutores
- Sistema de feedback y comentarios estructurados
- Interfaces de gestión de TFG asignados
- Integración con flujos de aprobación

**Fase 5: Sistema de defensas (Semanas 5-6)**
- Implementación del calendario interactivo con FullCalendar.js
- Sistema de gestión de tribunales
- Programación y coordinación de defensas
- Gestión de disponibilidad de miembros de tribunal

**Fase 6: Panel administrativo (Semanas 6-7)**
- Sistema completo de gestión de usuarios (CRUD)
- Generación de reportes y estadísticas avanzadas
- Funcionalidades de exportación de datos
- Configuración global del sistema

**Fase 7: Backend Symfony (Semanas 7-9)**
- Implementación completa del backend con Symfony 6.4 LTS
- Desarrollo de APIs REST con API Platform
- Sistema de autenticación JWT con refresh tokens
- Migración de datos desde sistema mock a base de datos MySQL

**Fase 8: Pulimiento final (Semanas 9-10)**
- Testing exhaustivo (unitario, integración y E2E)
- Optimización de rendimiento
- Configuración de despliegue en producción
- Documentación técnica y manuales de usuario

### 2.3.3. Criterios de finalización de fase

Cada fase debe cumplir criterios específicos antes de proceder a la siguiente:

- **Funcionalidades completas**: Todas las características planificadas operativas
- **Testing básico**: Pruebas unitarias y de integración implementadas
- **Documentación actualizada**: Registro de cambios y decisiones técnicas
- **Validación de requisitos**: Confirmación de cumplimiento de objetivos de fase

## 2.4. Tecnologías

La selección tecnológica se basa en criterios de modernidad, estabilidad, escalabilidad y soporte de la comunidad, priorizando tecnologías con soporte a largo plazo y ecosistemas maduros.

### 2.4.1. React 19

React 19 constituye la biblioteca principal para el desarrollo del frontend de la aplicación, proporcionando un marco de trabajo robusto para la construcción de interfaces de usuario interactivas y componentes reutilizables.

**Características principales utilizadas**:
- **Componentes funcionales con hooks**: Implementación moderna que permite gestión de estado y efectos secundarios de manera declarativa
- **Context API**: Sistema de gestión de estado global que evita el prop drilling y centraliza información crítica como autenticación y notificaciones
- **Suspense y lazy loading**: Optimización de carga de componentes para mejorar el rendimiento percibido por el usuario
- **Concurrent features**: Aprovechamiento de las nuevas características de renderizado concurrente para mejorar la responsividad de la aplicación

**Ventajas para el proyecto**:
- **Ecosistema maduro**: Amplia disponibilidad de librerías y componentes de terceros
- **Rendimiento optimizado**: Virtual DOM y algoritmos de reconciliación eficientes
- **Curva de aprendizaje**: Documentación extensa y comunidad activa
- **Compatibilidad**: Excelente integración con herramientas de desarrollo y testing

### 2.4.2. Symfony 6.4 LTS

Symfony 6.4 LTS se utiliza como framework principal para el desarrollo del backend, proporcionando una arquitectura sólida basada en componentes modulares y principios de desarrollo empresarial.

**Componentes principales utilizados**:
- **Symfony Security**: Gestión de autenticación, autorización y control de acceso basado en roles
- **Doctrine ORM**: Mapeo objeto-relacional para interacción con la base de datos MySQL
- **Symfony Serializer**: Transformación de objetos PHP a JSON para APIs REST
- **Symfony Mailer**: Sistema de envío de notificaciones por correo electrónico
- **Symfony Messenger**: Gestión de colas de mensajes para procesamiento asíncrono

**Ventajas para el proyecto**:
- **Long Term Support**: Garantía de soporte y actualizaciones de seguridad hasta 2027
- **Arquitectura modular**: Flexibilidad para utilizar únicamente los componentes necesarios
- **Rendimiento**: Optimizaciones internas y opcache de PHP para alta eficiencia
- **Estándares PSR**: Cumplimiento de estándares de la comunidad PHP

### 2.4.3. MySQL 8.0

MySQL 8.0 actúa como sistema de gestión de base de datos relacional, proporcionando persistencia segura y eficiente para todos los datos del sistema.

**Características utilizadas**:
- **JSON data type**: Almacenamiento nativo de datos JSON para metadatos flexibles (roles, palabras clave)
- **Window functions**: Consultas analíticas avanzadas para generación de reportes
- **Common Table Expressions (CTE)**: Consultas recursivas para jerarquías de datos
- **Performance Schema**: Monitorización y optimización de consultas

**Ventajas para el proyecto**:
- **Fiabilidad**: Sistema probado en entornos de producción exigentes
- **ACID compliance**: Garantías de consistencia e integridad de datos
- **Escalabilidad**: Capacidad de crecimiento horizontal y vertical
- **Herramientas**: Ecosistema rico de herramientas de administración y monitorización

### 2.4.4. API Platform 3.x

API Platform 3.x se utiliza para la generación automática de APIs REST, proporcionando funcionalidades avanzadas de serialización, documentación y validación.

**Funcionalidades implementadas**:
- **Auto-documentación OpenAPI**: Generación automática de documentación interactiva
- **Serialización contextual**: Control granular de qué datos exponer según el contexto
- **Validación automática**: Integración con Symfony Validator para validación de datos
- **Filtrado y paginación**: Capacidades de consulta avanzada desde el frontend

**Ventajas para el proyecto**:
- **Desarrollo rápido**: Reducción significativa del tiempo de implementación de APIs
- **Estándares REST**: Cumplimiento automático de convenciones REST
- **Testing integrado**: Herramientas incorporadas para testing de APIs
- **Documentación viva**: Documentación siempre actualizada automáticamente

### 2.4.5. JWT Authentication (LexikJWTAuthenticationBundle)

La autenticación JWT proporciona un sistema de seguridad stateless, escalable y moderno para el control de acceso a la aplicación.

**Implementación específica**:
- **Access tokens**: Tokens de corta duración (1 hora) para operaciones sensibles
- **Refresh tokens**: Tokens de larga duración (30 días) para renovación automática
- **Role-based claims**: Información de roles embebida en el payload del token
- **Algoritmo RS256**: Firma asimétrica para máxima seguridad

**Ventajas para el proyecto**:
- **Stateless**: No requiere almacenamiento de sesiones en el servidor
- **Escalabilidad**: Compatible con arquitecturas distribuidas
- **Seguridad**: Resistente a ataques CSRF y compatible con HTTPS
- **Interoperabilidad**: Estándar soportado por múltiples plataformas

### 2.4.6. FullCalendar.js

FullCalendar.js proporciona la funcionalidad de calendario interactivo para la gestión visual de defensas y programación de eventos académicos.

**Características implementadas**:
- **Múltiples vistas**: Mensual, semanal y diaria para diferentes niveles de detalle
- **Drag & drop**: Capacidad de reprogramación intuitiva de defensas
- **Event rendering**: Personalización visual según estado y tipo de defensa
- **Responsive design**: Adaptación automática a dispositivos móviles

**Ventajas para el proyecto**:
- **UX avanzada**: Interfaz familiar y intuitiva para usuarios
- **Integración React**: Wrapper nativo para React con hooks personalizados
- **Personalización**: Amplia capacidad de customización visual y funcional
- **Rendimiento**: Optimizado para manejar grandes cantidades de eventos

### 2.4.7. Tailwind CSS v4

Tailwind CSS v4 actúa como framework de estilos utility-first, proporcionando un sistema de diseño consistente y eficiente para toda la aplicación.

**Metodología de implementación**:
- **Utility-first approach**: Construcción de interfaces mediante clases utilitarias
- **Design system**: Paleta de colores, tipografías y espaciado sistemático
- **Responsive design**: Breakpoints móvil-first para adaptación multi-dispositivo
- **Dark mode support**: Preparación para futuras implementaciones de tema oscuro

**Ventajas para el proyecto**:
- **Desarrollo rápido**: Reducción significativa del tiempo de maquetación
- **Consistencia**: Sistema de diseño unificado en toda la aplicación
- **Optimización**: Purge automático de CSS no utilizado
- **Mantenibilidad**: Estilos co-localizados con componentes

### 2.4.8. DDEV

DDEV proporciona un entorno de desarrollo containerizado que garantiza consistencia entre diferentes máquinas de desarrollo y facilita el onboarding de nuevos desarrolladores.

**Configuración específica**:
- **PHP 8.2**: Versión específica con extensiones requeridas para Symfony
- **MySQL 8.0**: Base de datos con configuración optimizada para desarrollo
- **Nginx**: Servidor web con configuración para SPA y APIs
- **PHPMyAdmin**: Interface web para administración de base de datos

**Ventajas para el proyecto**:
- **Consistencia**: Entorno idéntico independientemente del sistema operativo host
- **Facilidad de setup**: Configuración automática con un comando
- **Aislamiento**: Contenedores aislados que no interfieren con el sistema host
- **Productividad**: Herramientas de desarrollo integradas y optimizadas

## 2.5. Lenguajes

### 2.5.1. JavaScript/TypeScript

JavaScript se utiliza como lenguaje principal para el desarrollo del frontend, aprovechando las características modernas de ECMAScript 2023 y preparado para migración incremental a TypeScript.

**Características del lenguaje utilizadas**:
- **ES6+ features**: Destructuring, arrow functions, template literals, async/await
- **Módulos ES6**: Sistema de importación/exportación modular
- **Promises y async/await**: Gestión asíncrona moderna para llamadas a APIs
- **Optional chaining**: Acceso seguro a propiedades de objetos anidados

**Patrones de programación aplicados**:
- **Programación funcional**: Uso extensivo de map, filter, reduce para transformación de datos
- **Immutability**: Evitar mutaciones directas de estado para mayor predictibilidad
- **Composition over inheritance**: Composición de funcionalidades mediante custom hooks
- **Declarative programming**: Enfoque declarativo en lugar de imperativo

### 2.5.2. PHP 8.2+

PHP 8.2+ actúa como lenguaje de backend, aprovechando las mejoras de rendimiento y características de tipado fuerte introducidas en versiones recientes.

**Características modernas utilizadas**:
- **Typed properties**: Declaración explícita de tipos para propiedades de clase
- **Union types**: Flexibilidad en declaración de tipos múltiples
- **Named arguments**: Llamadas a funciones más expresivas y mantenibles
- **Match expressions**: Alternativa moderna y expresiva a switch statements
- **Attributes**: Metadatos declarativos para configuración de componentes

**Principios de programación aplicados**:
- **SOLID principles**: Diseño orientado a objetos siguiendo principios de responsabilidad única, abierto/cerrado, etc.
- **Dependency injection**: Inversión de control para mayor testabilidad
- **PSR standards**: Cumplimiento de estándares de la comunidad PHP
- **Domain-driven design**: Organización del código según dominios de negocio

### 2.5.3. SQL

SQL se utiliza para definición de esquemas de base de datos, consultas complejas y procedimientos de migración, aprovechando características avanzadas de MySQL 8.0.

**Características SQL utilizadas**:
- **DDL avanzado**: Definición de esquemas con constraints, índices y relaciones complejas
- **Queries analíticas**: Window functions para reportes estadísticos
- **JSON functions**: Manipulación nativa de campos JSON en MySQL
- **Stored procedures**: Lógica de negocio crítica ejecutada directamente en base de datos

### 2.5.4. HTML/CSS

HTML5 y CSS3 proporcionan la estructura semántica y presentación visual de la aplicación, siguiendo estándares web modernos y mejores prácticas de accesibilidad.

**Estándares aplicados**:
- **Semantic HTML**: Uso de elementos semánticos para mejor SEO y accesibilidad
- **ARIA attributes**: Mejoras de accesibilidad para usuarios con discapacidades
- **CSS Grid y Flexbox**: Sistemas de layout modernos para interfaces complejas
- **CSS Custom Properties**: Variables CSS para theming y mantenibilidad

## 2.6. Herramientas

### 2.6.1. Visual Studio Code

VS Code actúa como IDE principal de desarrollo, configurado con extensiones específicas para el stack tecnológico del proyecto.

**Extensiones críticas configuradas**:
- **ES7+ React/Redux/React-Native snippets**: Acelera el desarrollo de componentes React
- **PHP Intelephense**: IntelliSense avanzado para desarrollo PHP y Symfony
- **Tailwind CSS IntelliSense**: Autocompletado y validación de clases Tailwind
- **GitLens**: Herramientas avanzadas de control de versiones Git
- **Thunder Client**: Cliente REST integrado para testing de APIs
- **Error Lens**: Visualización inline de errores y warnings

**Configuración del workspace**:
- **Settings compartidos**: Configuración unificada para formato, linting y comportamiento
- **Debugging configurado**: Breakpoints para PHP (Xdebug) y JavaScript
- **Task automation**: Scripts automatizados para comandos frecuentes
- **Multi-root workspace**: Gestión simultánea de frontend y backend

### 2.6.2. Vite

Vite se utiliza como build tool y servidor de desarrollo para el frontend, proporcionando una experiencia de desarrollo optimizada con Hot Module Replacement.

**Configuración específica**:
- **HMR optimizado**: Recarga instantánea de componentes modificados
- **Build optimization**: Tree shaking, code splitting y optimización de assets
- **Proxy configuration**: Configuración de proxy para APIs durante desarrollo
- **Environment variables**: Gestión de variables de entorno por ambiente

**Plugins utilizados**:
- **@vitejs/plugin-react**: Soporte completo para React y JSX
- **vite-plugin-eslint**: Integración de ESLint en tiempo de desarrollo
- **vite-plugin-pwa**: Preparación para futuras funcionalidades PWA

### 2.6.3. Composer

Composer gestiona las dependencias PHP del backend, garantizando versiones consistentes y resolución automática de dependencias.

**Configuración específica**:
- **Lock file**: Versiones exactas para despliegues reproducibles
- **Autoloading PSR-4**: Carga automática de clases siguiendo estándares
- **Scripts personalizados**: Comandos automatizados para testing y despliegue
- **Platform requirements**: Especificación de versiones mínimas de PHP y extensiones

### 2.6.4. Docker / DDEV

Docker proporciona containerización del entorno de desarrollo, mientras DDEV ofrece una capa de abstracción específica para desarrollo web.

**Servicios configurados**:
- **Web container**: PHP-FPM con Nginx para servir la aplicación Symfony
- **Database container**: MySQL 8.0 con configuración optimizada para desarrollo
- **PHPMyAdmin**: Interface web para administración de base de datos
- **Mailpit**: Servidor SMTP local para testing de emails

### 2.6.5. Git / GitHub

Git actúa como sistema de control de versiones, con GitHub proporcionando hosting remoto, colaboración y herramientas de CI/CD.

**Workflow configurado**:
- **Feature branches**: Desarrollo aislado de funcionalidades
- **Conventional commits**: Estándar de mensajes de commit para changelog automático
- **Pull requests**: Code review obligatorio antes de merge
- **GitHub Actions**: CI/CD automatizado para testing y despliegue

### 2.6.6. Postman / Insomnia

Herramientas de testing de APIs REST que permiten validación exhaustiva de endpoints durante el desarrollo y documentación de casos de uso.

**Configuración de testing**:
- **Collections organizadas**: Agrupación de endpoints por funcionalidad
- **Environment variables**: Configuración para diferentes ambientes (dev, staging, prod)
- **Test scripts**: Validación automática de respuestas y status codes
- **Documentation generation**: Generación automática de documentación de API
