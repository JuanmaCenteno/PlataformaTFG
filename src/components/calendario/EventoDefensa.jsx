import { useState } from 'react'

function EventoDefensa({ evento, onEdit, onDelete, onDuplicate }) {
  const [mostrarOpciones, setMostrarOpciones] = useState(false)
  
  const defensa = evento.extendedProps.defensa
  
  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'Programado': return '📅'
      case 'En curso': return '🔄'
      case 'Completado': return '✅'
      case 'Cancelado': return '❌'
      default: return '📋'
    }
  }

  const obtenerIconoRol = (rol) => {
    return rol === 'Presidente' ? '👑' : '👤'
  }

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="relative group">
      {/* Contenido principal del evento */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <span className="text-xs">{obtenerIconoEstado(defensa.estado)}</span>
          <span className="text-xs">{obtenerIconoRol(defensa.miRol)}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate text-white">
              {defensa.estudiante.nombre}
            </div>
            <div className="text-xs text-white opacity-90 truncate">
              {defensa.aula}
            </div>
          </div>
        </div>
        
        {/* Botón de opciones (visible en hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMostrarOpciones(!mostrarOpciones)
            }}
            className="text-white hover:text-gray-200 text-xs px-1"
          >
            ⋯
          </button>
        </div>
      </div>

      {/* Dropdown de opciones */}
      {mostrarOpciones && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(defensa)
                setMostrarOpciones(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              ✏️ Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate(defensa)
                setMostrarOpciones(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              📋 Duplicar
            </button>
            {defensa.estado === 'Programado' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Lógica para marcar como en curso
                  setMostrarOpciones(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                ▶️ Iniciar
              </button>
            )}
            <hr className="my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(defensa)
                setMostrarOpciones(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar el dropdown al hacer clic fuera */}
      {mostrarOpciones && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMostrarOpciones(false)}
        />
      )}
    </div>
  )
}

// Componente para tooltip personalizado
function TooltipDefensa({ defensa, position }) {
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div 
      className="absolute z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px'
      }}
    >
      {/* Flecha del tooltip */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{defensa.titulo}</h4>
          <p className="text-sm text-gray-600">Estudiante: {defensa.estudiante.nombre}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="font-medium text-gray-500">Fecha:</span>
            <p className="text-gray-900">{formatearFecha(defensa.fecha)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Hora:</span>
            <p className="text-gray-900">{formatearHora(defensa.fecha)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Duración:</span>
            <p className="text-gray-900">{defensa.duracion} min</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Aula:</span>
            <p className="text-gray-900">{defensa.aula}</p>
          </div>
        </div>

        <div>
          <span className="font-medium text-gray-500 text-xs">Tribunal:</span>
          <p className="text-sm text-gray-900">{defensa.tribunal.nombre}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
              defensa.miRol === 'Presidente' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {defensa.miRol === 'Presidente' ? '👑' : '👤'} {defensa.miRol}
            </span>
            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
              defensa.estado === 'Programado' ? 'bg-green-100 text-green-800' :
              defensa.estado === 'Completado' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {defensa.estado}
            </span>
          </div>
        </div>

        {defensa.observaciones && (
          <div>
            <span className="font-medium text-gray-500 text-xs">Observaciones:</span>
            <p className="text-sm text-gray-700 mt-1">{defensa.observaciones}</p>
          </div>
        )}

        {defensa.calificacion && (
          <div className="bg-green-50 border border-green-200 rounded-md p-2">
            <span className="font-medium text-green-800 text-xs">Calificación Final:</span>
            <p className="text-sm font-bold text-green-900">{defensa.calificacion}/10</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook personalizado para gestionar tooltips
export function useTooltipDefensa() {
  const [tooltip, setTooltip] = useState(null)

  const mostrarTooltip = (defensa, posicion) => {
    setTooltip({ defensa, posicion })
  }

  const ocultarTooltip = () => {
    setTooltip(null)
  }

  const TooltipComponent = tooltip ? (
    <TooltipDefensa 
      defensa={tooltip.defensa} 
      position={tooltip.posicion} 
    />
  ) : null

  return {
    mostrarTooltip,
    ocultarTooltip,
    TooltipComponent
  }
}

// Componente para mostrar conflictos de horario
function AlertaConflicto({ conflictos, onResolve }) {
  if (!conflictos || conflictos.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-red-400 text-lg">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Conflicto de Horario Detectado
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {conflictos.map((conflicto, index) => (
              <div key={index} className="mb-1">
                • <strong>{conflicto.evento}</strong> - {conflicto.horaInicio} a {conflicto.horaFin}
              </div>
            ))}
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => onResolve('cambiar-hora')}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Sugerir Nueva Hora
            </button>
            <button
              onClick={() => onResolve('ignorar')}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            >
              Programar de Todas Formas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para mostrar disponibilidad de aulas
function DisponibilidadAulas({ fecha, hora, duracion, onAulaSelect }) {
  const [aulas, setAulas] = useState([])
  const [cargando, setCargando] = useState(false)

  const verificarDisponibilidad = async () => {
    setCargando(true)
    
    // Simular verificación de disponibilidad
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const aulasDisponibles = [
      { 
        id: 'aula-101', 
        nombre: 'Aula 101', 
        capacidad: 30, 
        equipamiento: ['Proyector', 'Audio'],
        disponible: true,
        proximoEvento: null
      },
      { 
        id: 'aula-102', 
        nombre: 'Aula 102', 
        capacidad: 25, 
        equipamiento: ['Proyector'],
        disponible: false,
        proximoEvento: { evento: 'Clase de Programación', hora: '14:00' }
      },
      { 
        id: 'aula-205', 
        nombre: 'Aula 205', 
        capacidad: 40, 
        equipamiento: ['Proyector', 'Audio', 'Pizarra Digital'],
        disponible: true,
        proximoEvento: { evento: 'Defensa TFG', hora: '16:00' }
      },
      { 
        id: 'aula-301', 
        nombre: 'Aula 301', 
        capacidad: 35, 
        equipamiento: ['Proyector', 'Audio'],
        disponible: true,
        proximoEvento: null
      }
    ]
    
    setAulas(aulasDisponibles)
    setCargando(false)
  }

  // Verificar disponibilidad cuando cambien los parámetros
  React.useEffect(() => {
    if (fecha && hora && duracion) {
      verificarDisponibilidad()
    }
  }, [fecha, hora, duracion])

  if (cargando) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Verificando disponibilidad...</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Aulas Disponibles</h4>
      <div className="grid grid-cols-1 gap-3">
        {aulas.map((aula) => (
          <div
            key={aula.id}
            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
              aula.disponible
                ? 'border-green-200 bg-green-50 hover:bg-green-100'
                : 'border-red-200 bg-red-50 opacity-75 cursor-not-allowed'
            }`}
            onClick={() => aula.disponible && onAulaSelect(aula)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-medium text-gray-900 flex items-center">
                  {aula.nombre}
                  {aula.disponible ? (
                    <span className="ml-2 text-green-600">✅</span>
                  ) : (
                    <span className="ml-2 text-red-600">❌</span>
                  )}
                </h5>
                <p className="text-sm text-gray-600">
                  Capacidad: {aula.capacidad} personas
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {aula.equipamiento.map((equipo, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {equipo}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-right">
                {aula.disponible ? (
                  <span className="text-sm font-medium text-green-600">Disponible</span>
                ) : (
                  <span className="text-sm font-medium text-red-600">Ocupada</span>
                )}
                {aula.proximoEvento && (
                  <p className="text-xs text-gray-500 mt-1">
                    Próximo: {aula.proximoEvento.evento} a las {aula.proximoEvento.hora}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente para vista previa del evento mientras se arrastra
function VistaPreviewEvento({ evento, nuevaFecha }) {
  return (
    <div className="bg-blue-600 text-white p-2 rounded shadow-lg border-2 border-blue-700">
      <div className="text-xs font-medium">
        {evento.extendedProps.estudiante}
      </div>
      <div className="text-xs opacity-90">
        {evento.extendedProps.aula}
      </div>
      <div className="text-xs opacity-75 mt-1">
        Moviendo a: {nuevaFecha.toLocaleDateString('es-ES')}
      </div>
    </div>
  )
}

export default EventoDefensa
export { TooltipDefensa, AlertaConflicto, DisponibilidadAulas, VistaPreviewEvento }