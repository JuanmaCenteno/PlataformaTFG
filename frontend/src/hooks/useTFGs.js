import { useState } from 'react'
import { tfgAPI } from '../services/api'

export const useTFGs = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Subir TFG con archivo
  const subirTFG = async (formData, onProgress) => {
    setLoading(true)
    setError(null)
    
    try {
      // Crear FormData para envío multipart
      const dataToSend = new FormData()
      dataToSend.append('titulo', formData.titulo)
      dataToSend.append('descripcion', formData.descripcion || '')
      dataToSend.append('resumen', formData.resumen)

      // Convertir palabras clave a JSON si es array
      if (Array.isArray(formData.palabrasClave)) {
        dataToSend.append('palabras_clave', JSON.stringify(formData.palabrasClave))
      } else {
        dataToSend.append('palabras_clave', formData.palabrasClave)
      }

      // Añadir los campos faltantes
      dataToSend.append('area_conocimiento', formData.area || '')
      dataToSend.append('tipo_tfg', formData.tipoTFG || '')
      dataToSend.append('idioma', formData.idioma || 'español')

      dataToSend.append('tutor_id', formData.tutorId || 1) // Usar el tutorId del formulario
      if (formData.cotutorId) {
        dataToSend.append('cotutor_id', formData.cotutorId)
      }
      
      if (formData.archivo) {
        dataToSend.append('archivo', formData.archivo)
      }

      const response = await tfgAPI.create(dataToSend)
      
      return { 
        success: true, 
        data: response.data,
        message: 'TFG subido correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al subir el TFG'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener TFGs del estudiante/profesor/admin
  const obtenerMisTFGs = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await tfgAPI.getMisTFGs()

      return {
        success: true,
        data: response.data.data || response.data,
        meta: response.data.meta
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al obtener TFGs'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener TFGs asignados al profesor
  const obtenerTFGsAsignados = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await tfgAPI.getTFGsAsignados()

      return {
        success: true,
        data: response.data.data || response.data,
        meta: response.data.meta
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al obtener TFGs asignados'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Guardar borrador
  const guardarBorrador = async (formData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await tfgAPI.guardarBorrador(formData)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Borrador guardado correctamente' 
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al guardar borrador'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar TFG existente
  const actualizarTFG = async (tfgId, formData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await tfgAPI.update(tfgId, formData)
      
      return { 
        success: true, 
        data: response.data,
        message: 'TFG actualizado correctamente' 
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al actualizar TFG'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Cambiar estado del TFG (solo profesores/admin)
  const cambiarEstado = async (tfgId, nuevoEstado, comentario = '') => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await tfgAPI.updateEstado(tfgId, nuevoEstado, comentario)
      
      return { 
        success: true, 
        data: response.data,
        message: `TFG marcado como ${nuevoEstado}` 
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al cambiar estado del TFG'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Eliminar TFG
  const eliminarTFG = async (tfgId) => {
    setLoading(true)
    setError(null)
    
    try {
      await tfgAPI.delete(tfgId)
      
      return { success: true, message: 'TFG eliminado correctamente' }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al eliminar TFG'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Subir archivo a TFG existente
  const subirArchivo = async (tfgId, archivo, onProgress) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await tfgAPI.upload(tfgId, archivo, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress?.(progress)
      })
      
      return { 
        success: true, 
        data: response.data,
        message: 'Archivo subido correctamente' 
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al subir archivo'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Descargar TFG
  const descargarTFG = async (tfgId, nombreArchivo) => {
    setError(null)
    
    try {
      const response = await tfgAPI.download(tfgId)
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', nombreArchivo || `tfg_${tfgId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return { success: true, message: 'Archivo descargado correctamente' }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al descargar el archivo'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Obtener TFG específico por ID
  const obtenerTFG = async (tfgId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await tfgAPI.getById(tfgId)

      return {
        success: true,
        data: response.data.data || response.data
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al obtener TFG'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener comentarios de un TFG
  const obtenerComentarios = async (tfgId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await tfgAPI.getComentarios(tfgId)

      return {
        success: true,
        data: response.data.data || response.data
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al obtener comentarios'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Añadir comentario a un TFG
  const añadirComentario = async (tfgId, comentario, tipo = 'feedback') => {
    setLoading(true)
    setError(null)

    try {
      const response = await tfgAPI.addComentario(tfgId, comentario, tipo)

      return {
        success: true,
        data: response.data,
        message: 'Comentario añadido correctamente'
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al añadir comentario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    subirTFG,
    obtenerMisTFGs,
    obtenerTFGsAsignados,
    obtenerTFG,
    guardarBorrador,
    actualizarTFG,
    cambiarEstado,
    eliminarTFG,
    subirArchivo,
    descargarTFG,
    obtenerComentarios,
    añadirComentario,
    clearError: () => setError(null)
  }
}