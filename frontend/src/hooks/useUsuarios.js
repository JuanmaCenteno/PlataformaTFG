import { useState } from 'react'

export const useUsuarios = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener todos los usuarios con filtros
  const obtenerUsuarios = async (filtros = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Simular base de datos de usuarios
      const usuarios = [
        {
          id: 1,
          nombre: "Dr. María García",
          email: "maria.garcia@uni.edu",
          rol: "profesor",
          departamento: "Ingeniería de Software",
          estado: "activo",
          fechaCreacion: "2024-01-15T10:00:00Z",
          ultimoAcceso: "2025-02-04T14:30:00Z",
          telefono: "+34 600 123 456",
          especialidades: ["Desarrollo Web", "Bases de Datos"],
          tribunales: 8,
          tfgsSupervisionados: 12
        },
        {
          id: 2,
          nombre: "Carlos López Estudiante",
          email: "carlos.lopez@estudiante.edu",
          rol: "estudiante",
          curso: "4º Ingeniería Informática",
          estado: "activo",
          fechaCreacion: "2024-09-01T08:00:00Z",
          ultimoAcceso: "2025-02-04T16:45:00Z",
          telefono: "+34 600 789 012",
          tutor: "Dr. María García",
          tfgAsignado: "Sistema de Gestión de TFGs",
          estadoTFG: "En desarrollo"
        },
        {
          id: 3,
          nombre: "Admin Sistema",
          email: "admin@uni.edu",
          rol: "admin",
          departamento: "Administración de Sistemas",
          estado: "activo",
          fechaCreacion: "2023-01-01T00:00:00Z",
          ultimoAcceso: "2025-02-04T18:00:00Z",
          telefono: "+34 600 000 000",
          permisos: ["usuarios", "sistema", "reportes", "configuracion"]
        },
        {
          id: 4,
          nombre: "Dr. Pedro Ruiz",
          email: "pedro.ruiz@uni.edu",
          rol: "profesor",
          departamento: "Desarrollo Móvil",
          estado: "activo",
          fechaCreacion: "2024-02-20T10:00:00Z",
          ultimoAcceso: "2025-02-03T12:15:00Z",
          telefono: "+34 600 345 678",
          especialidades: ["Android", "iOS", "React Native"],
          tribunales: 5,
          tfgsSupervisionados: 8
        },
        {
          id: 5,
          nombre: "Ana Martín Estudiante",
          email: "ana.martin@estudiante.edu",
          rol: "estudiante",
          curso: "4º Ingeniería Informática",
          estado: "inactivo",
          fechaCreacion: "2024-09-01T08:00:00Z",
          ultimoAcceso: "2024-12-15T10:30:00Z",
          telefono: "+34 600 456 789",
          tutor: "Dr. Pedro Ruiz",
          tfgAsignado: "App Móvil de Entregas",
          estadoTFG: "Aprobado"
        },
        {
          id: 6,
          nombre: "Dra. Isabel Moreno",
          email: "isabel.moreno@uni.edu",
          rol: "profesor",
          departamento: "Análisis de Datos",
          estado: "activo",
          fechaCreacion: "2024-03-10T10:00:00Z",
          ultimoAcceso: "2025-02-04T11:20:00Z",
          telefono: "+34 600 567 890",
          especialidades: ["Big Data", "Estadística", "Machine Learning"],
          tribunales: 6,
          tfgsSupervisionados: 10
        }
      ]

      // Aplicar filtros
      let usuariosFiltrados = usuarios

      if (filtros.rol && filtros.rol !== 'todos') {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.rol === filtros.rol)
      }

      if (filtros.estado && filtros.estado !== 'todos') {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.estado === filtros.estado)
      }

      if (filtros.departamento && filtros.departamento !== 'todos') {
        usuariosFiltrados = usuariosFiltrados.filter(u => 
          u.departamento?.toLowerCase().includes(filtros.departamento.toLowerCase())
        )
      }

      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase()
        usuariosFiltrados = usuariosFiltrados.filter(u => 
          u.nombre.toLowerCase().includes(busqueda) ||
          u.email.toLowerCase().includes(busqueda)
        )
      }

      return { success: true, data: usuariosFiltrados }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al obtener usuarios'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Crear nuevo usuario
  const crearUsuario = async (datosUsuario) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Validaciones
      if (!datosUsuario.nombre) throw new Error('El nombre es obligatorio')
      if (!datosUsuario.email) throw new Error('El email es obligatorio')
      if (!datosUsuario.rol) throw new Error('El rol es obligatorio')
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(datosUsuario.email)) {
        throw new Error('El formato del email no es válido')
      }

      // Validar email único (simulado)
      if (datosUsuario.email === 'admin@uni.edu') {
        throw new Error('Este email ya está registrado')
      }

      // Validaciones específicas por rol
      if (datosUsuario.rol === 'profesor' && !datosUsuario.departamento) {
        throw new Error('El departamento es obligatorio para profesores')
      }

      if (datosUsuario.rol === 'estudiante' && !datosUsuario.curso) {
        throw new Error('El curso es obligatorio para estudiantes')
      }

      const nuevoUsuario = {
        id: Date.now(),
        ...datosUsuario,
        estado: 'activo',
        fechaCreacion: new Date().toISOString(),
        ultimoAcceso: null,
        // Campos específicos por rol
        ...(datosUsuario.rol === 'profesor' && {
          tribunales: 0,
          tfgsSupervisionados: 0,
          especialidades: datosUsuario.especialidades || []
        }),
        ...(datosUsuario.rol === 'estudiante' && {
          tfgAsignado: null,
          estadoTFG: 'No iniciado',
          tutor: null
        }),
        ...(datosUsuario.rol === 'admin' && {
          permisos: datosUsuario.permisos || ['usuarios']
        })
      }

      return { 
        success: true, 
        data: nuevoUsuario, 
        message: 'Usuario creado correctamente' 
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al crear usuario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar usuario existente
  const actualizarUsuario = async (usuarioId, cambios) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Validaciones básicas
      if (cambios.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(cambios.email)) {
          throw new Error('El formato del email no es válido')
        }
      }

      // Validar cambio de rol
      if (cambios.rol) {
        // Simular verificación de dependencias
        if (cambios.rol !== 'profesor' && Math.random() > 0.7) {
          throw new Error('No se puede cambiar el rol: el usuario tiene tribunales asignados')
        }
      }

      return { 
        success: true, 
        message: 'Usuario actualizado correctamente' 
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar usuario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Eliminar usuario
  const eliminarUsuario = async (usuarioId) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Validaciones de integridad (simuladas)
      if (usuarioId === 1) {
        throw new Error('No se puede eliminar: el usuario tiene tribunales activos')
      }

      if (usuarioId === 3) {
        throw new Error('No se puede eliminar el usuario administrador principal')
      }

      return { 
        success: true, 
        message: 'Usuario eliminado correctamente' 
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar usuario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Cambiar estado de usuario (activar/desactivar)
  const cambiarEstadoUsuario = async (usuarioId, nuevoEstado) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const estadosPermitidos = ['activo', 'inactivo', 'suspendido']
      if (!estadosPermitidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido')
      }

      // Validaciones específicas
      if (nuevoEstado === 'inactivo' && usuarioId === 3) {
        throw new Error('No se puede desactivar el administrador principal')
      }

      return { 
        success: true, 
        message: `Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente` 
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al cambiar estado'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Asignar rol a usuario
  const asignarRol = async (usuarioId, nuevoRol, configuracionRol = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const rolesPermitidos = ['estudiante', 'profesor', 'admin']
      if (!rolesPermitidos.includes(nuevoRol)) {
        throw new Error('Rol no válido')
      }

      // Validar permisos para asignar admin
      if (nuevoRol === 'admin' && !configuracionRol.permisos) {
        throw new Error('Debe especificar los permisos para el rol de administrador')
      }

      // Validar cambios complejos
      if (usuarioId === 1 && nuevoRol !== 'profesor') {
        throw new Error('No se puede cambiar el rol: el usuario tiene TFGs supervisados')
      }

      return { 
        success: true, 
        message: `Rol asignado correctamente a ${nuevoRol}`,
        data: { nuevoRol, configuracion: configuracionRol }
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al asignar rol'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener estadísticas de usuarios
  const obtenerEstadisticasUsuarios = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const estadisticas = {
        totalUsuarios: 6,
        usuariosActivos: 5,
        usuariosInactivos: 1,
        porRol: {
          estudiante: 2,
          profesor: 3,
          admin: 1
        },
        nuevosUltimoMes: 2,
        ultimoAccesoPromedio: "2025-02-03T14:20:00Z",
        departamentos: [
          { nombre: "Ingeniería de Software", usuarios: 2 },
          { nombre: "Desarrollo Móvil", usuarios: 1 },
          { nombre: "Análisis de Datos", usuarios: 1 },
          { nombre: "Administración de Sistemas", usuarios: 1 }
        ],
        tendencias: {
          crecimientoMensual: 15.5,
          actividad: 87.3,
          retención: 92.1
        }
      }
      
      return { success: true, data: estadisticas }
      
    } catch (err) {
      const errorMessage = 'Error al obtener estadísticas'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Resetear contraseña de usuario
  const resetearPassword = async (usuarioId, nuevaPassword = null) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Si no se proporciona contraseña, generar una temporal
      const passwordTemporal = nuevaPassword || `temp_${Math.random().toString(36).substr(2, 8)}`
      
      return { 
        success: true, 
        message: 'Contraseña restablecida correctamente',
        data: { 
          passwordTemporal: nuevaPassword ? null : passwordTemporal,
          debeReiniciar: true
        }
      }
      
    } catch (err) {
      const errorMessage = 'Error al resetear contraseña'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener log de actividad de usuarios
  const obtenerLogActividad = async (usuarioId = null, fechaInicio = null, fechaFin = null) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 700))
      
      const logs = [
        {
          id: 1,
          usuarioId: 1,
          usuario: "Dr. María García",
          accion: "login",
          descripcion: "Inicio de sesión exitoso",
          ip: "192.168.1.100",
          timestamp: "2025-02-04T14:30:00Z"
        },
        {
          id: 2,
          usuarioId: 2,
          usuario: "Carlos López",
          accion: "upload_tfg",
          descripcion: "Subida de documento TFG",
          ip: "192.168.1.105",
          timestamp: "2025-02-04T16:45:00Z"
        },
        {
          id: 3,
          usuarioId: 3,
          usuario: "Admin Sistema",
          accion: "create_user",
          descripcion: "Creación de nuevo usuario",
          ip: "192.168.1.50",
          timestamp: "2025-02-04T18:00:00Z"
        },
        {
          id: 4,
          usuarioId: 1,
          usuario: "Dr. María García",
          accion: "create_tribunal",
          descripcion: "Creación de tribunal TFG",
          ip: "192.168.1.100",
          timestamp: "2025-02-04T10:15:00Z"
        }
      ]

      // Filtrar por usuario si se especifica
      const logsFiltrados = usuarioId 
        ? logs.filter(log => log.usuarioId === usuarioId)
        : logs

      return { success: true, data: logsFiltrados }
      
    } catch (err) {
      const errorMessage = 'Error al obtener log de actividad'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    // CRUD básico
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    // Gestión de estados y roles
    cambiarEstadoUsuario,
    asignarRol,
    resetearPassword,
    // Estadísticas y logs
    obtenerEstadisticasUsuarios,
    obtenerLogActividad,
    // Utilidades
    clearError: () => setError(null)
  }
}