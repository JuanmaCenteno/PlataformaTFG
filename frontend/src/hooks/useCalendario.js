import { useState } from 'react'

export const useCalendario = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener defensas del profesor
  const obtenerDefensas = async (filtros = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Datos simulados más completos
      const defensas = [
        {
          id: 1,
          titulo: "Sistema de Gestión de TFGs con React y Symfony",
          estudiante: { nombre: "Juan Pérez", email: "juan.perez@estudiante.edu" },
          fecha: "2025-02-15T10:00:00Z",
          duracion: 60,
          aula: "Aula 301",
          estado: "Programado",
          miRol: "Presidente",
          tribunal: {
            id: 1,
            nombre: "Tribunal TFG - Desarrollo Web",
            presidente: "Dr. María García",
            vocales: ["Dr. Carlos López", "Dra. Ana Martín"]
          },
          conflictos: [], // Sin conflictos
          recordatoriosEnviados: false
        },
        {
          id: 2,
          titulo: "Aplicación Móvil para Gestión de Entregas",
          estudiante: { nombre: "María Silva", email: "maria.silva@estudiante.edu" },
          fecha: "2025-02-17T12:00:00Z",
          duracion: 60,
          aula: "Aula 205",
          estado: "Programado",
          miRol: "Vocal",
          tribunal: {
            id: 2,
            nombre: "Tribunal TFG - Desarrollo Móvil",
            presidente: "Dr. Pedro Ruiz",
            vocales: ["Dr. María García", "Dra. Isabel Moreno"]
          },
          conflictos: [
            {
              tipo: "profesor_ocupado",
              descripcion: "Dr. Pedro Ruiz tiene clase hasta las 12:30",
              gravedad: "media"
            }
          ],
          recordatoriosEnviados: false
        }
      ]
      
      return { success: true, data: defensas }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al obtener defensas'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Detectar conflictos de horario
  const detectarConflictos = async (fechaHora, duracion, tribunalId, defensaId = null) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const conflictos = []
      const fechaInicio = new Date(fechaHora)
      const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000)
      
      // Simular verificación de conflictos
      
      // 1. Conflictos con otras defensas
      if (fechaInicio.getHours() === 10 && fechaInicio.getMinutes() === 30) {
        conflictos.push({
          tipo: 'defensa_solapada',
          descripcion: 'Hay otra defensa programada de 10:00 a 11:00',
          gravedad: 'alta',
          sugerencia: 'Cambiar a las 11:30 o 14:00'
        })
      }
      
      // 2. Conflictos con horarios de clase
      if (fechaInicio.getDay() >= 1 && fechaInicio.getDay() <= 5) { // Lunes a viernes
        if (fechaInicio.getHours() >= 9 && fechaInicio.getHours() <= 11) {
          conflictos.push({
            tipo: 'horario_docencia',
            descripcion: 'Horario de clases regulares (9:00-11:00)',
            gravedad: 'media',
            sugerencia: 'Considerar horario de tarde'
          })
        }
      }
      
      // 3. Disponibilidad de miembros del tribunal
      const miembrosOcupados = Math.random() > 0.7 // 30% probabilidad
      if (miembrosOcupados) {
        conflictos.push({
          tipo: 'profesor_ocupado',
          descripcion: 'Uno o más miembros del tribunal no están disponibles',
          gravedad: 'alta',
          sugerencia: 'Verificar disponibilidad de todos los miembros'
        })
      }
      
      return {
        success: true,
        conflictos,
        recomendaciones: conflictos.length > 0 ? [
          { hora: '14:00', disponibilidad: 'alta' },
          { hora: '16:00', disponibilidad: 'media' },
          { hora: '11:30', disponibilidad: 'baja' }
        ] : []
      }
      
    } catch (err) {
      return { success: false, error: 'Error al detectar conflictos' }
    }
  }

  // Programar nueva defensa con verificaciones
  const programarDefensa = async (datosDefensa) => {
    setLoading(true)
    setError(null)
    
    try {
      // 1. Validaciones básicas
      if (!datosDefensa.tfgId) throw new Error('Debe seleccionar un TFG')
      if (!datosDefensa.fecha) throw new Error('La fecha es obligatoria')
      if (!datosDefensa.hora) throw new Error('La hora es obligatoria')
      if (!datosDefensa.aula) throw new Error('Debe seleccionar un aula')
      if (!datosDefensa.tribunalId) throw new Error('Debe asignar un tribunal')

      const fechaDefensa = new Date(`${datosDefensa.fecha}T${datosDefensa.hora}`)
      if (fechaDefensa <= new Date()) {
        throw new Error('La fecha debe ser futura')
      }

      // 2. Detectar conflictos
      const conflictosResult = await detectarConflictos(
        fechaDefensa, 
        datosDefensa.duracion || 60, 
        datosDefensa.tribunalId
      )
      
      if (!conflictosResult.success) {
        throw new Error('Error al verificar conflictos')
      }

      // 3. Verificar disponibilidad del aula
      const disponibilidadAula = await verificarDisponibilidadAula(
        datosDefensa.aula, 
        fechaDefensa, 
        datosDefensa.duracion || 60
      )
      
      if (!disponibilidadAula.disponible) {
        throw new Error(`El aula ${datosDefensa.aula} no está disponible en ese horario`)
      }

      // 4. Si hay conflictos graves, requerir confirmación
      const conflictosGraves = conflictosResult.conflictos.filter(c => c.gravedad === 'alta')
      if (conflictosGraves.length > 0 && !datosDefensa.forzarProgramacion) {
        return {
          success: false,
          requiereConfirmacion: true,
          conflictos: conflictosResult.conflictos,
          recomendaciones: conflictosResult.recomendaciones
        }
      }

      // 5. Crear la defensa
      await new Promise(resolve => setTimeout(resolve, 1200))

      const nuevaDefensa = {
        id: Date.now(),
        ...datosDefensa,
        fechaDefensa: fechaDefensa.toISOString(),
        estado: 'Programado',
        conflictos: conflictosResult.conflictos.filter(c => c.gravedad !== 'alta'),
        fechaCreacion: new Date().toISOString(),
        recordatoriosEnviados: false
      }

      // 6. Enviar notificaciones automáticamente
      await enviarNotificacionDefensa(nuevaDefensa.id, 'programada', [
        nuevaDefensa.estudiante?.email,
        ...nuevaDefensa.tribunal?.vocales?.map(v => `${v.toLowerCase().replace(' ', '.')}@uni.edu`) || []
      ])

      return { 
        success: true, 
        data: nuevaDefensa, 
        message: 'Defensa programada correctamente',
        conflictos: conflictosResult.conflictos
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al programar defensa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Verificar disponibilidad de aula mejorada
  const verificarDisponibilidadAula = async (aula, fechaHora, duracion) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const fechaInicio = new Date(fechaHora)
      const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000)
      
      // Simular base de datos de reservas de aulas
      const reservasExistentes = [
        {
          aula: "Aula 301",
          fecha: "2025-02-15",
          horaInicio: "09:00",
          horaFin: "10:00",
          evento: "Clase de Programación",
          tipo: "docencia"
        },
        {
          aula: "Aula 205",
          fecha: "2025-02-17",
          horaInicio: "11:30",
          horaFin: "12:30",
          evento: "Defensa TFG - Carlos Ruiz",
          tipo: "defensa"
        }
      ]
      
      // Verificar conflictos
      const conflictos = reservasExistentes.filter(reserva => {
        if (reserva.aula !== aula) return false
        if (reserva.fecha !== fechaInicio.toISOString().split('T')[0]) return false
        
        const reservaInicio = new Date(`${reserva.fecha}T${reserva.horaInicio}:00`)
        const reservaFin = new Date(`${reserva.fecha}T${reserva.horaFin}:00`)
        
        // Verificar solapamiento
        return (fechaInicio < reservaFin && fechaFin > reservaInicio)
      })
      
      const disponible = conflictos.length === 0
      
      return {
        success: true,
        disponible,
        conflictos: conflictos.map(c => ({
          evento: c.evento,
          horaInicio: c.horaInicio,
          horaFin: c.horaFin,
          tipo: c.tipo
        })),
        sugerencias: !disponible ? [
          { hora: "14:00", disponible: true },
          { hora: "16:00", disponible: true },
          { hora: "08:00", disponible: true }
        ] : []
      }
      
    } catch (err) {
      return { success: false, disponible: false, error: 'Error al verificar disponibilidad' }
    }
  }

  // Obtener disponibilidad detallada del profesor
  const obtenerDisponibilidadProfesor = async (fechaInicio, fechaFin, profesorId = null) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simular horarios del profesor
      const horarioBase = {
        lunes: [
          { inicio: "09:00", fin: "11:00", tipo: "docencia", descripcion: "Ingeniería de Software" },
          { inicio: "15:00", fin: "17:00", tipo: "tutorías", descripcion: "Tutorías" }
        ],
        martes: [
          { inicio: "10:00", fin: "12:00", tipo: "docencia", descripcion: "Bases de Datos" }
        ],
        miércoles: [
          { inicio: "09:00", fin: "11:00", tipo: "docencia", descripcion: "Ingeniería de Software" },
          { inicio: "16:00", fin: "18:00", tipo: "investigación", descripcion: "Investigación" }
        ],
        jueves: [
          { inicio: "10:00", fin: "12:00", tipo: "docencia", descripcion: "Bases de Datos" }
        ],
        viernes: [
          { inicio: "09:00", fin: "10:00", tipo: "reuniones", descripcion: "Reunión de departamento" }
        ]
      }
      
      // Eventos específicos (defensas, reuniones especiales, etc.)
      const eventosEspecificos = [
        {
          fecha: '2025-02-15',
          horaInicio: '10:00',
          horaFin: '11:00',
          evento: 'Defensa TFG - Juan Pérez',
          tipo: 'defensa',
          prioridad: 'alta'
        },
        {
          fecha: '2025-02-17',
          horaInicio: '14:00',
          horaFin: '15:30',
          evento: 'Reunión de coordinación',
          tipo: 'reunión',
          prioridad: 'media'
        }
      ]
      
      // Generar disponibilidad por días
      const disponibilidad = []
      const inicio = new Date(fechaInicio)
      const fin = new Date(fechaFin)
      
      for (let fecha = new Date(inicio); fecha <= fin; fecha.setDate(fecha.getDate() + 1)) {
        const diaSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][fecha.getDay()]
        const fechaStr = fecha.toISOString().split('T')[0]
        
        const horariosDelDia = horarioBase[diaSemana] || []
        const eventosDelDia = eventosEspecificos.filter(e => e.fecha === fechaStr)
        
        // Combinar horarios base y eventos específicos
        const ocupaciones = [
          ...horariosDelDia.map(h => ({
            ...h,
            fecha: fechaStr,
            prioridad: h.tipo === 'docencia' ? 'alta' : 'media'
          })),
          ...eventosDelDia
        ]
        
        disponibilidad.push({
          fecha: fechaStr,
          diaSemana,
          ocupaciones,
          horasLibres: calcularHorasLibres(ocupaciones),
          recomendaciones: generarRecomendaciones(ocupaciones, diaSemana)
        })
      }
      
      return { success: true, data: disponibilidad }
      
    } catch (err) {
      const errorMessage = 'Error al obtener disponibilidad del profesor'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Función auxiliar para calcular horas libres
  const calcularHorasLibres = (ocupaciones) => {
    const horariosOcupados = ocupaciones.map(o => ({
      inicio: o.horaInicio || o.inicio,
      fin: o.horaFin || o.fin
    }))
    
    // Horario laboral de 8:00 a 20:00
    const horasLibres = []
    let horaActual = 8
    
    horariosOcupados
      .sort((a, b) => a.inicio.localeCompare(b.inicio))
      .forEach(ocupacion => {
        const inicioOcupacion = parseInt(ocupacion.inicio.split(':')[0])
        const finOcupacion = parseInt(ocupacion.fin.split(':')[0])
        
        if (horaActual < inicioOcupacion) {
          horasLibres.push({
            inicio: `${horaActual.toString().padStart(2, '0')}:00`,
            fin: ocupacion.inicio,
            duracion: inicioOcupacion - horaActual
          })
        }
        
        horaActual = Math.max(horaActual, finOcupacion)
      })
    
    // Tiempo libre después de la última ocupación
    if (horaActual < 20) {
      horasLibres.push({
        inicio: `${horaActual.toString().padStart(2, '0')}:00`,
        fin: '20:00',
        duracion: 20 - horaActual
      })
    }
    
    return horasLibres
  }

  // Función auxiliar para generar recomendaciones
  const generarRecomendaciones = (ocupaciones, diaSemana) => {
    const recomendaciones = []
    
    // Mejores horarios por día de la semana
    const mejoresHorarios = {
      lunes: ['14:00', '16:00'],
      martes: ['14:00', '15:00', '16:00'],
      miércoles: ['12:00', '14:00'],
      jueves: ['14:00', '16:00'],
      viernes: ['11:00', '14:00', '16:00']
    }
    
    const horariosSugeridos = mejoresHorarios[diaSemana] || ['14:00', '16:00']
    
    horariosSugeridos.forEach(hora => {
      const tieneConflicto = ocupaciones.some(o => {
        const inicio = o.horaInicio || o.inicio
        const fin = o.horaFin || o.fin
        return hora >= inicio && hora < fin
      })
      
      if (!tieneConflicto) {
        recomendaciones.push({
          hora,
          calidad: 'alta',
          motivo: 'Horario sin conflictos académicos'
        })
      }
    })
    
    return recomendaciones
  }

  // Enviar notificaciones automáticas
  const enviarNotificacionDefensa = async (defensaId, tipo, destinatarios) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const tiposNotificacion = {
        programada: {
          asunto: 'Nueva defensa TFG programada',
          plantilla: 'defensa_programada'
        },
        modificada: {
          asunto: 'Cambios en defensa TFG',
          plantilla: 'defensa_modificada'
        },
        cancelada: {
          asunto: 'Defensa TFG cancelada',
          plantilla: 'defensa_cancelada'
        },
        recordatorio: {
          asunto: 'Recordatorio: Defensa TFG mañana',
          plantilla: 'recordatorio_defensa'
        }
      }
      
      const notificacion = tiposNotificacion[tipo]
      if (!notificacion) throw new Error('Tipo de notificación no válido')
      
      // Simular envío de emails
      console.log(`📧 Enviando ${notificacion.asunto} a:`, destinatarios)
      
      // Aquí iría la integración real con servicio de email
      
      return { 
        success: true, 
        message: `Notificaciones enviadas a ${destinatarios.length} destinatarios`,
        enviados: destinatarios.length
      }
      
    } catch (err) {
      return { success: false, error: err.message || 'Error al enviar notificaciones' }
    }
  }

  // Programar recordatorios automáticos
  const programarRecordatorios = async (defensaId, fechaDefensa) => {
    try {
      const fecha = new Date(fechaDefensa)
      const ahora = new Date()
      
      // Recordatorio 24 horas antes
      const recordatorio24h = new Date(fecha.getTime() - 24 * 60 * 60 * 1000)
      // Recordatorio 2 horas antes
      const recordatorio2h = new Date(fecha.getTime() - 2 * 60 * 60 * 1000)
      
      const recordatorios = []
      
      if (recordatorio24h > ahora) {
        recordatorios.push({
          fecha: recordatorio24h,
          tipo: 'recordatorio_24h',
          defensaId
        })
      }
      
      if (recordatorio2h > ahora) {
        recordatorios.push({
          fecha: recordatorio2h,
          tipo: 'recordatorio_2h',
          defensaId
        })
      }
      
      // En una implementación real, estos se guardarían en base de datos
      // y un cron job los procesaría
      
      return {
        success: true,
        recordatoriosProgramados: recordatorios.length,
        recordatorios
      }
      
    } catch (err) {
      return { success: false, error: 'Error al programar recordatorios' }
    }
  }

  // Resto de funciones existentes...
  const modificarDefensa = async (defensaId, cambios) => {
    setLoading(true)
    setError(null)
    
    try {
      // Si cambia fecha/hora, verificar conflictos
      if (cambios.fecha || cambios.hora) {
        const nuevaFecha = cambios.fecha ? 
          new Date(`${cambios.fecha}T${cambios.hora || '10:00'}`) :
          new Date(cambios.fechaCompleta)
          
        if (nuevaFecha <= new Date()) {
          throw new Error('La nueva fecha debe ser futura')
        }
        
        // Verificar conflictos
        const conflictosResult = await detectarConflictos(
          nuevaFecha, 
          cambios.duracion || 60, 
          cambios.tribunalId
        )
        
        if (conflictosResult.conflictos.some(c => c.gravedad === 'alta') && !cambios.forzar) {
          return {
            success: false,
            requiereConfirmacion: true,
            conflictos: conflictosResult.conflictos
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Enviar notificación de cambio
      await enviarNotificacionDefensa(defensaId, 'modificada', [])
      
      return { success: true, message: 'Defensa modificada correctamente' }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al modificar defensa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const cancelarDefensa = async (defensaId, motivo) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      if (!motivo || motivo.trim().length < 10) {
        throw new Error('Debe proporcionar un motivo de cancelación (mínimo 10 caracteres)')
      }

      // Enviar notificación de cancelación
      await enviarNotificacionDefensa(defensaId, 'cancelada', [])

      return { success: true, message: 'Defensa cancelada correctamente' }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al cancelar defensa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Funciones auxiliares existentes simplificadas...
  const obtenerAulasDisponibles = async (fecha, duracion = 60) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const aulas = [
        { id: 'aula-101', nombre: 'Aula 101', capacidad: 30, equipamiento: ['Proyector', 'Audio'] },
        { id: 'aula-102', nombre: 'Aula 102', capacidad: 25, equipamiento: ['Proyector'] },
        { id: 'aula-205', nombre: 'Aula 205', capacidad: 40, equipamiento: ['Proyector', 'Audio', 'Pizarra Digital'] },
        { id: 'aula-301', nombre: 'Aula 301', capacidad: 35, equipamiento: ['Proyector', 'Audio'] }
      ]
      
      return { success: true, data: aulas }
    } catch (err) {
      return { success: false, error: 'Error al obtener aulas' }
    } finally {
      setLoading(false)
    }
  }

  const obtenerTFGsListosParaDefensa = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const tfgs = [
        {
          id: 1,
          titulo: 'Sistema de Gestión de TFGs con React y Symfony',
          estudiante: 'Juan Pérez',
          tutor: 'Dr. Carlos López',
          fechaAprobacion: '2025-01-20',
          tribunalSugerido: 'Tribunal TFG - Desarrollo Web'
        }
      ]
      
      return { success: true, data: tfgs }
    } catch (err) {
      return { success: false, error: 'Error al obtener TFGs' }
    }
  }

  return {
    loading,
    error,
    // Funciones principales
    obtenerDefensas,
    programarDefensa,
    modificarDefensa,
    cancelarDefensa,
    // Gestión de disponibilidad
    detectarConflictos,
    obtenerDisponibilidadProfesor,
    verificarDisponibilidadAula,
    // Notificaciones
    enviarNotificacionDefensa,
    programarRecordatorios,
    // Utilidades
    obtenerAulasDisponibles,
    obtenerTFGsListosParaDefensa,
    clearError: () => setError(null)
  }
}