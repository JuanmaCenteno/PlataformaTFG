import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

function MisTFGs() {
  const location = useLocation()
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState('')

  // Mostrar mensaje de éxito si viene de subida
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message)
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 5000)
    }
  }, [location.state])

  // TFGs simulados del estudiante
  const [tfgs] = useState([
    {
      id: 1,
      titulo: "Sistema de Gestión de TFGs con React y Symfony",
      estado: "En revisión",
      fechaSubida: "2025-01-15",
      tutor: "Dr. María García",
      area: "Desarrollo Web",
      comentarios: 2,
      archivo: "tfg_juan_perez.pdf",
      calificacion: null
    },
    {
      id: 2,
      titulo: "Análisis de Algoritmos de Machine Learning",
      estado: "Borrador",
      fechaSubida: "2024-12-20",
      tutor: "Dr. Carlos López",
      area: "Inteligencia Artificial",
      comentarios: 0,
      archivo: "borrador_ml.pdf",
      calificacion: null
    }
  ])

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Aprobado': return 'bg-green-100 text-green-800 border-green-200'
      case 'En revisión': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Rechazado': return 'bg-red-100 text-red-800 border-red-200'
      case 'Borrador': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Defendido': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Aprobado': return '✅'
      case 'En revisión': return '⏳'
      case 'Rechazado': return '❌'
      case 'Borrador': return '📝'
      case 'Defendido': return '🎯'
      default: return '📄'
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Mensaje de éxito */}
      {showMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400 text-lg">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{message}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setShowMessage(false)}
                className="text-green-400 hover:text-green-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis TFGs</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus Trabajos de Fin de Grado
          </p>
        </div>
        <Link 
          to="/estudiante/subir-tfg"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>📎</span>
          <span>Subir Nuevo TFG</span>
        </Link>
      </div>

      {/* Lista de TFGs */}
      {tfgs.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes TFGs subidos
          </h3>
          <p className="text-gray-500 mb-6">
            Sube tu primer Trabajo de Fin de Grado para comenzar el proceso de revisión
          </p>
          <Link 
            to="/estudiante/subir-tfg"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Subir mi primer TFG
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {tfgs.map((tfg) => (
            <div key={tfg.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {tfg.titulo}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getEstadoColor(tfg.estado)}`}>
                        <span className="mr-1">{getEstadoIcon(tfg.estado)}</span>
                        {tfg.estado}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Tutor:</span> {tfg.tutor}
                      </div>
                      <div>
                        <span className="font-medium">Área:</span> {tfg.area}
                      </div>
                      <div>
                        <span className="font-medium">Subido:</span> {new Date(tfg.fechaSubida).toLocaleDateString('es-ES')}
                      </div>
                    </div>

                    {/* Información adicional según estado */}
                    {tfg.comentarios > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                        <div className="flex items-center">
                          <span className="text-blue-400 mr-2">💬</span>
                          <p className="text-sm text-blue-800">
                            Tienes <strong>{tfg.comentarios} comentarios nuevos</strong> de tu tutor
                          </p>
                        </div>
                      </div>
                    )}

                    {tfg.calificacion && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                        <div className="flex items-center">
                          <span className="text-green-400 mr-2">🏆</span>
                          <p className="text-sm text-green-800">
                            <strong>Calificación:</strong> {tfg.calificacion}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col space-y-2 ml-6">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                      Ver Detalles
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200">
                      Descargar PDF
                    </button>
                    {tfg.estado === 'Borrador' && (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                        Editar
                      </button>
                    )}
                    {tfg.comentarios > 0 && (
                      <button className="bg-orange-100 text-orange-700 px-4 py-2 rounded-md text-sm hover:bg-orange-200">
                        Ver Comentarios
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar para TFGs en proceso */}
              {tfg.estado !== 'Borrador' && tfg.estado !== 'Defendido' && (
                <div className="px-6 pb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progreso del TFG</span>
                    <span>
                      {tfg.estado === 'En revisión' ? '60%' : 
                       tfg.estado === 'Aprobado' ? '90%' : '30%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        tfg.estado === 'En revisión' ? 'bg-yellow-500' :
                        tfg.estado === 'Aprobado' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: tfg.estado === 'En revisión' ? '60%' : 
                               tfg.estado === 'Aprobado' ? '90%' : '30%'
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Subido</span>
                    <span>En revisión</span>
                    <span>Aprobado</span>
                    <span>Defensa</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resumen estadístico */}
      {tfgs.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tfgs.length}
            </div>
            <div className="text-sm text-gray-500">TFGs Totales</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {tfgs.filter(t => t.estado === 'En revisión').length}
            </div>
            <div className="text-sm text-gray-500">En Revisión</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {tfgs.filter(t => t.estado === 'Aprobado').length}
            </div>
            <div className="text-sm text-gray-500">Aprobados</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {tfgs.filter(t => t.estado === 'Borrador').length}
            </div>
            <div className="text-sm text-gray-500">Borradores</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MisTFGs