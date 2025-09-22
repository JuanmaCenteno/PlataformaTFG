# PREGUNTAS Y RESPUESTAS PARA LA DEFENSA DEL TFG
## Plataforma de Gestión de Trabajos de Fin de Grado

**Título:** Plataforma de Gestión de TFG
**Tecnologías:** React, Symfony, MySQL
**Estado:** Proyecto completado y funcional

---

## PREGUNTAS SOBRE MOTIVACIÓN Y OBJETIVOS

**¿Por qué decidiste desarrollar esta plataforma?**

Observé que en las universidades la gestión de TFGs se hace de forma muy fragmentada. Unos profesores usan email, otros documentos compartidos, y no hay un sistema que unifique todo el proceso desde que el estudiante sube su trabajo hasta que lo defiende. Quería crear algo que centralizara todo y mejorara la experiencia tanto para estudiantes como para profesores.

**¿Qué problema concreto soluciona tu proyecto?**

Principalmente tres cosas: primero, que la información está dispersa y se pierde fácilmente; segundo, que coordinar defensas y tribunales es muy complicado porque todo se hace por email; y tercero, que los estudiantes no saben en qué estado está su TFG en cada momento. Mi plataforma centraliza todo esto y hace que el proceso sea transparente para todos.

**¿Has conseguido cumplir tus objetivos?**

Sí, he conseguido implementar todo lo que me propuse. La plataforma tiene cuatro tipos de usuario diferentes con sus permisos correspondientes, gestiona todo el ciclo de vida del TFG, permite subir y descargar documentos de forma segura, tiene un calendario para las defensas, un sistema de notificaciones, y un panel para que los administradores puedan ver estadísticas y generar reportes.

---

## PREGUNTAS SOBRE TECNOLOGÍAS Y ARQUITECTURA

**¿Por qué elegiste React y Symfony?**

Para el frontend elegí React porque es lo que mejor conozco y tiene una comunidad muy grande, lo que significa que hay muchas librerías disponibles y mucha documentación. Para el backend elegí Symfony porque es muy robusto para aplicaciones web complejas, tiene un sistema de seguridad muy bueno que me venía perfecto para manejar los diferentes roles de usuario, y es un framework muy maduro y estable.

**¿Por qué separaste el frontend del backend?**

Quería que fueran independientes para que en el futuro se puedan modificar por separado. Además, así el backend puede servir datos no solo a la aplicación web sino también a una aplicación móvil si se quisiera hacer más adelante. También me parecía más limpio tener la lógica de presentación separada de la lógica de negocio.

**¿Por qué usaste JWT en lugar de sesiones tradicionales?**

Como tengo el frontend y backend separados, JWT me viene mejor porque no necesito mantener estado en el servidor. Con las sesiones tradicionales tendría que gestionar cookies y es más complicado cuando tienes dos aplicaciones separadas. Además, JWT es más escalable y si en el futuro quiero hacer una app móvil, los tokens JWT funcionan igual de bien.

---

## PREGUNTAS SOBRE IMPLEMENTACIÓN

**¿Cómo funciona el sistema de roles en tu aplicación?**

Tengo cuatro tipos de usuario: estudiantes, profesores, presidentes de tribunal y administradores. Cada uno puede acceder solo a las funciones que le corresponden. Los estudiantes pueden subir sus TFGs y ver el estado, los profesores pueden revisar los TFGs que tienen asignados, los presidentes pueden crear tribunales y programar defensas, y los administradores pueden gestionar usuarios y ver reportes del sistema.

**¿Cómo gestionas los estados del TFG?**

Los TFGs pasan por cuatro estados: borrador, en revisión, aprobado y defendido. Solo se puede pasar de un estado al siguiente si se cumplen ciertas condiciones, y cada cambio de estado envía notificaciones automáticas a las personas involucradas. Por ejemplo, cuando un profesor aprueba un TFG, el estudiante recibe una notificación automáticamente.

**¿Cómo implementaste la subida de archivos?**

Los estudiantes pueden subir archivos PDF desde la interfaz web. El sistema valida que sea realmente un PDF y que no supere el tamaño máximo permitido. Una vez subido, se guarda de forma segura en el servidor y solo las personas autorizadas pueden descargarlo.

**¿Cómo funciona el calendario de defensas?**

Los presidentes de tribunal pueden programar defensas seleccionando fecha, hora y aula. El calendario muestra todas las defensas programadas y permite ver los detalles de cada una. Cuando se programa una defensa, se envían notificaciones automáticas al estudiante y a todos los miembros del tribunal.

---

## PREGUNTAS SOBRE BASE DE DATOS

**¿Cómo diseñaste la base de datos?**

Tengo varias tablas principales: usuarios, TFGs, tribunales, defensas y notificaciones. Están todas relacionadas entre sí de forma lógica. Por ejemplo, cada TFG tiene un estudiante asignado y un tutor, cada defensa está asociada a un TFG y a un tribunal, y cada notificación pertenece a un usuario específico.

**¿Cómo aseguras que los datos sean coherentes?**

Uso claves foráneas para mantener la integridad referencial, lo que significa que no puedo borrar un usuario si tiene TFGs asociados, por ejemplo. También tengo validaciones tanto en el frontend como en el backend para asegurarme de que los datos que se guardan son correctos.

---

## PREGUNTAS SOBRE TESTING Y CALIDAD

**¿Has hecho pruebas de tu aplicación?**

Sí, he implementado principalmente tests en el backend usando PHPUnit. Tengo tests para verificar que las APIs funcionan correctamente, que los permisos se aplican bien, y que las validaciones funcionan como deben. El frontend está preparado para testing pero no he tenido tiempo de implementar todos los tests que me gustaría.

**¿Cómo aseguras la calidad del código?**

Uso herramientas como ESLint para el frontend que me ayudan a mantener un estilo de código consistente. En el backend, sigo las convenciones de Symfony y uso herramientas de análisis estático. También intento que el código sea legible y esté bien comentado para que sea fácil de mantener.

---

## PREGUNTAS SOBRE DIFICULTADES Y APRENDIZAJE

**¿Qué dificultades principales encontraste?**

La mayor dificultad fue hacer que el frontend y el backend se comuniquen correctamente, especialmente configurar CORS y la autenticación JWT. También me costó un poco diseñar bien la base de datos para que fuera eficiente pero flexible. Al principio tuve algunos problemas con la gestión del estado en React, pero los resolví usando el Context API.

**¿Qué has aprendido con este proyecto?**

He aprendido mucho sobre desarrollo full-stack real. Antes había hecho proyectos más pequeños, pero este me ha enseñado a planificar un sistema completo, a integrar tecnologías diferentes, y a pensar en aspectos como la seguridad y la escalabilidad. También he mejorado mucho mis habilidades de resolución de problemas.

**¿Qué harías diferente si empezaras de nuevo?**

Creo que habría planificado mejor la parte de testing desde el principio, en lugar de dejarlo para el final. También habría documentado mejor algunas decisiones técnicas mientras las tomaba. Pero en general estoy contento con el resultado.

---

## PREGUNTAS SOBRE TRABAJO FUTURO

**¿Qué mejoras le harías a la plataforma?**

Me gustaría añadir un sistema de notificaciones por email más robusto, mejorar la interfaz para que sea más responsive en móviles, y añadir más funcionalidades de reporting para los administradores. También sería interesante integrar algún sistema de detección de plagio.

**¿Crees que se podría usar en una universidad real?**

Sí, definitivamente. La aplicación es completamente funcional y cubre todas las necesidades básicas de gestión de TFGs. Obviamente habría que adaptarla a los procedimientos específicos de cada universidad y añadir algunas funcionalidades adicionales, pero la base está ahí y es sólida.

**¿Cómo la extenderías para múltiples universidades?**

Añadiría un nivel de organización superior para las universidades, de forma que cada una tuviera sus propios datos aislados. También permitiría configurar diferentes flujos de trabajo según las normativas de cada universidad, y añadiría más opciones de personalización de la interfaz.

---

## PREGUNTAS SOBRE EL VALOR DEL PROYECTO

**¿Qué aporta tu TFG al campo académico?**

Aporta una solución moderna y centralizada a un problema real que tienen las universidades. En lugar de gestionar TFGs con emails y documentos dispersos, ofrece una plataforma unificada que mejora la eficiencia y la transparencia del proceso. Esto beneficia tanto a estudiantes como a profesores y administradores.

**¿Cómo contribuye este proyecto a tu formación como ingeniero?**

Me ha permitido aplicar muchos de los conocimientos que he adquirido durante la carrera de forma práctica e integrada. He trabajado con bases de datos, desarrollo web, arquitectura de software, y he tenido que resolver problemas reales. Creo que me ha preparado muy bien para trabajar en el mundo profesional.

**¿Consideras que el proyecto cumple con los estándares de calidad?**

Sí, creo que sí. La aplicación es completamente funcional, está bien estructurada, usa tecnologías modernas y estándares de la industria, y está preparada para ser usada en un entorno real. Obviamente siempre se puede mejorar, pero considero que cumple con los objetivos que me planteé y con lo que se espera de un TFG.

---

**En resumen**, he desarrollado una plataforma completa que digitaliza la gestión de TFGs, mejora la comunicación entre todos los actores involucrados, y proporciona transparencia en todo el proceso. El proyecto está técnicamente bien implementado, es funcional, y aporta valor real al contexto académico universitario.