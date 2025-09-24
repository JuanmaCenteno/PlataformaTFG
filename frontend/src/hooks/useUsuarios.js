import { useState } from 'react'
import { userAPI } from '../services/api'

export const useUsuarios = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener todos los usuarios con filtros y paginación
  const obtenerUsuarios = async (params = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await userAPI.getAll(params)
      
      return { 
        success: true, 
        data: response.data.data || response.data,
        meta: response.data.meta
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al obtener usuarios'
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
      const response = await userAPI.create(datosUsuario)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Usuario creado correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al crear usuario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar usuario existente
  const actualizarUsuario = async (usuarioId, datosUsuario) => {
    setLoading(true)
    setError(null)

    try {
      const response = await userAPI.update(usuarioId, datosUsuario)

      return {
        success: true,
        data: response.data,
        message: 'Usuario actualizado correctamente'
      }

    } catch (err) {
      console.error('Error en actualización:', err.response?.data)
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al actualizar usuario'
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
      await userAPI.delete(usuarioId)
      
      return { 
        success: true,
        message: 'Usuario eliminado correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al eliminar usuario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener solo profesores
  const obtenerProfesores = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await userAPI.getProfesores()
      
      return { 
        success: true, 
        data: response.data.data || response.data
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al obtener profesores'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener solo estudiantes
  const obtenerEstudiantes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await userAPI.getEstudiantes()
      
      return { 
        success: true, 
        data: response.data.data || response.data
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al obtener estudiantes'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Buscar usuarios por criterios
  const buscarUsuarios = async (termino, filtros = {}) => {
    const params = {
      search: termino,
      ...filtros
    }
    
    return obtenerUsuarios(params)
  }

  // Cambiar estado de usuario (activo/inactivo)
  const cambiarEstadoUsuario = async (usuarioId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await userAPI.toggleStatus(usuarioId)

      return {
        success: true,
        data: response.data,
        message: 'Estado del usuario cambiado correctamente'
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al cambiar estado del usuario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Cambiar roles de usuario
  const cambiarRolesUsuario = async (usuarioId, roles) => {
    return actualizarUsuario(usuarioId, { roles })
  }

  // Asignar rol a usuario (alias para compatibilidad)
  const asignarRol = async (usuarioId, nuevoRol, configuracionRol = {}) => {
    // Convertir rol simple a array de roles de Symfony
    const roleMapping = {
      'estudiante': ['ROLE_ESTUDIANTE'],
      'profesor': ['ROLE_PROFESOR'],
      'presidente': ['ROLE_PRESIDENTE_TRIBUNAL'],
      'admin': ['ROLE_ADMIN']
    }
    
    const roles = roleMapping[nuevoRol] || [nuevoRol]
    
    return cambiarRolesUsuario(usuarioId, roles)
  }

  // Resetear contraseña de usuario
  const resetearContrasena = async (usuarioId, nuevaContrasena) => {
    return actualizarUsuario(usuarioId, { password: nuevaContrasena })
  }

  // Alias para compatibilidad
  const resetearPassword = resetearContrasena

  // Obtener estadísticas de usuarios
  const obtenerEstadisticasUsuarios = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Esta funcionalidad se podría agregar al backend como endpoint específico
      const todosLosUsuarios = await obtenerUsuarios()
      
      if (!todosLosUsuarios.success) {
        throw new Error(todosLosUsuarios.error)
      }
      
      const usuarios = todosLosUsuarios.data
      
      const estadisticas = {
        totalUsuarios: usuarios.length,
        usuariosActivos: usuarios.filter(u => u.is_active).length,
        usuariosInactivos: usuarios.filter(u => !u.is_active).length,
        porRol: usuarios.reduce((acc, usuario) => {
          const rol = usuario.roles?.[0] || 'ROLE_ESTUDIANTE'
          const rolSimple = {
            'ROLE_ADMIN': 'admin',
            'ROLE_PRESIDENTE_TRIBUNAL': 'presidente',
            'ROLE_PROFESOR': 'profesor',
            'ROLE_ESTUDIANTE': 'estudiante'
          }[rol] || 'estudiante'
          
          acc[rolSimple] = (acc[rolSimple] || 0) + 1
          return acc
        }, {}),
        registrosRecientes: usuarios
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5),
        nuevosUltimoMes: usuarios.filter(u => {
          const fechaCreacion = new Date(u.createdAt)
          const haceMes = new Date()
          haceMes.setMonth(haceMes.getMonth() - 1)
          return fechaCreacion > haceMes
        }).length
      }
      
      return { 
        success: true, 
        data: estadisticas
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener estadísticas'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Validar datos de usuario antes de crear/actualizar
  const validarDatosUsuario = (datos, esActualizacion = false) => {
    const errores = []
    
    if (!esActualizacion && !datos.email) {
      errores.push('El email es obligatorio')
    }
    
    if (datos.email && !/\S+@\S+\.\S+/.test(datos.email)) {
      errores.push('El formato del email no es válido')
    }
    
    if (!esActualizacion && !datos.password) {
      errores.push('La contraseña es obligatoria')
    }
    
    if (datos.password && datos.password.length < 6) {
      errores.push('La contraseña debe tener al menos 6 caracteres')
    }
    
    if (!datos.nombre || datos.nombre.trim().length < 2) {
      errores.push('El nombre debe tener al menos 2 caracteres')
    }
    
    if (!datos.apellidos || datos.apellidos.trim().length < 2) {
      errores.push('Los apellidos deben tener al menos 2 caracteres')
    }
    
    if (!datos.roles || !Array.isArray(datos.roles) || datos.roles.length === 0) {
      errores.push('Debe asignar al menos un rol')
    }
    
    const rolesValidos = ['ROLE_ADMIN', 'ROLE_PRESIDENTE_TRIBUNAL', 'ROLE_PROFESOR', 'ROLE_ESTUDIANTE']
    if (datos.roles && datos.roles.some(rol => !rolesValidos.includes(rol))) {
      errores.push('Uno o más roles no son válidos')
    }
    
    return {
      valido: errores.length === 0,
      errores
    }
  }

  // Importar usuarios desde CSV/Excel (funcionalidad futura)
  const importarUsuarios = async (archivo) => {
    setLoading(true)
    setError(null)
    
    try {
      // Esta funcionalidad se implementaría en el backend
      // Por ahora simular
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return { 
        success: true, 
        data: {
          importados: 0,
          errores: [],
          duplicados: 0
        },
        message: 'Funcionalidad de importación no implementada aún'
      }
      
    } catch (err) {
      const errorMessage = 'Error al importar usuarios'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Exportar usuarios a CSV/Excel (funcionalidad futura)
  const exportarUsuarios = async (formato = 'csv', filtros = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      // Esta funcionalidad se implementaría en el backend
      // Por ahora simular
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { 
        success: true, 
        message: `Funcionalidad de exportación ${formato.toUpperCase()} no implementada aún`
      }
      
    } catch (err) {
      const errorMessage = 'Error al exportar usuarios'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener log de actividad de usuarios (funcionalidad futura)
  const obtenerLogActividad = async (usuarioId = null, fechaInicio = null, fechaFin = null) => {
    setLoading(true)
    setError(null)
    
    try {
      // Esta funcionalidad se implementaría en el backend
      await new Promise(resolve => setTimeout(resolve, 700))
      
      return { 
        success: true, 
        data: [],
        message: 'Funcionalidad de logs no implementada aún'
      }
      
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
    // Operaciones CRUD básicas
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    // Obtener por tipo
    obtenerProfesores,
    obtenerEstudiantes,
    // Búsqueda y filtrado
    buscarUsuarios,
    // Gestión de estado y roles
    cambiarEstadoUsuario,
    cambiarRolesUsuario,
    asignarRol, // Alias para compatibilidad
    resetearContrasena,
    resetearPassword, // Alias para compatibilidad
    // Estadísticas y reportes
    obtenerEstadisticasUsuarios,
    obtenerLogActividad,
    // Utilidades
    validarDatosUsuario,
    importarUsuarios,
    exportarUsuarios,
    clearError: () => setError(null)
  }
}