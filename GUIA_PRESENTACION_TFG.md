# GUÍA PARA LA PRESENTACIÓN DEL TFG
## Plataforma de Gestión de Trabajos de Fin de Grado

**Duración:** 15-20 minutos
**Número de diapositivas:** 15-18 diapositivas (aproximadamente 1 por minuto)

---

## ESTRUCTURA DIAPOSITIVA POR DIAPOSITIVA

### **DIAPOSITIVA 1: PORTADA** ⏱️ *30 segundos*

**Qué incluir:**
- Título del TFG: "Plataforma de Gestión de Trabajos de Fin de Grado"
- Tu nombre completo
- Nombre del tutor
- Universidad y facultad
- Grado en Ingeniería Informática
- Fecha de la defensa
- Logo de la universidad

**Qué decir:**
"Buenos días. Mi nombre es [tu nombre] y voy a presentar mi Trabajo de Fin de Grado titulado 'Plataforma de Gestión de Trabajos de Fin de Grado', dirigido por [nombre del tutor]."

---

### **DIAPOSITIVA 2: ÍNDICE** ⏱️ *30 segundos*

**Qué incluir:**
1. Motivación y objetivos
2. Análisis del problema
3. Tecnologías utilizadas
4. Arquitectura del sistema
5. Funcionalidades principales
6. Demostración
7. Resultados y conclusiones
8. Trabajo futuro

**Qué decir:**
"La presentación está estructurada en estas secciones principales. Comenzaré explicando la motivación del proyecto, después analizaré la solución técnica implementada, mostraré las funcionalidades principales, y terminaré con las conclusiones y el trabajo futuro."

---

### **DIAPOSITIVA 3: MOTIVACIÓN DEL PROYECTO** ⏱️ *2 minutos*

**Qué incluir:**
- Problema identificado en la gestión actual de TFGs
- Fragmentación de procesos
- Falta de transparencia
- Coordinación manual ineficiente

**Qué decir:**
"La motivación surge de observar cómo se gestionan los TFGs actualmente en las universidades. He identificado tres problemas principales: primero, la información está muy fragmentada entre emails, documentos y diferentes sistemas; segundo, coordinar defensas y tribunales se hace de forma muy manual y es ineficiente; y tercero, los estudiantes no tienen visibilidad clara del estado de su TFG. Todo esto genera confusión y pérdida de tiempo para todos los involucrados."

---

### **DIAPOSITIVA 4: OBJETIVOS DEL PROYECTO** ⏱️ *1 minuto*

**Qué incluir:**
- **Objetivo principal:** Desarrollar una plataforma web integral para la gestión de TFGs
- **Objetivos específicos:**
  - Centralizar toda la información
  - Automatizar el flujo de trabajo
  - Mejorar la comunicación entre actores
  - Proporcionar transparencia en el proceso

**Qué decir:**
"El objetivo principal es desarrollar una plataforma web que centralice toda la gestión de TFGs. Los objetivos específicos incluyen automatizar el flujo de trabajo desde la subida del documento hasta la defensa, mejorar la comunicación entre estudiantes, profesores y administradores, y dar transparencia completa a todo el proceso."

---

### **DIAPOSITIVA 5: ANÁLISIS DE USUARIOS** ⏱️ *1 minuto*

**Qué incluir:**
- **4 tipos de usuario identificados:**
  - Estudiantes
  - Profesores/Tutores
  - Presidentes de Tribunal
  - Administradores
- Necesidades específicas de cada uno

**Qué decir:**
"He identificado cuatro tipos de usuario con necesidades diferentes. Los estudiantes necesitan subir sus trabajos y conocer el estado en todo momento. Los profesores deben revisar y evaluar los TFGs asignados. Los presidentes de tribunal gestionan las defensas y coordinan los miembros. Y los administradores supervisan todo el sistema y generan reportes."

---

### **DIAPOSITIVA 6: TECNOLOGÍAS UTILIZADAS** ⏱️ *1.5 minutos*

**Qué incluir:**
- **Frontend:** React 19 + Vite
- **Backend:** Symfony 6.4 LTS
- **Base de datos:** MySQL 8.0
- **Autenticación:** JWT
- **Otras:** FullCalendar.js, Tailwind CSS, DDEV

**Qué decir:**
"Para el desarrollo he utilizado un stack moderno y robusto. En el frontend, React con Vite para una experiencia de desarrollo ágil. En el backend, Symfony, que me proporciona un framework muy sólido con excelente sistema de seguridad. MySQL como base de datos por su fiabilidad. JWT para autenticación porque funciona perfectamente con arquitecturas separadas frontend-backend. Y herramientas adicionales como FullCalendar para el sistema de defensas."

---

### **DIAPOSITIVA 7: ARQUITECTURA DEL SISTEMA** ⏱️ *2 minutos*

**Qué incluir:**
- Diagrama de arquitectura frontend/backend
- APIs REST como comunicación
- Separación de responsabilidades
- Flujo de datos

**Qué decir:**
"He diseñado una arquitectura con frontend y backend separados que se comunican através de APIs REST. Esta separación me permite que cada parte se pueda modificar y escalar independientemente. El frontend maneja toda la interfaz de usuario y la experiencia, mientras que el backend gestiona la lógica de negocio, la seguridad y los datos. Esto también facilita que en el futuro se pueda desarrollar una aplicación móvil que use las mismas APIs."

---

### **DIAPOSITIVA 8: MODELO DE BASE DE DATOS** ⏱️ *1.5 minutos*

**Qué incluir:**
- Diagrama entidad-relación simplificado
- Entidades principales: Users, TFGs, Tribunales, Defensas, Notificaciones
- Relaciones clave

**Qué decir:**
"El modelo de datos está centrado en estas entidades principales. Los usuarios pueden tener diferentes roles, los TFGs tienen un ciclo de vida con estados definidos, los tribunales se componen de varios profesores, las defensas programan las evaluaciones, y las notificaciones mantienen informados a todos los usuarios. Las relaciones están bien definidas para mantener la integridad de los datos."

---

### **DIAPOSITIVA 9: SISTEMA DE ROLES Y PERMISOS** ⏱️ *1.5 minutos*

**Qué incluir:**
- Matriz de permisos por rol
- Ejemplos de restricciones de acceso
- Seguridad implementada

**Qué decir:**
"He implementado un sistema de permisos granular donde cada tipo de usuario solo puede acceder a las funciones que le corresponden. Por ejemplo, los estudiantes solo pueden ver y modificar sus propios TFGs, los profesores solo acceden a los TFGs que tienen asignados, y los administradores tienen acceso completo pero con responsabilidades específicas de gestión del sistema."

---

### **DIAPOSITIVA 10: FUNCIONALIDADES PRINCIPALES - ESTUDIANTES** ⏱️ *1 minuto*

**Qué incluir:**
- Subida de documentos PDF
- Seguimiento del estado del TFG
- Visualización de comentarios del tutor
- Consulta de fecha de defensa
- Notificaciones automáticas

**Qué decir:**
"Para los estudiantes, la plataforma permite subir sus documentos PDF con validaciones de seguridad, hacer seguimiento en tiempo real del estado de su TFG, ver todos los comentarios y feedback de su tutor, consultar cuándo está programada su defensa, y recibir notificaciones automáticas de cualquier cambio importante."

---

### **DIAPOSITIVA 11: FUNCIONALIDADES PRINCIPALES - PROFESORES** ⏱️ *1 minuto*

**Qué incluir:**
- Gestión de TFGs asignados
- Sistema de revisión y comentarios
- Cambio de estados del TFG
- Participación en tribunales
- Calendario de defensas

**Qué decir:**
"Los profesores pueden gestionar todos los TFGs que tienen asignados, proporcionar feedback detallado a los estudiantes, cambiar el estado de los trabajos cuando cumplen los requisitos, participar en tribunales de evaluación, y consultar el calendario de defensas en las que participan."

---

### **DIAPOSITIVA 12: FUNCIONALIDADES PRINCIPALES - ADMINISTRACIÓN** ⏱️ *1 minuto*

**Qué incluir:**
- Gestión completa de usuarios
- Creación y gestión de tribunales
- Programación de defensas
- Reportes y estadísticas
- Configuración del sistema

**Qué decir:**
"Para la administración, he incluido funcionalidades de gestión completa de usuarios, creación y gestión de tribunales, programación del calendario de defensas, generación de reportes estadísticos sobre el estado de los TFGs, y herramientas de configuración general del sistema."

---

### **DIAPOSITIVA 13: DEMOSTRACIÓN - CAPTURAS DE PANTALLA** ⏱️ *2 minutos*

**Qué incluir:**
- 3-4 capturas de pantalla clave:
  - Dashboard del estudiante
  - Panel de revisión del profesor
  - Calendario de defensas
  - Panel administrativo

**Qué decir:**
"Aquí pueden ver la interfaz real de la aplicación. Esta es la vista del dashboard de un estudiante donde puede ver el estado de su TFG y las acciones disponibles. Esta otra es la vista del profesor donde puede revisar los trabajos asignados. El calendario muestra todas las defensas programadas de forma visual. Y este es el panel administrativo con estadísticas y herramientas de gestión."

---

### **DIAPOSITIVA 14: ASPECTOS TÉCNICOS DESTACADOS** ⏱️ *1.5 minutos*

**Qué incluir:**
- Autenticación JWT con refresh automático
- Sistema de notificaciones en tiempo real
- Upload seguro de archivos
- Testing implementado (90% cobertura backend)
- Código limpio y documentado

**Qué decir:**
"Desde el punto de vista técnico, he implementado autenticación JWT con renovación automática de tokens para mejorar la seguridad y experiencia de usuario. El sistema de notificaciones funciona en tiempo real. La subida de archivos incluye validaciones de seguridad. He implementado tests principalmente en el backend con una cobertura del 90%. Y todo el código sigue principios de código limpio y está bien documentado."

---

### **DIAPOSITIVA 15: RESULTADOS OBTENIDOS** ⏱️ *1 minuto*

**Qué incluir:**
- Proyecto completamente funcional
- Todas las funcionalidades implementadas
- Sistema listo para uso en producción
- Métricas de desarrollo (líneas de código, tests, etc.)

**Qué decir:**
"Los resultados obtenidos han cumplido completamente con los objetivos planteados. Tengo un sistema completamente funcional que cubre todo el ciclo de vida de gestión de TFGs. Todas las funcionalidades están implementadas y la aplicación está lista para ser usada en un entorno real de producción."

---

### **DIAPOSITIVA 16: CONCLUSIONES** ⏱️ *1.5 minutos*

**Qué incluir:**
- Objetivos cumplidos satisfactoriamente
- Solución integral al problema planteado
- Aplicación de conocimientos de la carrera
- Preparación para el mundo profesional

**Qué decir:**
"Como conclusiones, he conseguido desarrollar una solución integral que resuelve los problemas identificados en la gestión de TFGs. El proyecto me ha permitido aplicar de forma práctica muchos de los conocimientos adquiridos durante la carrera: desarrollo web, bases de datos, arquitectura de software, seguridad, y testing. Creo que me ha preparado muy bien para incorporarme al mundo profesional."

---

### **DIAPOSITIVA 17: TRABAJO FUTURO** ⏱️ *1 minuto*

**Qué incluir:**
- Mejoras identificadas:
  - Sistema de notificaciones por email
  - Aplicación móvil
  - Integración con sistemas universitarios existentes
  - Funcionalidades avanzadas de reporting

**Qué decir:**
"Como trabajo futuro, he identificado varias mejoras posibles: implementar un sistema más robusto de notificaciones por email, desarrollar una aplicación móvil que use las mismas APIs, integrar la plataforma con los sistemas universitarios existentes, y añadir funcionalidades más avanzadas de análisis y reporting."

---

### **DIAPOSITIVA 18: AGRADECIMIENTOS** ⏱️ *30 segundos*

**Qué incluir:**
- Agradecimiento al tutor
- Agradecimiento al tribunal
- Tu nombre y contacto
- "¿Preguntas?"

**Qué decir:**
"Para terminar, quiero agradecer a mi tutor [nombre] por su orientación durante todo el proyecto, y al tribunal por su tiempo y atención. Estoy disponible para responder cualquier pregunta que tengan. Muchas gracias."

---

## CONSEJOS GENERALES PARA LA PRESENTACIÓN

### **Antes de la presentación:**
- Ensaya al menos 3-4 veces completas
- Controla el tiempo en cada ensayo
- Prepárate para posibles preguntas técnicas
- Ten backup de la presentación en varios formatos

### **Durante la presentación:**
- Mantén contacto visual con el tribunal
- Usa las diapositivas como apoyo, no las leas
- Habla con claridad y a ritmo pausado
- Muestra seguridad y conocimiento del proyecto

### **Gestión del tiempo:**
- Si vas retrasado, prioriza las diapositivas de demostración y conclusiones
- Si vas adelantado, profundiza más en los aspectos técnicos
- Deja siempre tiempo para preguntas (mínimo 5 minutos)

### **Elementos clave a destacar:**
- La funcionalidad completa del sistema
- La aplicación práctica de conocimientos teóricos
- La resolución de un problema real
- La calidad técnica del desarrollo

**¡Mucha suerte en tu defensa!**