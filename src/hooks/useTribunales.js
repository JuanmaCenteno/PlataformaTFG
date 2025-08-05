import { useState } from 'react'

export const useTribunales = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Crear nuevo tribunal
  const crearTribunal = async (datosTribunal) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular validación
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Validaciones básicas
      if (!datosTribunal.nombre) {
        throw new Error('El nombre del tribunal es obligatorio')
      }
      if (!datosTribunal.fechaDefensa) {
        throw new Error('La fecha de defensa es obligatoria')
      }
      if (!datosTribunal.vocal1 || !datosTribunal.vocal2) {
        throw new Error('Debe asignar ambos vocales')
      }

      // Aquí iría la llamada real a Symfony:
      // const response = await axios.post('/api/tribunales', {
      //   nombre: datosTribunal.nombre,
      //   descripcion: datosTribunal.descripcion,
      //   fechaDefensa: datosTribunal.fechaDefensa,
      //   aula: datosTribunal.aula,
      //   tfgId: datosTribunal.tfgId,
      //   miembros: [
      //     { profesorId: getCurrentUserId(), rol: 'Presidente' },
      //     { profesorId: datosTribunal.vocal1Id, rol: 'Vocal' },
      //     { profesorId: datosTribunal.vocal2Id, rol: 'Vocal' }
      //   ]
      // })

      // Simular respuesta exitosa
      const nuevoTribunal = {
        id: Date.now(),
        ...datosTribunal,
        estado: 'Pendiente',
        fechaCreacion: new Date().toISOString()
      }

      return { success: true, data: nuevoTribunal }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al crear tribunal'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener tribunales del profesor
  const obtenerMisTribunales = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Aquí iría la llamada real:
      // const response = await axios.get('/api/profesor/tribunales')
      
      // Datos simulados
      const tribunales = [
        {
          id: 1,
          nombre: "Tribunal TFG - Desarrollo Web",
          estado: "Programado",
          fechaDefensa: "2025-02-15T10:00:00Z",
          miRol: "Presidente"
        }
      ]
      
      return { success: true, data: tribunales }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al obtener tribunales'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Guardar calificaciones de un tribunal
  const guardarCalificaciones = async (tribunalId, calificaciones, observaciones) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Validar que todas las calificaciones estén entre 0 y 10
      const valores = Object.values(calificaciones).filter(v => v !== null)
      if (valores.some(v => v < 0 || v > 10)) {
        throw new Error('Las calificaciones deben estar entre 0 y 10')
      }

      // Aquí iría la llamada real:
      // const response = await axios.put(`/api/tribunales/${tribunalId}/calificaciones`, {
      //   calificaciones,
      //   observaciones
      // })

      return { success: true, message: 'Calificaciones guardadas correctamente' }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al guardar calificaciones'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Cambiar estado del tribunal
  const cambiarEstadoTribunal = async (tribunalId, nuevoEstado) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Validar estados permitidos
      const estadosPermitidos = ['Pendiente', 'Programado', 'En curso', 'Completado', 'Cancelado']
      if (!estadosPermitidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido')
      }

      // Aquí iría la llamada real:
      // const response = await axios.patch(`/api/tribunales/${tribunalId}/estado`, {
      //   estado: nuevoEstado
      // })

      return { success: true, message: `Estado cambiado a ${nuevoEstado}` }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cambiar estado'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Generar acta del tribunal
  const generarActa = async (tribunalId) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Aquí iría la llamada real:
      // const response = await axios.post(`/api/tribunales/${tribunalId}/acta`)
      
      // Simular generación de acta
      const acta = {
        id: Date.now(),
        tribunalId,
        fechaGeneracion: new Date().toISOString(),
        urlDescarga: `/actas/tribunal_${tribunalId}_${Date.now()}.pdf`
      }

      return { success: true, data: acta, message: 'Acta generada correctamente' }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al generar acta'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener profesores disponibles para tribunal
  const obtenerProfesoresDisponibles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Aquí iría la llamada real:
      // const response = await axios.get('/api/profesores/disponibles')
      
      // Datos simulados
      const profesores = [
        { id: 1, nombre: 'Dr. Carlos López', email: 'carlos.lopez@uni.edu', departamento: 'Informática' },
        { id: 2, nombre: 'Dra. Ana Martín', email: 'ana.martin@uni.edu', departamento: 'Informática' },
        { id: 3, nombre: 'Dr. Pedro Ruiz', email: 'pedro.ruiz@uni.edu', departamento: 'Informática' },
        { id: 4, nombre: 'Dra. Isabel Moreno', email: 'isabel.moreno@uni.edu', departamento: 'Informática' },
        { id: 5, nombre: 'Dr. Luis Fernández', email: 'luis.fernandez@uni.edu', departamento: 'Informática' }
      ]
      
      return { success: true, data: profesores }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al obtener profesores'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener TFGs disponibles para asignar a tribunal
  const obtenerTFGsDisponibles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Aquí iría la llamada real:
      // const response = await axios.get('/api/tfgs/disponibles-tribunal')
      
      // Datos simulados - solo TFGs aprobados sin tribunal asignado
      const tfgs = [
        {
          id: 1,
          titulo: 'Sistema de Gestión de TFGs con React y Symfony',
          estudiante: 'Juan Pérez',
          tutor: 'Dr. Carlos López',
          fechaAprobacion: '2025-01-20'
        },
        {
          id: 2,
          titulo: 'Aplicación Móvil para Gestión de Entregas',
          estudiante: 'María Silva',
          tutor: 'Dra. Ana Martín',
          fechaAprobacion: '2025-01-18'
        },
        {
          id: 3,
          titulo: 'Sistema de Recomendación basado en IA',
          estudiante: 'Carlos Ruiz',
          tutor: 'Dr. Pedro Ruiz',
          fechaAprobacion: '2025-01-22'
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

  // Programar defensa
  const programarDefensa = async (tribunalId, fechaHora, aula) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Validaciones
      if (new Date(fechaHora) <= new Date()) {
        throw new Error('La fecha debe ser futura')
      }
      if (!aula) {
        throw new Error('Debe especificar un aula')
      }

      // Aquí iría la llamada real:
      // const response = await axios.put(`/api/tribunales/${tribunalId}/programar`, {
      //   fechaDefensa: fechaHora,
      //   aula
      // })

      return { success: true, message: 'Defensa programada correctamente' }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al programar defensa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener estadísticas de tribunales
  const obtenerEstadisticasTribunales = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Aquí iría la llamada real:
      // const response = await axios.get('/api/profesor/tribunales/estadisticas')
      
      const estadisticas = {
        totalTribunales: 5,
        comoPresidente: 3,
        comoVocal: 2,
        proximasDefensas: 2,
        completados: 1,
        promediocalificaciones: 8.2
      }
      
      return { success: true, data: estadisticas }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al obtener estadísticas'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Renombrar función para mantener compatibilidad
  const obtenerTribunales = obtenerMisTribunales

  // Asignar profesores al tribunal
  const asignarProfesores = async (tribunalId, profesores) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Verificar disponibilidad de profesores
      const profesoresOcupados = profesores.filter(() => Math.random() > 0.8) // 20% probabilidad
      
      if (profesoresOcupados.length > 0) {
        return {
          success: false,
          error: `Los siguientes profesores no están disponibles: ${profesoresOcupados.map(p => p.nombre).join(', ')}`
        }
      }

      return { 
        success: true, 
        message: 'Profesores asignados correctamente',
        data: { profesoresAsignados: profesores.length }
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al asignar profesores'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Modificar tribunal existente
  const modificarTribunal = async (tribunalId, cambios) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Validaciones específicas según el cambio
      if (cambios.vocales && cambios.vocales.length < 2) {
        throw new Error('Se requieren al menos 2 vocales')
      }

      return { success: true, message: 'Tribunal modificado correctamente' }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al modificar tribunal'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Configurar tribunal
  const configurarTribunal = async (tribunalId, configuracion) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Validar configuración
      if (configuracion.duracionDefensa < 30 || configuracion.duracionDefensa > 180) {
        throw new Error('La duración debe estar entre 30 y 180 minutos')
      }

      return { 
        success: true, 
        message: 'Configuración actualizada correctamente' 
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al configurar tribunal'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Generar acta de defensa
  const generarActaDefensa = async (defensaId, calificaciones) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Validar calificaciones
      if (!calificaciones.calificacionFinal) {
        throw new Error('La calificación final es obligatoria')
      }
      
      if (calificaciones.calificacionFinal < 0 || calificaciones.calificacionFinal > 10) {
        throw new Error('La calificación debe estar entre 0 y 10')
      }

      const acta = {
        id: `ACTA-${defensaId}-${Date.now()}`,
        defensaId,
        fechaGeneracion: new Date().toISOString(),
        tribunal: {
          presidente: "Dr. María García",
          vocales: ["Dr. Carlos López", "Dra. Ana Martín"]
        },
        calificaciones: {
          ...calificaciones,
          deliberacion: `Acta generada automáticamente el ${new Date().toLocaleDateString('es-ES')}`
        },
        estado: "Finalizada",
        archivoGenerado: `acta_defensa_${defensaId}.pdf`
      }

      return { 
        success: true, 
        data: acta, 
        message: 'Acta generada correctamente' 
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al generar acta'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener estadísticas del tribunal
  const obtenerEstadisticasTribunal = async (tribunalId) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const estadisticas = {
        totalDefensas: 11,
        defensasAprobadas: 9,
        defensasSuspensos: 2,
        promedioCalificaciones: 7.8,
        duracionPromedio: 65, // minutos
        tribunalActivo: true,
        ultimaDefensa: "2025-01-25T11:00:00Z",
        proximaDefensa: "2025-02-15T10:00:00Z",
        calificacionesPorMes: [
          { mes: 'Enero', aprobados: 4, suspensos: 1, promedio: 7.6 },
          { mes: 'Diciembre', aprobados: 3, suspensos: 0, promedio: 8.2 },
          { mes: 'Noviembre', aprobados: 2, suspensos: 1, promedio: 7.1 }
        ],
        profesoresMasActivos: [
          { nombre: "Dr. Carlos López", defensas: 8 },
          { nombre: "Dra. Ana Martín", defensas: 6 }
        ]
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

  return {
    loading,
    error,
    // Funciones básicas existentes
    crearTribunal,
    obtenerMisTribunales,
    obtenerTribunales, // Alias para compatibilidad
    guardarCalificaciones,
    cambiarEstadoTribunal,
    generarActa,
    obtenerProfesoresDisponibles,
    obtenerTFGsDisponibles,
    programarDefensa,
    obtenerEstadisticasTribunales,
    // Nuevas funciones para Fase 5.2
    modificarTribunal,
    asignarProfesores,
    configurarTribunal,
    generarActaDefensa,
    obtenerEstadisticasTribunal,
    clearError: () => setError(null)
  }
}