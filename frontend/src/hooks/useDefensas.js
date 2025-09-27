import { useState, useCallback } from 'react'
import { defensaAPI } from '../services/api'

export const useDefensas = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener la defensa del estudiante actual
  const obtenerMiDefensa = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await defensaAPI.getMiDefensa()

      return {
        success: true,
        data: response.data.data || response.data
      }

    } catch (err) {
      const errorMessage = err.response?.status === 404
        ? 'No tienes una defensa programada'
        : err.response?.data?.message ||
          err.response?.data?.error ||
          'Error al obtener información de la defensa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener defensas pendientes de calificar
  const obtenerDefensasPendientesCalificar = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await defensaAPI.getPendientesCalificar()

      return {
        success: true,
        data: response.data.data || response.data
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al obtener defensas pendientes de calificar'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener defensas por tribunal
  const obtenerDefensasPorTribunal = useCallback(async (tribunalId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await defensaAPI.getByTribunal(tribunalId)

      return {
        success: true,
        data: response.data.data || response.data
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al obtener las defensas del tribunal'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener defensa por ID
  const obtenerDefensa = async (defensaId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await defensaAPI.getById(defensaId)

      return {
        success: true,
        data: response.data.data || response.data
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al obtener la defensa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener calendario de defensas
  const obtenerCalendario = async (fechaInicio, fechaFin) => {
    setLoading(true)
    setError(null)

    try {
      const response = await defensaAPI.getCalendario(fechaInicio, fechaFin)

      return {
        success: true,
        data: response.data.data || response.data
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al obtener el calendario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Crear defensa
  const crearDefensa = async (datosDefensa) => {
    setLoading(true)
    setError(null)

    try {
      const response = await defensaAPI.create(datosDefensa)

      return {
        success: true,
        data: response.data,
        message: 'Defensa creada correctamente'
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al crear la defensa'
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
                          'Error al actualizar la defensa'
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
                          'Error al eliminar la defensa'
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
                          'Error al generar el acta'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Descargar acta
  const descargarActa = async (defensaId) => {
    setError(null)

    try {
      const response = await defensaAPI.getActa(defensaId)

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `acta_defensa_${defensaId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return { success: true, message: 'Acta descargada correctamente' }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al descargar el acta'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Obtener información del acta (si está disponible)
  const obtenerInfoActa = useCallback(async (defensaId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await defensaAPI.getInfoActa(defensaId)

      return {
        success: true,
        data: response.data
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al obtener información del acta'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Calificar defensa (para miembros del tribunal)
  const calificarDefensa = async (defensaId, datosCalificacion) => {
    setLoading(true)
    setError(null)

    try {
      const response = await defensaAPI.calificar(defensaId, datosCalificacion)

      return {
        success: true,
        data: response.data,
        message: 'Calificación guardada correctamente'
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al guardar la calificación'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener calificaciones de una defensa
  const obtenerCalificacionesDefensa = useCallback(async (defensaId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await defensaAPI.getCalificaciones(defensaId)

      return {
        success: true,
        data: response.data.data || response.data
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al obtener las calificaciones'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Cambiar estado de defensa (completar, cancelar)
  const cambiarEstadoDefensa = async (defensaId, nuevoEstado, comentario = '') => {
    setLoading(true)
    setError(null)

    try {
      const response = await defensaAPI.changeEstado(defensaId, { estado: nuevoEstado, comentario })

      return {
        success: true,
        data: response.data,
        message: `Defensa ${nuevoEstado === 'completada' ? 'completada' : 'cancelada'} correctamente`
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al cambiar el estado de la defensa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    obtenerMiDefensa,
    obtenerDefensasPendientesCalificar,
    obtenerDefensasPorTribunal,
    obtenerDefensa,
    obtenerCalendario,
    crearDefensa,
    actualizarDefensa,
    eliminarDefensa,
    generarActa,
    descargarActa,
    obtenerInfoActa,
    calificarDefensa,
    obtenerCalificacionesDefensa,
    cambiarEstadoDefensa,
    clearError: () => setError(null)
  }
}