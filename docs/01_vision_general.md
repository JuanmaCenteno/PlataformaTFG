# 1. Visión general del proyecto

## 1.1. Motivación

En el ámbito académico universitario, la gestión de Trabajos de Fin de Grado (TFG) representa un proceso complejo que involucra múltiples actores: estudiantes, profesores tutores, tribunales de evaluación y personal administrativo. Tradicionalmente, este proceso se ha gestionado de manera fragmentada, utilizando herramientas dispersas como correo electrónico, documentos físicos y hojas de cálculo, lo que genera ineficiencias, pérdida de información y dificultades en el seguimiento del progreso académico.

La digitalización de los procesos educativos se ha acelerado significativamente, especialmente tras la pandemia de COVID-19, evidenciando la necesidad de sistemas integrados que faciliten la gestión académica remota y presencial. Las universidades requieren plataformas que no solo digitalicen los procesos existentes, sino que los optimicen mediante la automatización, el seguimiento en tiempo real y la generación de reportes analíticos.

Además, el cumplimiento de normativas académicas específicas, la gestión de plazos estrictos y la coordinación entre diferentes departamentos universitarios demandan una solución tecnológica robusta que centralice toda la información relacionada con los TFG en un único sistema accesible y seguro.

## 1.2. Objetivos

### 1.2.1. Objetivo General

Desarrollar una plataforma web integral para la gestión completa del ciclo de vida de los Trabajos de Fin de Grado, desde la propuesta inicial hasta la defensa final, proporcionando un sistema unificado que mejore la eficiencia, transparencia y seguimiento del proceso académico.

### 1.2.2. Objetivos Específicos

**Objetivos Funcionales:**

- **OF1**: Implementar un sistema de autenticación seguro basado en JWT que soporte múltiples roles de usuario (estudiante, profesor, presidente de tribunal, administrador)
- **OF2**: Desarrollar un módulo completo para estudiantes que permita la subida, edición y seguimiento del estado de sus TFG
- **OF3**: Crear un sistema de gestión para profesores tutores que facilite la supervisión, evaluación y retroalimentación de los TFG asignados
- **OF4**: Implementar un módulo de gestión de tribunales que permita la creación, asignación y coordinación de defensas
- **OF5**: Desarrollar un sistema de calendario integrado para la programación y gestión de defensas presenciales
- **OF6**: Crear un panel administrativo completo para la gestión de usuarios, reportes y configuración del sistema
- **OF7**: Implementar un sistema de notificaciones en tiempo real para mantener informados a todos los actores del proceso

**Objetivos Técnicos:**

- **OT1**: Diseñar una arquitectura frontend moderna basada en React 19 con componentes reutilizables y responsive design
- **OT2**: Implementar un backend robusto con Symfony 6.4 LTS que proporcione APIs REST seguras y escalables
- **OT3**: Establecer un sistema de base de datos optimizado con MySQL 8.0 que garantice la integridad y consistencia de los datos
- **OT4**: Desarrollar un sistema de gestión de archivos seguro para el almacenamiento y descarga de documentos TFG
- **OT5**: Implementar un sistema de testing automatizado que cubra tanto frontend como backend
- **OT6**: Configurar un entorno de desarrollo containerizado con DDEV para facilitar la colaboración y despliegue

**Objetivos de Calidad:**

- **OC1**: Garantizar un tiempo de respuesta menor a 2 segundos para todas las operaciones críticas del sistema
- **OC2**: Implementar medidas de seguridad que cumplan con estándares académicos de protección de datos
- **OC3**: Diseñar una interfaz de usuario intuitiva con una curva de aprendizaje mínima para todos los roles
- **OC4**: Asegurar compatibilidad cross-browser y responsive design para dispositivos móviles y tablets
- **OC5**: Establecer un sistema de backup y recuperación de datos que garantice la disponibilidad del servicio

## 1.3. Alcance

### 1.3.1. Alcance Funcional

**Incluido en el proyecto:**

- **Gestión completa del ciclo de vida del TFG**: Desde la creación inicial hasta la calificación final
- **Sistema multi-rol**: Soporte para cuatro tipos de usuario con permisos diferenciados
- **Gestión de archivos**: Upload, almacenamiento y descarga segura de documentos PDF
- **Sistema de calendario**: Programación y gestión de defensas con disponibilidad de tribunales
- **Panel de reportes**: Generación de estadísticas y exportación de datos en múltiples formatos
- **Sistema de notificaciones**: Alertas en tiempo real y notificaciones por email
- **API REST completa**: Endpoints documentados para todas las funcionalidades del sistema

**No incluido en el proyecto:**

- Sistema de videoconferencia integrado para defensas remotas
- Integración con sistemas de información universitarios existentes (ERP académico)
- Módulo de plagio o análisis de contenido automático
- Sistema de facturación o pagos
- Funcionalidades de red social o colaboración entre estudiantes
- Soporte multiidioma (solo español en esta versión)

### 1.3.2. Alcance Técnico

**Tecnologías implementadas:**

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router DOM v7
- **Backend**: Symfony 6.4 LTS, PHP 8.2+, API Platform 3.x
- **Base de datos**: MySQL 8.0 con Doctrine ORM
- **Autenticación**: JWT con refresh tokens
- **Gestión de archivos**: VichUploaderBundle con validaciones de seguridad
- **Testing**: PHPUnit (backend), Vitest (frontend)
- **Desarrollo**: DDEV con Docker, Composer, npm

**Limitaciones técnicas:**

- Soporte únicamente para archivos PDF (no otros formatos de documento)
- Base de datos relacional (no NoSQL para este alcance)
- Despliegue en servidor único (no arquitectura de microservicios)
- Almacenamiento local de archivos (no integración con servicios cloud en esta versión)

### 1.3.3. Alcance Temporal

El proyecto se desarrolla en 8 fases distribuidas a lo largo de 10 semanas académicas:

- **Fases 1-6**: Completadas (desarrollo frontend completo)
- **Fase 7**: En desarrollo (implementación backend Symfony)
- **Fase 8**: Planificada (testing, optimización y despliegue)

## 1.4. Visión general del documento

Este documento técnico sigue el estándar ISO/IEEE 16326 para documentación de sistemas software, adaptado al contexto académico de un Trabajo de Fin de Grado. La estructura del documento está organizada de la siguiente manera:

**Capítulo 1 - Visión general del proyecto**: Establece la motivación, objetivos y alcance del proyecto, proporcionando el contexto necesario para comprender la necesidad y los beneficios de la plataforma desarrollada.

**Capítulo 2 - Contexto del proyecto**: Describe detalladamente el entorno tecnológico, las características de los usuarios objetivo y el modelo de ciclo de vida adoptado para el desarrollo del sistema.

**Capítulo 3 - Planificación**: Presenta la metodología de desarrollo por fases, cronogramas de implementación y la distribución temporal de las actividades del proyecto.

**Capítulo 4 - Análisis del sistema**: Contiene la especificación completa de requisitos funcionales y no funcionales, casos de uso, diagramas UML y criterios de garantía de calidad.

**Capítulo 5 - Diseño**: Documenta la arquitectura del sistema tanto a nivel físico como lógico, incluyendo el diseño de la base de datos y la interfaz de usuario.

**Capítulo 6 - Implementación**: Detalla los aspectos técnicos de la implementación, incluyendo la estructura del código, patrones de diseño utilizados y decisiones de arquitectura.

**Capítulo 7 - Entrega del producto**: Describe los procesos de configuración, despliegue y entrega del sistema en entorno de producción.

**Capítulo 8 - Procesos de soporte y pruebas**: Documenta las estrategias de testing, gestión de riesgos y procesos de validación implementados.

**Capítulo 9 - Conclusiones y trabajo futuro**: Presenta una evaluación crítica del proyecto, cumplimiento de objetivos y propuestas de mejoras futuras.

Los anexos incluyen manuales técnicos de instalación y usuario, así como documentación adicional de referencia.

## 1.5. Estandarización del documento

Este documento ha sido desarrollado siguiendo las directrices del estándar **ISO/IEEE 16326:2009** - "Systems and software engineering - Life cycle processes - Project management", adaptado para proyectos académicos de desarrollo software.

### 1.5.1. Normas aplicadas

- **ISO/IEEE 16326:2009**: Estructura principal del documento y gestión de proyectos
- **IEEE Std 830-1998**: Especificación de requisitos software (Capítulo 4)
- **IEEE Std 1016-2009**: Descripciones de diseño software (Capítulo 5)
- **ISO/IEC 25010:2011**: Modelo de calidad del producto software (Capítulo 4.2)

### 1.5.2. Convenciones del documento

**Formato de texto:**
- Títulos principales: Numeración decimal (1., 1.1., 1.1.1.)
- Código fuente: Bloques de código con syntax highlighting
- Términos técnicos: Primera aparición en **negrita**
- Acrónimos: MAYÚSCULAS con definición en primera aparición

**Diagramas y figuras:**
- Numeración correlativa: Figura 1.1, Figura 1.2, etc.
- Pie de figura descriptivo con fuente cuando corresponda
- Formato vectorial preferible para diagramas técnicos

**Tablas:**
- Numeración correlativa: Tabla 1.1, Tabla 1.2, etc.
- Encabezados en negrita
- Alineación consistente según el tipo de contenido

**Referencias:**
- Bibliografía al final del documento
- Formato APA para referencias académicas
- Enlaces web con fecha de acceso

## 1.6. Acrónimos

| Acrónimo | Significado |
|----------|-------------|
| **API** | Application Programming Interface (Interfaz de Programación de Aplicaciones) |
| **CORS** | Cross-Origin Resource Sharing (Intercambio de Recursos de Origen Cruzado) |
| **CRUD** | Create, Read, Update, Delete (Crear, Leer, Actualizar, Eliminar) |
| **CSS** | Cascading Style Sheets (Hojas de Estilo en Cascada) |
| **DDEV** | Docker Development Environment |
| **DOM** | Document Object Model (Modelo de Objetos del Documento) |
| **EPL** | Event Processing Language (Lenguaje de Procesamiento de Eventos) |
| **HMR** | Hot Module Replacement (Reemplazo de Módulos en Caliente) |
| **HTML** | HyperText Markup Language (Lenguaje de Marcado de Hipertexto) |
| **HTTP** | HyperText Transfer Protocol (Protocolo de Transferencia de Hipertexto) |
| **IEEE** | Institute of Electrical and Electronics Engineers |
| **ISO** | International Organization for Standardization |
| **JSON** | JavaScript Object Notation (Notación de Objetos JavaScript) |
| **JWT** | JSON Web Token (Token Web JSON) |
| **LTS** | Long Term Support (Soporte a Largo Plazo) |
| **MVC** | Model-View-Controller (Modelo-Vista-Controlador) |
| **ORM** | Object-Relational Mapping (Mapeo Objeto-Relacional) |
| **PDF** | Portable Document Format (Formato de Documento Portable) |
| **PHP** | PHP: Hypertext Preprocessor |
| **REST** | Representational State Transfer (Transferencia de Estado Representacional) |
| **RTL** | React Testing Library |
| **SPA** | Single Page Application (Aplicación de Página Única) |
| **SQL** | Structured Query Language (Lenguaje de Consulta Estructurado) |
| **TFG** | Trabajo de Fin de Grado |
| **UI** | User Interface (Interfaz de Usuario) |
| **UML** | Unified Modeling Language (Lenguaje de Modelado Unificado) |
| **URL** | Uniform Resource Locator (Localizador Uniforme de Recursos) |
| **UX** | User Experience (Experiencia de Usuario) |

## 1.7. Definiciones

**Backend**: Conjunto de tecnologías y servicios del lado del servidor que procesan la lógica de negocio, gestionan la base de datos y proporcionan APIs para el frontend.

**Bundle**: En el contexto de Symfony, un bundle es un plugin que agrupa código relacionado (controladores, servicios, configuración) en una unidad reutilizable.

**Componente React**: Función o clase de JavaScript que retorna elementos JSX y encapsula lógica de interfaz de usuario reutilizable.

**Context API**: Sistema de gestión de estado global de React que permite compartir datos entre componentes sin necesidad de pasar props manualmente a través del árbol de componentes.

**Custom Hook**: Función JavaScript que comienza con "use" y permite extraer y reutilizar lógica de estado entre múltiples componentes React.

**Defensa de TFG**: Acto académico en el cual el estudiante presenta oralmente su Trabajo de Fin de Grado ante un tribunal evaluador para su calificación final.

**Doctrine ORM**: Herramienta de mapeo objeto-relacional para PHP que proporciona una capa de abstracción para interactuar con bases de datos relacionales.

**Endpoint**: URL específica de una API REST que acepta peticiones HTTP y devuelve respuestas estructuradas, representando un recurso o acción del sistema.

**Frontend**: Parte de la aplicación web que se ejecuta en el navegador del usuario, responsable de la interfaz de usuario y la interacción directa con el usuario final.

**Hot Module Replacement (HMR)**: Tecnología de desarrollo que permite actualizar módulos de código en tiempo real sin perder el estado de la aplicación.

**Middleware**: Función que se ejecuta durante el ciclo de vida de una petición HTTP, permitiendo modificar la petición o respuesta antes de llegar al destino final.

**Migración de Base de Datos**: Script que modifica la estructura de la base de datos de manera versionada, permitiendo evolucionar el esquema de datos de forma controlada.

**Monorepo**: Estrategia de organización de código donde múltiples proyectos relacionados (frontend, backend) se almacenan en un único repositorio Git.

**Props**: Abreviación de "properties", son argumentos que se pasan a los componentes React para configurar su comportamiento y apariencia.

**Protected Route**: Ruta de la aplicación que requiere autenticación y/o autorización específica para ser accedida, implementando control de acceso basado en roles.

**Responsive Design**: Enfoque de diseño web que permite que las interfaces se adapten automáticamente a diferentes tamaños de pantalla y dispositivos.

**Serialización**: Proceso de convertir objetos de programación en formatos de intercambio de datos como JSON o XML para transmisión o almacenamiento.

**State Management**: Gestión del estado de la aplicación, refiriéndose a cómo se almacenan, actualizan y comparten los datos entre diferentes partes de la aplicación.

**Token de Acceso**: Credencial digital temporal que permite a un usuario autenticado acceder a recursos protegidos de la aplicación sin necesidad de reenviar credenciales.

**Tribunal de TFG**: Comisión evaluadora compuesta por profesores académicos (presidente, secretario y vocal) responsable de evaluar y calificar las defensas de TFG.

**Utility-First CSS**: Metodología de CSS que utiliza clases pequeñas y específicas para construir interfaces, característica principal de frameworks como Tailwind CSS.

**Validación del lado del servidor**: Proceso de verificación y sanitización de datos recibidos en el backend antes de su procesamiento o almacenamiento.

**Virtual DOM**: Representación en memoria de la estructura DOM real que permite a React calcular eficientemente los cambios mínimos necesarios para actualizar la interfaz.

---

*Fecha de elaboración: 31 de agosto de 2025*  
*Versión: 1.0*  
*Estándar: ISO/IEEE 16326:2009*