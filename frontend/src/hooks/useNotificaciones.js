import { useState } from 'react'
import { notificacionAPI } from '../services/api'

export const useNotificaciones = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener todas las notificaciones del usuario
  const obtenerNotificaciones = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await notificacionAPI.getAll()
      
      return { 
        success: true, 
        data: response.data.data || response.data,
        noLeidas: response.data.no_leidas || 0
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al obtener notificaciones'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Marcar una notificación como leída
  const marcarComoLeida = async (notificacionId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await notificacionAPI.markAsRead(notificacionId)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Notificación marcada como leída'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al marcar notificación como leída'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Marcar todas las notificaciones como leídas
  const marcarTodasComoLeidas = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await notificacionAPI.markAllAsRead()
      
      return { 
        success: true, 
        data: response.data,
        message: 'Todas las notificaciones marcadas como leídas'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al marcar todas las notificaciones como leídas'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Eliminar una notificación
  const eliminarNotificacion = async (notificacionId) => {
    setLoading(true)
    setError(null)
    
    try {
      await notificacionAPI.delete(notificacionId)
      
      return { 
        success: true,
        message: 'Notificación eliminada correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al eliminar notificación'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener solo notificaciones no leídas
  const obtenerNoLeidas = async () => {
    const resultado = await obtenerNotificaciones()
    
    if (resultado.success) {
      const noLeidas = resultado.data.filter(notif => !notif.leida)
      return {
        ...resultado,
        data: noLeidas,
        total: noLeidas.length
      }
    }
    
    return resultado
  }

  // Obtener notificaciones por tipo
  const obtenerPorTipo = async (tipo) => {
    const resultado = await obtenerNotificaciones()
    
    if (resultado.success) {
      const porTipo = resultado.data.filter(notif => notif.tipo === tipo)
      return {
        ...resultado,
        data: porTipo,
        total: porTipo.length
      }
    }
    
    return resultado
  }

  // Funciones auxiliares para manejo local de notificaciones
  const formatearNotificacion = (notificacion) => {
    const tiposIconos = {
      'info': 'ℹ️',
      'success': '✅', 
      'warning': '⚠️',
      'error': '❌'
    }

    return {
      ...notificacion,
      icono: tiposIconos[notificacion.tipo] || tiposIconos.info,
      fechaFormateada: new Date(notificacion.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      esReciente: (Date.now() - new Date(notificacion.created_at).getTime()) < 24 * 60 * 60 * 1000
    }
  }

  const agruparPorFecha = (notificaciones) => {
    const hoy = new Date()
    const ayer = new Date(hoy)
    ayer.setDate(ayer.getDate() - 1)
    
    const grupos = {
      hoy: [],
      ayer: [],
      anteriores: []
    }

    notificaciones.forEach(notif => {
      const fecha = new Date(notif.created_at)
      
      if (fecha.toDateString() === hoy.toDateString()) {
        grupos.hoy.push(formatearNotificacion(notif))
      } else if (fecha.toDateString() === ayer.toDateString()) {
        grupos.ayer.push(formatearNotificacion(notif))
      } else {
        grupos.anteriores.push(formatearNotificacion(notif))
      }
    })

    return grupos
  }

  const obtenerResumen = async () => {
    const resultado = await obtenerNotificaciones()
    
    if (resultado.success) {
      const notificaciones = resultado.data
      
      const resumen = {
        total: notificaciones.length,
        noLeidas: notificaciones.filter(n => !n.leida).length,
        porTipo: notificaciones.reduce((acc, notif) => {
          acc[notif.tipo] = (acc[notif.tipo] || 0) + 1
          return acc
        }, {}),
        recientes: notificaciones
          .filter(n => (Date.now() - new Date(n.created_at).getTime()) < 24 * 60 * 60 * 1000)
          .length,
        grupos: agruparPorFecha(notificaciones)
      }
      
      return {
        success: true,
        data: resumen
      }
    }
    
    return resultado
  }

  return {
    loading,
    error,
    // Operaciones principales
    obtenerNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    // Filtros y consultas específicas
    obtenerNoLeidas,
    obtenerPorTipo,
    obtenerResumen,
    // Utilidades de formato
    formatearNotificacion,
    agruparPorFecha,
    clearError: () => setError(null)
  }
}