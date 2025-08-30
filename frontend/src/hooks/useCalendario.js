import { useState } from 'react'
import { defensaAPI, tribunalAPI, userAPI } from '../services/api'

export const useCalendario = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener eventos del calendario para un rango de fechas
  const obtenerEventos = async (fechaInicio, fechaFin) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await defensaAPI.getCalendario(fechaInicio, fechaFin)
      
      // Formatear eventos para FullCalendar
      const events = response.data.events || response.data.data || response.data
      const formattedEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: event.backgroundColor || '#3788d8',
        borderColor: event.borderColor || '#3788d8',
        extendedProps: {
          tfg_id: event.extendedProps?.tfg_id,
          tribunal_id: event.extendedProps?.tribunal_id,
          aula: event.extendedProps?.aula,
          estudiante: event.extendedProps?.estudiante,
          estado: event.extendedProps?.estado || 'programada'
        }
      }))
      
      return { 
        success: true, 
        data: formattedEvents
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al obtener eventos del calendario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener defensas del profesor (alias para compatibilidad)
  const obtenerDefensas = async (filtros = {}) => {
    const fechaInicio = filtros.fechaInicio || new Date().toISOString().split('T')[0]
    const fechaFin = filtros.fechaFin || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const eventos = await obtenerEventos(fechaInicio, fechaFin)
    
    if (!eventos.success) return eventos
    
    // Convertir eventos a formato defensas para compatibilidad
    const defensas = eventos.data.map(evento => ({
      id: evento.id,
      titulo: evento.title,
      fecha: evento.start,
      duracion: evento.extendedProps?.duracion || 60,
      aula: evento.extendedProps?.aula,
      estado: evento.extendedProps?.estado || 'Programado',
      estudiante: {
        nombre: evento.extendedProps?.estudiante
      },
      tribunal: {
        id: evento.extendedProps?.tribunal_id
      }
    }))
    
    return { success: true, data: defensas }
  }

  // Crear nueva defensa/evento
  const crearEvento = async (datosEvento) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await defensaAPI.create(datosEvento)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Evento creado correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al crear evento'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Programar nueva defensa (alias para compatibilidad)
  const programarDefensa = async (datosDefensa) => {
    // Adaptar formato de datos para la API
    const datosAPI = {
      tfg_id: datosDefensa.tfgId,
      tribunal_id: datosDefensa.tribunalId,
      fecha_defensa: `${datosDefensa.fecha}T${datosDefensa.hora}:00`,
      aula: datosDefensa.aula,
      duracion_estimada: datosDefensa.duracion || 30,
      observaciones: datosDefensa.observaciones || ''
    }
    
    return crearEvento(datosAPI)
  }

  // Actualizar evento existente
  const actualizarEvento = async (eventoId, datosEvento) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await defensaAPI.update(eventoId, datosEvento)
      
      return { 
        success: true, 
        data: response.data,
        message: 'Evento actualizado correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al actualizar evento'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Modificar defensa (alias para compatibilidad)
  const modificarDefensa = async (defensaId, cambios) => {
    const datosAPI = {}
    
    if (cambios.fecha && cambios.hora) {
      datosAPI.fecha_defensa = `${cambios.fecha}T${cambios.hora}:00`
    }
    if (cambios.aula) {
      datosAPI.aula = cambios.aula
    }
    if (cambios.duracion) {
      datosAPI.duracion_estimada = cambios.duracion
    }
    if (cambios.observaciones) {
      datosAPI.observaciones = cambios.observaciones
    }
    
    return actualizarEvento(defensaId, datosAPI)
  }

  // Eliminar evento
  const eliminarEvento = async (eventoId) => {
    setLoading(true)
    setError(null)
    
    try {
      await defensaAPI.delete(eventoId)
      
      return { 
        success: true,
        message: 'Evento eliminado correctamente'
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al eliminar evento'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Cancelar defensa (alias para compatibilidad)
  const cancelarDefensa = async (defensaId, motivo) => {
    const cambios = {
      estado: 'cancelada',
      observaciones: motivo
    }
    
    return actualizarEvento(defensaId, cambios)
  }

  // Mover evento (arrastrar y soltar)
  const moverEvento = async (eventoId, nuevaFecha, nuevaHora) => {
    const nuevaFechaHora = `${nuevaFecha}T${nuevaHora || '10:00:00'}`
    
    return actualizarEvento(eventoId, {
      fecha_defensa: nuevaFechaHora
    })
  }

  // Redimensionar evento (cambiar duración)
  const redimensionarEvento = async (eventoId, nuevaDuracion) => {
    return actualizarEvento(eventoId, {
      duracion_estimada: nuevaDuracion
    })
  }

  // Obtener tribunales disponibles
  const obtenerTribunalesDisponibles = async () => {
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

  // Detectar conflictos de horario
  const detectarConflictos = async (fechaHora, duracion, tribunalId, defensaId = null) => {
    setLoading(true)
    setError(null)
    
    try {
      const fecha = new Date(fechaHora)
      const fechaStr = fecha.toISOString().split('T')[0]
      
      // Obtener eventos del día
      const eventos = await obtenerEventos(fechaStr, fechaStr)
      
      if (!eventos.success) {
        throw new Error(eventos.error)
      }
      
      const conflictos = []
      const fechaInicio = new Date(fechaHora)
      const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000)
      
      // Verificar solapamiento con otros eventos
      eventos.data.forEach(evento => {
        if (evento.id === defensaId) return // Excluir el evento actual si se está modificando
        
        const eventoInicio = new Date(evento.start)
        const eventoFin = new Date(evento.end)
        
        // Verificar solapamiento
        if (fechaInicio < eventoFin && fechaFin > eventoInicio) {
          conflictos.push({
            tipo: 'defensa_solapada',
            descripcion: `Conflicto con: ${evento.title}`,
            gravedad: 'alta',
            evento: evento
          })
        }
      })
      
      // Verificar horarios de trabajo (9:00-18:00, lunes a viernes)
      const diaSemana = fechaInicio.getDay()
      const hora = fechaInicio.getHours()
      
      if (diaSemana === 0 || diaSemana === 6) {
        conflictos.push({
          tipo: 'fin_de_semana',
          descripcion: 'Se recomienda programar en días laborables',
          gravedad: 'media'
        })
      }
      
      if (hora < 9 || hora >= 18) {
        conflictos.push({
          tipo: 'fuera_horario_laboral',
          descripcion: 'Fuera del horario laboral recomendado (9:00-18:00)',
          gravedad: 'media'
        })
      }
      
      return {
        success: true,
        conflictos,
        recomendaciones: conflictos.length > 0 ? [
          { hora: '10:00', disponibilidad: 'alta' },
          { hora: '14:00', disponibilidad: 'alta' },
          { hora: '16:00', disponibilidad: 'media' }
        ] : []
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al detectar conflictos'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Verificar disponibilidad de aula
  const verificarDisponibilidadAula = async (aula, fechaHora, duracion) => {
    setLoading(true)
    setError(null)
    
    try {
      const fecha = new Date(fechaHora)
      const fechaStr = fecha.toISOString().split('T')[0]
      
      // Obtener eventos del día
      const eventos = await obtenerEventos(fechaStr, fechaStr)
      
      if (!eventos.success) {
        throw new Error(eventos.error)
      }
      
      const fechaInicio = new Date(fechaHora)
      const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000)
      
      // Verificar conflictos con el aula específica
      const conflictos = eventos.data.filter(evento => {
        if (evento.extendedProps?.aula !== aula) return false
        
        const eventoInicio = new Date(evento.start)
        const eventoFin = new Date(evento.end)
        
        return fechaInicio < eventoFin && fechaFin > eventoInicio
      })
      
      const disponible = conflictos.length === 0
      
      return {
        success: true,
        disponible,
        conflictos: conflictos.map(c => ({
          evento: c.title,
          inicio: c.start,
          fin: c.end
        })),
        sugerencias: !disponible ? [
          { hora: "10:00", disponible: true },
          { hora: "14:00", disponible: true },
          { hora: "16:00", disponible: true }
        ] : []
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al verificar disponibilidad'
      setError(errorMessage)
      return { success: false, disponible: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Obtener disponibilidad detallada del profesor
  const obtenerDisponibilidadProfesor = async (fechaInicio, fechaFin, profesorId = null) => {
    setLoading(true)
    setError(null)
    
    try {
      // Obtener eventos del período
      const eventos = await obtenerEventos(fechaInicio, fechaFin)
      
      if (!eventos.success) {
        throw new Error(eventos.error)
      }
      
      // Generar disponibilidad por días
      const disponibilidad = []
      const inicio = new Date(fechaInicio)
      const fin = new Date(fechaFin)
      
      for (let fecha = new Date(inicio); fecha <= fin; fecha.setDate(fecha.getDate() + 1)) {
        const fechaStr = fecha.toISOString().split('T')[0]
        const eventosDelDia = eventos.data.filter(evento => 
          evento.start.startsWith(fechaStr)
        )
        
        const ocupaciones = eventosDelDia.map(evento => ({
          inicio: new Date(evento.start).toTimeString().slice(0, 5),
          fin: new Date(evento.end).toTimeString().slice(0, 5),
          descripcion: evento.title,
          tipo: 'defensa',
          prioridad: 'alta'
        }))
        
        disponibilidad.push({
          fecha: fechaStr,
          diaSemana: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][fecha.getDay()],
          ocupaciones,
          horasLibres: calcularHorasLibres(ocupaciones),
          recomendaciones: generarRecomendaciones(ocupaciones, fecha.getDay())
        })
      }
      
      return { success: true, data: disponibilidad }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener disponibilidad del profesor'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Función auxiliar para calcular horas libres
  const calcularHorasLibres = (ocupaciones) => {
    const horariosOcupados = ocupaciones.map(o => ({
      inicio: o.inicio,
      fin: o.fin
    }))
    
    const horasLibres = []
    let horaActual = 9 // Empezar a las 9:00
    
    horariosOcupados
      .sort((a, b) => a.inicio.localeCompare(b.inicio))
      .forEach(ocupacion => {
        const inicioOcupacion = parseInt(ocupacion.inicio.split(':')[0])
        
        if (horaActual < inicioOcupacion) {
          horasLibres.push({
            inicio: `${horaActual.toString().padStart(2, '0')}:00`,
            fin: ocupacion.inicio,
            duracion: inicioOcupacion - horaActual
          })
        }
        
        horaActual = Math.max(horaActual, parseInt(ocupacion.fin.split(':')[0]) + 1)
      })
    
    // Tiempo libre después de la última ocupación
    if (horaActual < 18) {
      horasLibres.push({
        inicio: `${horaActual.toString().padStart(2, '0')}:00`,
        fin: '18:00',
        duracion: 18 - horaActual
      })
    }
    
    return horasLibres
  }

  // Función auxiliar para generar recomendaciones
  const generarRecomendaciones = (ocupaciones, diaSemana) => {
    const recomendaciones = []
    
    const mejoresHorarios = {
      1: ['10:00', '14:00', '16:00'], // Lunes
      2: ['10:00', '14:00', '15:00'], // Martes
      3: ['10:00', '12:00', '14:00'], // Miércoles
      4: ['10:00', '14:00', '16:00'], // Jueves
      5: ['10:00', '12:00', '14:00']  // Viernes
    }
    
    const horariosSugeridos = mejoresHorarios[diaSemana] || ['10:00', '14:00']
    
    horariosSugeridos.forEach(hora => {
      const tieneConflicto = ocupaciones.some(o => {
        return hora >= o.inicio && hora < o.fin
      })
      
      if (!tieneConflicto) {
        recomendaciones.push({
          hora,
          calidad: 'alta',
          motivo: 'Horario sin conflictos'
        })
      }
    })
    
    return recomendaciones
  }

  // Obtener aulas disponibles
  const obtenerAulasDisponibles = async (fecha, duracion = 60) => {
    setLoading(true)
    setError(null)
    
    try {
      // Lista de aulas disponibles (esto podría venir de una API dedicada)
      const todasLasAulas = [
        { id: 'aula-101', nombre: 'Aula 101', capacidad: 30, equipamiento: ['Proyector', 'Audio'] },
        { id: 'aula-102', nombre: 'Aula 102', capacidad: 25, equipamiento: ['Proyector'] },
        { id: 'aula-205', nombre: 'Aula 205', capacidad: 40, equipamiento: ['Proyector', 'Audio', 'Pizarra Digital'] },
        { id: 'aula-301', nombre: 'Aula 301', capacidad: 35, equipamiento: ['Proyector', 'Audio'] },
        { id: 'salon-actos', nombre: 'Salón de Actos', capacidad: 100, equipamiento: ['Proyector', 'Audio', 'Micrófonos'] }
      ]
      
      // Obtener eventos del día para verificar disponibilidad
      const eventos = await obtenerEventos(fecha, fecha)
      
      if (eventos.success) {
        const aulasOcupadas = eventos.data
          .map(evento => evento.extendedProps?.aula)
          .filter(Boolean)
        
        const aulasDisponibles = todasLasAulas.filter(aula => 
          !aulasOcupadas.includes(aula.nombre)
        )
        
        return { success: true, data: aulasDisponibles }
      }
      
      return { success: true, data: todasLasAulas }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener aulas disponibles'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    // Funciones principales de calendario
    obtenerEventos,
    crearEvento,
    actualizarEvento,
    eliminarEvento,
    moverEvento,
    redimensionarEvento,
    // Funciones de defensas (compatibilidad)
    obtenerDefensas,
    programarDefensa,
    modificarDefensa,
    cancelarDefensa,
    // Gestión de disponibilidad
    detectarConflictos,
    obtenerDisponibilidadProfesor,
    verificarDisponibilidadAula,
    obtenerAulasDisponibles,
    obtenerTribunalesDisponibles,
    obtenerProfesoresDisponibles,
    clearError: () => setError(null)
  }
}