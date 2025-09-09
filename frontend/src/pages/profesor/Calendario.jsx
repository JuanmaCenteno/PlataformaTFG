import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import esLocale from '@fullcalendar/core/locales/es'
import { useCalendario } from '../../hooks/useCalendario'
import { useNotificaciones } from '../../context/NotificacionesContext'
import { AlertaConflicto, DisponibilidadAulas } from '../../components/calendario/EventoDefensa'

function Calendario() {
  const { mostrarNotificacion } = useNotificaciones()
  const {
    loading,
    error,
    obtenerDefensas,
    programarDefensa,
    modificarDefensa,
    detectarConflictos,
    verificarDisponibilidadAula,
    obtenerDisponibilidadProfesor,
    enviarNotificacionDefensa,
    obtenerAulasDisponibles,
    obtenerTFGsListosParaDefensa,
    clearError
  } = useCalendario()

  const [defensas, setDefensas] = useState([])
  const [loadingLocal, setLoadingLocal] = useState(false)
  const [loadingModal, setLoadingModal] = useState(false)
  const [modalActivo, setModalActivo] = useState(null)
  const [conflictosDetectados, setConflictosDetectados] = useState([])
  const [mostrarAlertaConflictos, setMostrarAlertaConflictos] = useState(false)
  const [datosDefensaTemporal, setDatosDefensaTemporal] = useState(null)
  const [disponibilidadAulas, setDisponibilidadAulas] = useState([])
  const [tfgsDisponibles, setTfgsDisponibles] = useState([])
  const [filtros, setFiltros] = useState({
    miRol: 'todos', // todos, presidente, vocal
    estado: 'todos', // todos, programado, completado
    periodo: 'todos' // proximo, pasado, todos - CAMBIADO A 'todos' para mostrar todas las defensas
  })
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null)
  const [formDefensa, setFormDefensa] = useState({
    tfgId: '',
    fecha: '',
    hora: '',
    duracion: '60',
    aula: '',
    tribunal: '',
    observaciones: ''
  })
  const calendarRef = useRef(null)

  // Función para cargar defensas
  const cargarDefensas = async () => {
      setLoadingLocal(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const defensasData = [
        {
          id: 1,
          titulo: "Sistema de Gestión de TFGs con React y Symfony",
          estudiante: {
            nombre: "Juan Pérez",
            email: "juan.perez@estudiante.edu"
          },
          fecha: "2025-02-15T10:00:00Z",
          duracion: 60, // minutos
          aula: "Aula 301",
          estado: "Programado",
          tribunal: {
            id: 1,
            nombre: "Tribunal TFG - Desarrollo Web",
            presidente: "Dr. María García",
            vocales: ["Dr. Carlos López", "Dra. Ana Martín"]
          },
          miRol: "Presidente",
          tutor: "Dr. Carlos López",
          tipo: "TFG",
          observaciones: "",
          documentos: [
            { nombre: "TFG_Juan_Perez_Final.pdf", tipo: "documento" },
            { nombre: "Presentacion_Defensa.pptx", tipo: "presentacion" }
          ]
        },
        {
          id: 2,
          titulo: "Aplicación Móvil para Gestión de Entregas",
          estudiante: {
            nombre: "María Silva",
            email: "maria.silva@estudiante.edu"
          },
          fecha: "2025-02-17T12:00:00Z",
          duracion: 60,
          aula: "Aula 205",
          estado: "Programado",
          tribunal: {
            id: 2,
            nombre: "Tribunal TFG - Desarrollo Móvil",
            presidente: "Dr. Pedro Ruiz",
            vocales: ["Dr. María García", "Dra. Isabel Moreno"]
          },
          miRol: "Vocal",
          tutor: "Dra. Ana Martín",
          tipo: "TFG",
          observaciones: "",
          documentos: [
            { nombre: "TFG_Maria_Silva_Final.pdf", tipo: "documento" }
          ]
        },
        {
          id: 3,
          titulo: "Sistema de Recomendación basado en IA",
          estudiante: {
            nombre: "Carlos Ruiz",
            email: "carlos.ruiz@estudiante.edu"
          },
          fecha: "2025-02-20T09:00:00Z",
          duracion: 60,
          aula: "Aula 102",
          estado: "Programado",
          tribunal: {
            id: 3,
            nombre: "Tribunal TFG - Inteligencia Artificial",
            presidente: "Dr. María García",
            vocales: ["Dr. Luis Fernández", "Dr. Roberto Silva"]
          },
          miRol: "Presidente",
          tutor: "Dr. Pedro Ruiz",
          tipo: "TFG",
          observaciones: "Revisión adicional de algoritmos solicitada",
          documentos: [
            { nombre: "TFG_Carlos_Ruiz_Final.pdf", tipo: "documento" },
            { nombre: "Codigo_Fuente.zip", tipo: "codigo" }
          ]
        },
        {
          id: 4,
          titulo: "Blockchain aplicado a Contratos Inteligentes",
          estudiante: {
            nombre: "Ana López",
            email: "ana.lopez@estudiante.edu"
          },
          fecha: "2025-01-20T11:00:00Z",
          duracion: 60,
          aula: "Aula 301",
          estado: "Completado",
          tribunal: {
            id: 4,
            nombre: "Tribunal TFG - Blockchain",
            presidente: "Dr. María García",
            vocales: ["Dr. Carlos López", "Dra. Isabel Moreno"]
          },
          miRol: "Presidente",
          tutor: "Dr. Luis Fernández",
          tipo: "TFG",
          observaciones: "Defensa exitosa. Calificación: 9.0",
          calificacion: 9.0,
          documentos: [
            { nombre: "TFG_Ana_Lopez_Final.pdf", tipo: "documento" },
            { nombre: "Acta_Defensa.pdf", tipo: "acta" }
          ]
        }
      ]
      
      setDefensas(defensasData)
      setLoadingLocal(false)
    }

  // Cargar defensas al montar el componente
  useEffect(() => {
    cargarDefensas()
  }, [])

  // Filtrar defensas
  const defensasFiltradas = defensas.filter(defensa => {
    const fechaDefensa = new Date(defensa.fecha)
    const ahora = new Date()
    
    // Filtro por rol
    if (filtros.miRol !== 'todos' && defensa.miRol.toLowerCase() !== filtros.miRol) {
      return false
    }
    
    // Filtro por estado
    if (filtros.estado !== 'todos' && defensa.estado.toLowerCase() !== filtros.estado.toLowerCase()) {
      return false
    }
    
    // Filtro por periodo
    if (filtros.periodo === 'proximo' && fechaDefensa <= ahora) {
      return false
    }
    if (filtros.periodo === 'pasado' && fechaDefensa > ahora) {
      return false
    }
    
    return true
  })

  // Colores según el estado
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'Programado': return '#10b981' // green-500
      case 'En curso': return '#f59e0b' // yellow-500
      case 'Completado': return '#6b7280' // gray-500
      case 'Cancelado': return '#ef4444' // red-500
      default: return '#3b82f6' // blue-500
    }
  }

  // Colores según el rol (para el borde)
  const obtenerColorRol = (rol) => {
    switch (rol) {
      case 'Presidente': return '#1d4ed8' // blue-700
      case 'Vocal': return '#7c3aed' // purple-600
      default: return '#374151' // gray-700
    }
  }

  // Convertir defensas a eventos de FullCalendar
  const eventos = defensasFiltradas.map(defensa => {
    const fechaInicio = new Date(defensa.fecha)
    const fechaFin = new Date(fechaInicio.getTime() + defensa.duracion * 60000)
    
    return {
      id: defensa.id.toString(),
      title: `${defensa.estudiante.nombre} - ${defensa.aula}`,
      start: fechaInicio.toISOString(),
      end: fechaFin.toISOString(),
      backgroundColor: obtenerColorEstado(defensa.estado),
      borderColor: obtenerColorRol(defensa.miRol),
      textColor: '#ffffff',
      extendedProps: {
        defensa: defensa,
        estudiante: defensa.estudiante.nombre,
        aula: defensa.aula,
        estado: defensa.estado,
        miRol: defensa.miRol,
        tribunal: defensa.tribunal.nombre,
        observaciones: defensa.observaciones
      }
    }
  })

  // Manejar clic en evento
  const handleEventClick = (clickInfo) => {
    const defensa = clickInfo.event.extendedProps.defensa
    setEventoSeleccionado(defensa)
    setModalActivo({ tipo: 'detalle', defensa })
  }

  // Función para resolver conflictos
  const resolverConflicto = async (accion) => {
    if (accion === 'cambiar-hora') {
      const sugerencias = conflictosDetectados[0]?.recomendaciones || [
        { hora: '14:00', disponibilidad: 'alta' },
        { hora: '16:00', disponibilidad: 'media' }
      ]
      
      const mensaje = `Horarios sugeridos:\n${sugerencias.map(s => `• ${s.hora} (${s.disponibilidad} disponibilidad)`).join('\n')}`
      mostrarNotificacion(mensaje, 'info')
      
    } else if (accion === 'ignorar') {
      // Forzar el cambio ignorando conflictos
      if (datosDefensaTemporal.defensaId) {
        const resultado = await modificarDefensa(datosDefensaTemporal.defensaId, {
          fechaCompleta: datosDefensaTemporal.nuevaFecha,
          forzar: true
        })
        
        if (resultado.success) {
          mostrarNotificacion('Defensa reprogramada (conflictos ignorados)', 'warning')
          cargarDefensas()
          // Enviar notificación automática
          await enviarNotificacionDefensa(datosDefensaTemporal.defensaId, 'modificada', [])
        } else {
          mostrarNotificacion(resultado.error, 'error')
          if (datosDefensaTemporal.revertir) {
            datosDefensaTemporal.revertir()
          }
        }
      }
    }
    
    // Limpiar estado
    setMostrarAlertaConflictos(false)
    setConflictosDetectados([])
    setDatosDefensaTemporal(null)
  }

  // Manejar drag & drop de eventos con detección de conflictos
  const handleEventDrop = async (dropInfo) => {
    const defensa = dropInfo.event.extendedProps.defensa
    const nuevaFecha = dropInfo.event.start
    
    // 1. Detectar conflictos antes de confirmar
    const resultadoConflictos = await detectarConflictos(
      nuevaFecha.toISOString(),
      defensa.duracion || 60,
      defensa.tribunal.id,
      defensa.id
    )

    if (!resultadoConflictos.success) {
      dropInfo.revert()
      mostrarNotificacion('Error al verificar conflictos', 'error')
      return
    }

    const conflictosGraves = resultadoConflictos.conflictos.filter(c => c.gravedad === 'alta')

    // 2. Si hay conflictos graves, mostrar alerta
    if (conflictosGraves.length > 0) {
      setConflictosDetectados(resultadoConflictos.conflictos)
      setDatosDefensaTemporal({ 
        defensaId: defensa.id, 
        nuevaFecha: nuevaFecha.toISOString(),
        revertir: dropInfo.revert 
      })
      setMostrarAlertaConflictos(true)
      dropInfo.revert() // Revertir temporalmente
      return
    }

    // 3. Si no hay conflictos graves, mostrar confirmación normal
    setModalActivo({
      tipo: 'confirmar-movimiento',
      defensa,
      nuevaFecha,
      conflictos: resultadoConflictos.conflictos,
      revertir: dropInfo.revert
    })
  }

  // Manejar redimensionado de eventos
  const handleEventResize = (resizeInfo) => {
    const defensa = resizeInfo.event.extendedProps.defensa
    const nuevaDuracion = Math.round((resizeInfo.event.end - resizeInfo.event.start) / (1000 * 60))
    
    console.log(`Cambiando duración de defensa ${defensa.id} a ${nuevaDuracion} minutos`)
    
    setModalActivo({
      tipo: 'confirmar-redimension',
      defensa,
      nuevaDuracion,
      revertir: resizeInfo.revert
    })
  }

  // Manejar clic en fecha vacía
  const handleDateClick = (dateInfo) => {
    setModalActivo({
      tipo: 'programar',
      fechaSugerida: dateInfo.dateStr,
      horaSugerida: dateInfo.date.getHours() + ':' + String(dateInfo.date.getMinutes()).padStart(2, '0')
    })
  }

  // Estadísticas
  const estadisticas = {
    total: defensas.length,
    programadas: defensas.filter(d => d.estado === 'Programado').length,
    completadas: defensas.filter(d => d.estado === 'Completado').length,
    comoPresidente: defensas.filter(d => d.miRol === 'Presidente').length,
    proximaSemana: defensas.filter(d => {
      const fecha = new Date(d.fecha)
      const ahora = new Date()
      const proximaSemana = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000)
      return fecha >= ahora && fecha <= proximaSemana && d.estado === 'Programado'
    }).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendario de Defensas</h1>
            <p className="text-gray-600 mt-2">
              Gestiona y programa las defensas de TFGs - Arrastra para mover eventos
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => calendarRef.current?.getApi().today()}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Hoy
            </button>
            <button
              onClick={() => {
                // Resetear formulario al abrir el modal
                setFormDefensa({
                  tfgId: '',
                  fecha: '',
                  hora: '10:00',
                  duracion: '60',
                  aula: '',
                  tribunal: '',
                  observaciones: ''
                })
                setModalActivo({ tipo: 'programar' })
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Programar Defensa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
            <div className="text-sm text-gray-500">Total Defensas</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{estadisticas.programadas}</div>
            <div className="text-sm text-gray-500">Programadas</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{estadisticas.completadas}</div>
            <div className="text-sm text-gray-500">Completadas</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{estadisticas.comoPresidente}</div>
            <div className="text-sm text-gray-500">Como Presidente</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{estadisticas.proximaSemana}</div>
            <div className="text-sm text-gray-500">Próxima Semana</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mi Rol</label>
            <select
              value={filtros.miRol}
              onChange={(e) => setFiltros(prev => ({ ...prev, miRol: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los roles</option>
              <option value="presidente">Como Presidente</option>
              <option value="vocal">Como Vocal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="programado">Programadas</option>
              <option value="completado">Completadas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros(prev => ({ ...prev, periodo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los periodos</option>
              <option value="proximo">Próximas</option>
              <option value="pasado">Pasadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="bg-white shadow rounded-lg p-4 mb-8">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Leyenda</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Programado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">En curso</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-sm text-gray-600">Completado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-4 border-blue-700 bg-transparent rounded"></div>
            <span className="text-sm text-gray-600">Como Presidente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-4 border-purple-600 bg-transparent rounded"></div>
            <span className="text-sm text-gray-600">Como Vocal</span>
          </div>
        </div>
      </div>

      {/* Alerta de conflictos */}
      {mostrarAlertaConflictos && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <AlertaConflicto 
                conflictos={conflictosDetectados.map(c => ({
                  evento: c.descripcion,
                  horaInicio: c.sugerencia || 'N/A',
                  horaFin: 'N/A'
                }))}
                onResolve={resolverConflicto}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setMostrarAlertaConflictos(false)
                    if (datosDefensaTemporal?.revertir) {
                      datosDefensaTemporal.revertir()
                    }
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FullCalendar */}
      <div className="bg-white shadow rounded-lg p-6">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={eventos}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          dateClick={handleDateClick}
          editable={true}
          droppable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          eventDidMount={(info) => {
            // Tooltip personalizado
            info.el.title = `${info.event.extendedProps.estudiante}\n${info.event.extendedProps.aula}\nTribunal: ${info.event.extendedProps.tribunal}\nEstado: ${info.event.extendedProps.estado}`
          }}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5], // Lunes a viernes
            startTime: '08:00',
            endTime: '18:00'
          }}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          slotDuration="00:30:00"
          nowIndicator={true}
        />
      </div>

      {/* Modal de detalle de defensa */}
      {modalActivo?.tipo === 'detalle' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalle de la Defensa
                </h3>
                <button
                  onClick={() => setModalActivo(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Información General</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-gray-500">Título del TFG</dt>
                      <dd className="text-gray-900">{modalActivo.defensa.titulo}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Estudiante</dt>
                      <dd className="text-gray-900">{modalActivo.defensa.estudiante.nombre}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Email</dt>
                      <dd className="text-gray-900">{modalActivo.defensa.estudiante.email}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Tutor</dt>
                      <dd className="text-gray-900">{modalActivo.defensa.tutor}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Detalles de la Defensa</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-gray-500">Fecha y hora</dt>
                      <dd className="text-gray-900">
                        {new Date(modalActivo.defensa.fecha).toLocaleDateString('es-ES')} - {' '}
                        {new Date(modalActivo.defensa.fecha).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Duración</dt>
                      <dd className="text-gray-900">{modalActivo.defensa.duracion} minutos</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Aula</dt>
                      <dd className="text-gray-900">{modalActivo.defensa.aula}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Estado</dt>
                      <dd className="text-gray-900">{modalActivo.defensa.estado}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Mi rol</dt>
                      <dd className="text-gray-900">{modalActivo.defensa.miRol}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Tribunal</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm"><strong>Nombre:</strong> {modalActivo.defensa.tribunal.nombre}</p>
                  <p className="text-sm mt-2"><strong>Presidente:</strong> {modalActivo.defensa.tribunal.presidente}</p>
                  <p className="text-sm mt-1"><strong>Vocales:</strong> {modalActivo.defensa.tribunal.vocales.join(', ')}</p>
                </div>
              </div>

              {modalActivo.defensa.documentos.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Documentos</h4>
                  <div className="space-y-2">
                    {modalActivo.defensa.documentos.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {doc.tipo === 'documento' ? '📄' : 
                             doc.tipo === 'presentacion' ? '📊' : 
                             doc.tipo === 'codigo' ? '💻' : '📋'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{doc.nombre}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Descargar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalActivo.defensa.observaciones && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Observaciones</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">{modalActivo.defensa.observaciones}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setModalActivo(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cerrar
                </button>
                {modalActivo.defensa.estado === 'Programado' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Ir al Tribunal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar movimiento */}
      {modalActivo?.tipo === 'confirmar-movimiento' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirmar Cambio de Fecha
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Deseas mover la defensa de <strong>{modalActivo.defensa.estudiante.nombre}</strong> al{' '}
                <strong>{modalActivo.nuevaFecha.toLocaleDateString('es-ES')}</strong> a las{' '}
                <strong>{modalActivo.nuevaFecha.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</strong>?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    modalActivo.revertir()
                    setModalActivo(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    const resultado = await modificarDefensa(modalActivo.defensa.id, {
                      fechaCompleta: modalActivo.nuevaFecha.toISOString()
                    })
                    
                    if (resultado.success) {
                      mostrarNotificacion('Defensa reprogramada correctamente', 'success')
                      // Recargar datos simulados (en una app real sería cargarDefensas())
                      
                      // Enviar notificación automática
                      await enviarNotificacionDefensa(modalActivo.defensa.id, 'modificada', [
                        modalActivo.defensa.estudiante.email
                      ])
                    } else {
                      mostrarNotificacion(resultado.error, 'error')
                      modalActivo.revertir()
                    }
                    setModalActivo(null)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar redimensionado */}
      {modalActivo?.tipo === 'confirmar-redimension' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirmar Cambio de Duración
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Deseas cambiar la duración de la defensa de <strong>{modalActivo.defensa.estudiante.nombre}</strong> a{' '}
                <strong>{modalActivo.nuevaDuracion} minutos</strong>?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    modalActivo.revertir()
                    setModalActivo(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Aquí iría la lógica para confirmar el cambio
                    console.log('Confirmando cambio de duración')
                    setModalActivo(null)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para programar defensa */}
      {modalActivo?.tipo === 'programar' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" style={{ zIndex: 9999 }}>
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Programar Nueva Defensa
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TFG a Defender
                  </label>
                  <select 
                    value={formDefensa.tfgId}
                    onChange={(e) => setFormDefensa(prev => ({ ...prev, tfgId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar TFG...</option>
                    <option value="1">Sistema de Gestión de TFGs - Juan Pérez</option>
                    <option value="2">App Móvil de Entregas - María Silva</option>
                    <option value="3">IA para Diagnóstico - Carlos Ruiz</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Defensa
                    </label>
                    <input
                      type="date"
                      value={formDefensa.fecha}
                      onChange={(e) => setFormDefensa(prev => ({ ...prev, fecha: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={formDefensa.hora}
                      onChange={(e) => setFormDefensa(prev => ({ ...prev, hora: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (minutos)
                    </label>
                    <select 
                      value={formDefensa.duracion}
                      onChange={(e) => setFormDefensa(prev => ({ ...prev, duracion: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="45">45 minutos</option>
                      <option value="60">60 minutos</option>
                      <option value="90">90 minutos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aula
                    </label>
                    <select 
                      value={formDefensa.aula}
                      onChange={(e) => setFormDefensa(prev => ({ ...prev, aula: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar aula...</option>
                      <option value="Aula 101">Aula 101</option>
                      <option value="Aula 102">Aula 102</option>
                      <option value="Aula 205">Aula 205</option>
                      <option value="Aula 301">Aula 301</option>
                      <option value="Salón de Actos">Salón de Actos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tribunal Asignado
                  </label>
                  <select 
                    value={formDefensa.tribunal}
                    onChange={(e) => setFormDefensa(prev => ({ ...prev, tribunal: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar tribunal...</option>
                    <option value="1">Tribunal TFG - Desarrollo Web</option>
                    <option value="2">Tribunal TFG - Inteligencia Artificial</option>
                    <option value="3">Tribunal TFG - Desarrollo Móvil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={formDefensa.observaciones}
                    onChange={(e) => setFormDefensa(prev => ({ ...prev, observaciones: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Notas adicionales sobre la defensa..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🤖 Sistema Automatizado</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Detección automática de conflictos de horario</li>
                    <li>✅ Verificación automática de disponibilidad de aulas</li>
                    <li>✅ Notificaciones automáticas por email</li>
                    <li>✅ Recordatorios 24h y 2h antes de la defensa</li>
                    <li>• Puedes arrastrar eventos para reprogramar fácilmente</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setModalActivo(null)
                    // Resetear formulario al cancelar
                    setFormDefensa({
                      tfgId: '',
                      fecha: '',
                      hora: '10:00',
                      duracion: '60',
                      aula: '',
                      tribunal: '',
                      observaciones: ''
                    })
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    try {
                      // Validar campos requeridos
                      if (!formDefensa.tfgId || !formDefensa.fecha || !formDefensa.hora || !formDefensa.aula) {
                        mostrarNotificacion('Por favor, completa todos los campos requeridos', 'error')
                        return
                      }

                      setLoadingModal(true)
                      
                      // Crear nueva defensa con los datos del formulario
                      const nuevaDefensa = {
                        id: Date.now(), // ID temporal
                        titulo: formDefensa.tfgId === '1' ? "Sistema de Gestión de TFGs con React y Symfony" :
                               formDefensa.tfgId === '2' ? "App Móvil de Entregas" :
                               formDefensa.tfgId === '3' ? "IA para Diagnóstico" : "TFG Nuevo",
                        estudiante: {
                          nombre: formDefensa.tfgId === '1' ? "Juan Pérez" :
                                 formDefensa.tfgId === '2' ? "María Silva" :
                                 formDefensa.tfgId === '3' ? "Carlos Ruiz" : "Estudiante",
                          email: `estudiante${formDefensa.tfgId}@uni.es`
                        },
                        fecha: `${formDefensa.fecha}T${formDefensa.hora}:00Z`,
                        duracion: parseInt(formDefensa.duracion),
                        aula: formDefensa.aula,
                        estado: "Programado",
                        tribunal: {
                          id: parseInt(formDefensa.tribunal) || 1,
                          nombre: formDefensa.tribunal === '1' ? "Tribunal TFG - Desarrollo Web" :
                                 formDefensa.tribunal === '2' ? "Tribunal TFG - Inteligencia Artificial" :
                                 formDefensa.tribunal === '3' ? "Tribunal TFG - Desarrollo Móvil" : "Tribunal TFG",
                          presidente: "Dr. María García",
                          vocales: ["Dr. Carlos López", "Dra. Ana Martín"]
                        },
                        miRol: "Presidente",
                        tutor: "Dr. Carlos López",
                        tipo: "TFG",
                        observaciones: formDefensa.observaciones,
                        documentos: []
                      }
                      
                      // Simular delay de API
                      await new Promise(resolve => setTimeout(resolve, 1000))
                      
                      // Agregar la nueva defensa al estado actual
                      setDefensas(prev => [...prev, nuevaDefensa])
                      
                      mostrarNotificacion('Defensa programada correctamente', 'success')
                      
                      // Resetear formulario
                      setFormDefensa({
                        tfgId: '',
                        fecha: '',
                        hora: '',
                        duracion: '60',
                        aula: '',
                        tribunal: '',
                        observaciones: ''
                      })
                      
                      setModalActivo(null)
                    } catch (error) {
                      console.error('Error al programar defensa:', error)
                      mostrarNotificacion('Error al programar la defensa', 'error')
                    } finally {
                      setLoadingModal(false)
                    }
                  }}
                  disabled={loadingModal}
                  className={`px-4 py-2 rounded-md ${
                    loadingModal 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {loadingModal ? 'Programando...' : 'Programar Defensa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendario