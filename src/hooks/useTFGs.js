import { useState } from 'react'

export const useTFGs = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Simular subida de TFG (después será axios a Symfony)
  const subirTFG = async (formData) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular validación en servidor
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simular creación de FormData para envío
      const dataToSend = new FormData()
      dataToSend.append('titulo', formData.titulo)
      dataToSend.append('resumen', formData.resumen)
      dataToSend.append('palabrasClave', formData.palabrasClave)
      dataToSend.append('area', formData.area)
      dataToSend.append('tipoTFG', formData.tipoTFG)
      dataToSend.append('idioma', formData.idioma)
      if (formData.archivo) {
        dataToSend.append('archivo', formData.archivo)
      }

      // Aquí iría la llamada real a Symfony:
      // const response = await axios.post('/api/tfgs', dataToSend, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      //   onUploadProgress: (progressEvent) => {
      //     const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      //     onProgress?.(progress)
      //   }
      // })

      // Simular respuesta exitosa
      const response = {
        success: true,
        data: {
          id: Math.random().toString(36).substr(2, 9),
          ...formData,
          fechaSubida: new Date().toISOString(),
          estado: 'En revisión',
          comentarios: 0
        }
      }

      return response
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al subir el TFG'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener TFGs del estudiante
  const obtenerMisTFGs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Aquí iría la llamada real:
      // const response = await axios.get('/api/estudiante/tfgs')
      
      // Datos simulados
      const tfgs = [
        {
          id: 1,
          titulo: "Sistema de Gestión de TFGs con React y Symfony",
          estado: "En revisión",
          fechaSubida: "2025-01-15",
          tutor: "Dr. María García",
          area: "Desarrollo Web",
          comentarios: 2,
          archivo: "tfg_juan_perez.pdf"
        }
      ]
      
      return { success: true, data: tfgs }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al obtener TFGs'
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
      // Simular guardado de borrador
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Aquí iría la llamada real:
      // const response = await axios.post('/api/tfgs/borrador', formData)
      
      return { success: true, message: 'Borrador guardado correctamente' }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al guardar borrador'
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
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Aquí iría la llamada real:
      // await axios.delete(`/api/tfgs/${tfgId}`)
      
      return { success: true, message: 'TFG eliminado correctamente' }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar TFG'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Descargar TFG
  const descargarTFG = async (tfgId, nombreArchivo) => {
    try {
      // Aquí iría la llamada real para descargar:
      // const response = await axios.get(`/api/tfgs/${tfgId}/download`, {
      //   responseType: 'blob'
      // })
      // const url = window.URL.createObjectURL(new Blob([response.data]))
      // const link = document.createElement('a')
      // link.href = url
      // link.setAttribute('download', nombreArchivo)
      // document.body.appendChild(link)
      // link.click()
      // link.remove()
      
      // Simulación - descargar archivo de ejemplo
      const link = document.createElement('a')
      link.href = '#'
      link.setAttribute('download', nombreArchivo)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      return { success: true }
      
    } catch (err) {
      const errorMessage = 'Error al descargar el archivo'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  return {
    loading,
    error,
    subirTFG,
    obtenerMisTFGs,
    guardarBorrador,
    eliminarTFG,
    descargarTFG,
    clearError: () => setError(null)
  }
}