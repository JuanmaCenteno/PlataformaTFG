import { useState } from 'react'
import { tribunalAPI, defensaAPI, userAPI, calificacionAPI } from '../services/api'

export const useTribunales = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener todos los tribunales
  const obtenerTribunales = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await tribunalAPI.getAll()
      
      return { 
        success: true, 
        data: response.data.data || response.data
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al obtener tribunales'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Crear nuevo tribunal
  const crearTribunal = async (datosTribunal) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await tribunalAPI.create(datosTribunal)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Tribunal creado correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al crear tribunal'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar tribunal existente
  const actualizarTribunal = async (tribunalId, datosTribunal) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await tribunalAPI.update(tribunalId, datosTribunal)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Tribunal actualizado correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al actualizar tribunal'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Eliminar tribunal
  const eliminarTribunal = async (tribunalId) => {
    setLoading(true)
    setError(null)
    
    try {
      await tribunalAPI.delete(tribunalId)
      
      return { 
        success: true,
        message: 'Tribunal eliminado correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al eliminar tribunal'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener miembros de un tribunal
  const obtenerMiembrosTribunal = async (tribunalId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await tribunalAPI.getMiembros(tribunalId)
      
      return { 
        success: true, 
        data: response.data.data || response.data
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al obtener miembros del tribunal'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener profesores disponibles
  const obtenerProfesoresDisponibles = async () => {
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

  // Crear defensa
  const programarDefensa = async (datosDefensa) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await defensaAPI.create(datosDefensa)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Defensa programada correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al programar defensa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar defensa
  const actualizarDefensa = async (defensaId, datosDefensa) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await defensaAPI.update(defensaId, datosDefensa)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Defensa actualizada correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al actualizar defensa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Eliminar defensa
  const eliminarDefensa = async (defensaId) => {
    setLoading(true)
    setError(null)
    
    try {
      await defensaAPI.delete(defensaId)
      
      return { 
        success: true,
        message: 'Defensa eliminada correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al eliminar defensa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Generar acta de defensa
  const generarActa = async (defensaId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await defensaAPI.generarActa(defensaId)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Acta generada correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al generar acta'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Descargar acta de defensa
  const descargarActa = async (defensaId, nombreArchivo) => {
    setError(null)
    
    try {
      const response = await defensaAPI.getActa(defensaId)
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', nombreArchivo || `acta_defensa_${defensaId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return { success: true, message: 'Acta descargada correctamente' }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al descargar acta'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Crear calificaciones
  const guardarCalificaciones = async (defensaId, calificaciones) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await calificacionAPI.create(defensaId, calificaciones)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Calificaciones guardadas correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al guardar calificaciones'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar calificaciones
  const actualizarCalificaciones = async (calificacionId, calificaciones) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await calificacionAPI.update(calificacionId, calificaciones)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Calificaciones actualizadas correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al actualizar calificaciones'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener calificaciones de una defensa
  const obtenerCalificaciones = async (defensaId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await calificacionAPI.get(defensaId)
      
      return { 
        success: true, 
        data: response.data.data || response.data
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al obtener calificaciones'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Aliases para mantener compatibilidad con el código existente
  const obtenerMisTribunales = obtenerTribunales
  const modificarTribunal = actualizarTribunal
  const cambiarEstadoTribunal = (tribunalId, estado) => {
    return actualizarTribunal(tribunalId, { activo: estado === 'activo' })
  }
  const asignarProfesores = (tribunalId, profesores) => {
    return actualizarTribunal(tribunalId, { 
      presidente_id: profesores.presidente?.id,
      secretario_id: profesores.secretario?.id,
      vocal_id: profesores.vocal?.id 
    })
  }
  const configurarTribunal = actualizarTribunal
  const generarActaDefensa = (defensaId, calificaciones) => {
    return guardarCalificaciones(defensaId, calificaciones).then(result => {
      if (result.success) {
        return generarActa(defensaId)
      }
      return result
    })
  }

  return {
    loading,
    error,
    // Funciones principales
    obtenerTribunales,
    crearTribunal,
    actualizarTribunal,
    eliminarTribunal,
    obtenerMiembrosTribunal,
    obtenerProfesoresDisponibles,
    programarDefensa,
    actualizarDefensa,
    eliminarDefensa,
    generarActa,
    descargarActa,
    guardarCalificaciones,
    actualizarCalificaciones,
    obtenerCalificaciones,
    // Aliases para compatibilidad
    obtenerMisTribunales,
    modificarTribunal,
    cambiarEstadoTribunal,
    asignarProfesores,
    configurarTribunal,
    generarActaDefensa,
    clearError: () => setError(null)
  }
}