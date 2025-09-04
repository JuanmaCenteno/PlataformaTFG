# Tests de API - Plataforma TFG

Este directorio contiene tests completos para todos los endpoints de la API de la Plataforma de Gestión de TFGs.

## 🎯 Objetivo

Probar exhaustivamente todos los endpoints de la API backend (Symfony) contra la URL base `https://tfg-backend.ddev.site`, verificando:

- ✅ Autenticación y autorización por roles
- ✅ Funcionalidad CRUD de todas las entidades
- ✅ Validación de datos y manejo de errores
- ✅ Permisos y seguridad
- ✅ Limpieza automática de datos de prueba

## 📁 Estructura

```
backend/tests/
├── auth/                    # Tests de autenticación JWT
│   └── auth_test.py
├── tfgs/                    # Tests de gestión de TFGs
│   └── tfgs_test.py
├── tribunales/              # Tests de gestión de tribunales
│   └── tribunales_test.py
├── defensas/                # Tests de programación de defensas
│   └── defensas_test.py
├── users/                   # Tests de gestión de usuarios (Admin)
│   └── users_test.py
├── notifications/           # Tests del sistema de notificaciones
│   └── notifications_test.py
├── run_all_tests.py        # Script principal para ejecutar todos los tests
└── README.md               # Esta documentación
```

## 🚀 Ejecución

### Ejecutar todos los tests

```bash
cd backend/tests
python3 run_all_tests.py
```

### Ejecutar tests individuales

```bash
# Solo autenticación
python3 auth/auth_test.py

# Solo TFGs
python3 tfgs/tfgs_test.py

# Solo tribunales
python3 tribunales/tribunales_test.py

# Solo defensas
python3 defensas/defensas_test.py

# Solo usuarios
python3 users/users_test.py

# Solo notificaciones
python3 notifications/notifications_test.py
```

## 📊 Cobertura de Tests

### 🔐 Autenticación (5 tests)
- ✅ Login estudiante con credenciales válidas
- ✅ Login profesor con credenciales válidas  
- ✅ Login admin con credenciales válidas
- ✅ Login con credenciales inválidas (debe fallar)
- ✅ Refresh token (si está implementado)

### 📄 Gestión TFGs (8 tests)
- ✅ `GET /api/tfgs/mis-tfgs` como estudiante
- ✅ `GET /api/tfgs/mis-tfgs` como profesor
- ✅ `POST /api/tfgs` crear TFG como estudiante
- ✅ `PUT /api/tfgs/{id}` actualizar TFG como estudiante
- ✅ `POST /api/tfgs/{id}/upload` subir archivo PDF
- ✅ `PUT /api/tfgs/{id}/estado` cambiar estado como profesor
- ✅ `GET /api/tfgs/{id}/download` descargar archivo
- ✅ Limpieza automática de TFGs creados

### ⚖️ Gestión Tribunales (8 tests)
- ✅ `GET /api/tribunales` como profesor (permitido)
- ✅ `GET /api/tribunales` como admin (permitido)
- ✅ `GET /api/tribunales` como estudiante (forbidden)
- ✅ `POST /api/tribunales` como admin (permitido)
- ✅ `POST /api/tribunales` como presidente (permitido)
- ✅ `POST /api/tribunales` como profesor (forbidden)
- ✅ `POST /api/tribunales` como estudiante (forbidden)
- ✅ Validación de datos inválidos

### 🛡️ Gestión Defensas (9 tests)
- ✅ `GET /api/defensas/calendario` como profesor
- ✅ `GET /api/defensas/calendario` como estudiante
- ✅ `GET /api/defensas/calendario` como admin
- ✅ `POST /api/defensas` como admin (permitido)
- ✅ `POST /api/defensas` como presidente (permitido)
- ✅ `POST /api/defensas` como profesor (forbidden)
- ✅ `POST /api/defensas` como estudiante (forbidden)
- ✅ Validación de datos inválidos
- ✅ Test de conflictos de horario

### 👥 Gestión Usuarios (13 tests)
- ✅ `GET /api/users` como admin (permitido)
- ✅ `GET /api/users` con paginación
- ✅ `GET /api/users` con filtro por rol
- ✅ `GET /api/users` como profesor (forbidden)
- ✅ `GET /api/users` como estudiante (forbidden)
- ✅ `POST /api/users` crear estudiante como admin
- ✅ `POST /api/users` crear profesor como admin
- ✅ `POST /api/users` crear admin como admin
- ✅ `POST /api/users` como profesor (forbidden)
- ✅ `POST /api/users` como estudiante (forbidden)
- ✅ Validación email inválido
- ✅ Validación campos requeridos faltantes
- ✅ Validación email duplicado

### 🔔 Sistema Notificaciones (11 tests)
- ✅ `GET /api/notificaciones` como estudiante
- ✅ `GET /api/notificaciones` como profesor
- ✅ `GET /api/notificaciones` como admin
- ✅ `GET /api/notificaciones` sin autenticación (forbidden)
- ✅ `PUT /api/notificaciones/{id}/marcar-leida` como estudiante
- ✅ `PUT /api/notificaciones/{id}/marcar-leida` como profesor
- ✅ `PUT /api/notificaciones/{id}/marcar-leida` con ID inválido
- ✅ `PUT /api/notificaciones/{id}/marcar-leida` sin auth (forbidden)
- ✅ Intento de marcar notificación de otro usuario (forbidden)
- ✅ Filtrado por tipo de notificación
- ✅ Paginación de notificaciones

## 🧹 Sistema de Limpieza

Todos los tests incluyen **limpieza automática** para no dejar rastro:

- 🗑️ **TFGs creados**: Se eliminan automáticamente
- 🗑️ **Tribunales creados**: Se eliminan automáticamente  
- 🗑️ **Defensas programadas**: Se eliminan automáticamente
- 🗑️ **Usuarios creados**: Se eliminan automáticamente
- 🗑️ **Archivos temporales**: Se eliminan automáticamente
- 🗑️ **Tokens de sesión**: Se limpian del sistema

## 📋 Credenciales de Test

Los tests utilizan las credenciales definidas en `backend.md`:

```
Estudiante: estudiante@uni.es / 123456
Profesor:   profesor@uni.es / 123456  
Admin:      admin@uni.es / 123456
```

## 📈 Reporte de Resultados

El script principal genera:

1. **Reporte en consola** con resumen detallado
2. **Archivo JSON** con resultados completos en `/tmp/tfg_test_report_YYYYMMDD_HHMMSS.json`
3. **Exit code** apropiado (0 = éxito, 1 = fallos)

## 🔧 Dependencias

Los tests solo requieren:
- Python 3.6+
- Librería `requests` (HTTP client)
- Acceso de red a `https://tfg-backend.ddev.site`

```bash
pip install requests
```

## ⚠️ Notas Importantes

1. **URL Base**: Configurada para `https://tfg-backend.ddev.site` (no localhost:8000)
2. **Datos Reales**: Los tests operan contra datos reales, por eso la limpieza es crítica
3. **Orden de Ejecución**: La autenticación debe ejecutarse primero para obtener tokens
4. **Manejo de Errores**: Los tests distinguen entre errores esperados (validación) e inesperados
5. **Limpieza Garantizada**: Incluso si los tests fallan, se ejecuta la limpieza

## 🎯 Casos de Uso

### Desarrollo
Ejecutar los tests después de implementar nuevos endpoints para verificar funcionalidad.

### Testing de Integración  
Validar que todos los componentes de la API funcionan correctamente juntos.

### Regresión
Detectar si cambios en el código rompen funcionalidad existente.

### Documentación
Los tests sirven como documentación viva de cómo usar la API.

---

**🚨 IMPORTANTE**: Estos tests están diseñados para **NO DEJAR RASTRO**. Todos los datos creados durante las pruebas se eliminan automáticamente.