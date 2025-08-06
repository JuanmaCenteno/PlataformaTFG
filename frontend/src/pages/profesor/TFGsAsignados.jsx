import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function TFGsAsignados() {
  const [tfgs, setTfgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos') // todos, revision, aprobados, rechazados
  const [modalActivo, setModalActivo] = useState(null)
  const [comentarioModal, setComentarioModal] = useState('')
  const [calificacionModal, setCalificacionModal] = useState('')

  // Simular carga de TFGs asignados
  useEffect(() => {
    const cargarTFGs = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const tfgsData = [
        {
          id: 1,
          titulo: 'Sistema de Gestión de TFGs con React y Symfony',
          estudiante: {
            nombre: 'Juan Pérez',
            email: 'juan.perez@estudiante.edu',
            curso: '4º Ingeniería Informática'
          },
          estado: 'En revisión',
          fechaSubida: '2025-01-15T10:30:00Z',
          fechaUltimaRevision: '2025-01-20T14:45:00Z',
          area: 'Desarrollo Web',
          tipoTFG: 'Desarrollo de Software',
          archivo: 'tfg_juan_perez_v2.pdf',
          tamaño: '2.5 MB',
          comentariosCount: 2,
          requiereAccion: true,
          calificacion: null,
          progreso: 60
        },
        {
          id: 2,
          titulo: 'Aplicación Móvil para Gestión de Entregas',
          estudiante: {
            nombre: 'María Silva',
            email: 'maria.silva@estudiante.edu',
            curso: '4º Ingeniería Informática'
          },
          estado: 'Aprobado',
          fechaSubida: '2024-12-10T09:15:00Z',
          fechaUltimaRevision: '2025-01-18T11:30:00Z',
          area: 'Desarrollo Móvil',
          tipoTFG: 'Desarrollo de Software',
          archivo: 'tfg_maria_silva_final.pdf',
          tamaño: '3.1 MB',
          comentariosCount: 5,
          requiereAccion: false,
          calificacion: 8.5,
          progreso: 90
        },
        {
          id: 3,
          titulo: 'Inteligencia Artificial para Diagnóstico Médico',
          estudiante: {
            nombre: 'Carlos Ruiz',
            email: 'carlos.ruiz@estudiante.edu',
            curso: '4º Ingeniería Informática'
          },
          estado: 'Borrador',
          fechaSubida: '2025-01-22T16:20:00Z',
          fechaUltimaRevision: null,
          area: 'Inteligencia Artificial',
          tipoTFG: 'Investigación',
          archivo: 'tfg_carlos_ruiz_borrador.pdf',
          tamaño: '1.8 MB',
          comentariosCount: 0,
          requiereAccion: true,
          calificacion: null,
          progreso: 30
        },
        {
          id: 4,
          titulo: 'Sistema de Seguridad con Blockchain',
          estudiante: {
            nombre: 'Ana López',
            email: 'ana.lopez@estudiante.edu',
            curso: '4º Ingeniería Informática'
          },
          estado: 'Rechazado',
          fechaSubida: '2025-01-10T14:00:00Z',
          fechaUltimaRevision: '2025-01-16T10:15:00Z',
          area: 'Seguridad Informática',
          tipoTFG: 'Investigación',
          archivo: 'tfg_ana_lopez_v1.pdf',
          tamaño: '2.2 MB',
          comentariosCount: 3,
          requiereAccion: false,
          calificacion: null,
          progreso: 20
        }
      ]
      
      setTfgs(tfgsData)
      setLoading(false)
    }

    cargarTFGs()
  }, [])

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

  const tfgsFiltrados = tfgs.filter(tfg => {
    switch (filtro) {
      case 'revision':
        return tfg.estado === 'En revisión'
      case 'aprobados':
        return tfg.estado === 'Aprobado'
      case 'rechazados':
        return tfg.estado === 'Rechazado'
      case 'borradores':
        return tfg.estado === 'Borrador'
      default:
        return true
    }
  })

  const estadisticas = {
    total: tfgs.length,
    enRevision: tfgs.filter(t => t.estado === 'En revisión').length,
    aprobados: tfgs.filter(t => t.estado === 'Aprobado').length,
    requierenAccion: tfgs.filter(t => t.requiereAccion).length
  }

  const handleCambiarEstado = async (tfgId, nuevoEstado) => {
    // Simular cambio de estado
    setTfgs(prev => prev.map(tfg => 
      tfg.id === tfgId 
        ? { ...tfg, estado: nuevoEstado, requiereAccion: false }
        : tfg
    ))
    setModalActivo(null)
  }

  const handleEnviarComentario = async (tfgId) => {
    // Simular envío de comentario
    console.log(`Enviando comentario a TFG ${tfgId}: ${comentarioModal}`)
    
    setTfgs(prev => prev.map(tfg => 
      tfg.id === tfgId 
        ? { ...tfg, comentariosCount: tfg.comentariosCount + 1 }
        : tfg
    ))
    
    setComentarioModal('')
    setModalActivo(null)
  }

  const handleAsignarCalificacion = async (tfgId) => {
    // Simular asignación de calificación
    setTfgs(prev => prev.map(tfg => 
      tfg.id === tfgId 
        ? { ...tfg, calificacion: parseFloat(calificacionModal) }
        : tfg
    ))
    
    setCalificacionModal('')
    setModalActivo(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando TFGs asignados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TFGs Asignados</h1>
        <p className="text-gray-600 mt-2">
          Gestiona y supervisa los trabajos de fin de grado de tus estudiantes
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
            <div className="text-sm text-gray-500">Total TFGs</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{estadisticas.enRevision}</div>
            <div className="text-sm text-gray-500">En Revisión</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{estadisticas.aprobados}</div>
            <div className="text-sm text-gray-500">Aprobados</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{estadisticas.requierenAccion}</div>
            <div className="text-sm text-gray-500">Requieren Acción</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'todos', label: 'Todos', count: tfgs.length },
            { key: 'revision', label: 'En Revisión', count: estadisticas.enRevision },
            { key: 'aprobados', label: 'Aprobados', count: estadisticas.aprobados },  
            { key: 'borradores', label: 'Borradores', count: tfgs.filter(t => t.estado === 'Borrador').length },
            { key: 'rechazados', label: 'Rechazados', count: tfgs.filter(t => t.estado === 'Rechazado').length }
          ].map((opcion) => (
            <button
              key={opcion.key}
              onClick={() => setFiltro(opcion.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filtro === opcion.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opcion.label}
              {opcion.count > 0 && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  filtro === opcion.key
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {opcion.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de TFGs */}
      <div className="space-y-6">
        {tfgsFiltrados.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay TFGs {filtro !== 'todos' ? `en estado "${filtro}"` : ''}
            </h3>
            <p className="text-gray-500">
              Los TFGs aparecerán aquí cuando sean asignados
            </p>
          </div>
        ) : (
          tfgsFiltrados.map((tfg) => (
            <div key={tfg.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header del TFG */}
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {tfg.titulo}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getEstadoColor(tfg.estado)}`}>
                        <span className="mr-1">{getEstadoIcon(tfg.estado)}</span>
                        {tfg.estado}
                      </span>
                      {tfg.requiereAccion && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Requiere atención
                        </span>
                      )}
                    </div>

                    {/* Info del estudiante */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Estudiante:</span>
                        <br />
                        <span className="text-gray-900">{tfg.estudiante.nombre}</span>
                        <br />
                        <span className="text-gray-500">{tfg.estudiante.email}</span>
                      </div>
                      <div>
                        <span className="font-medium">Área:</span> {tfg.area}
                        <br />
                        <span className="font-medium">Tipo:</span> {tfg.tipoTFG}
                      </div>
                      <div>
                        <span className="font-medium">Subido:</span> {new Date(tfg.fechaSubida).toLocaleDateString('es-ES')}
                        <br />
                        {tfg.fechaUltimaRevision && (
                          <>
                            <span className="font-medium">Última revisión:</span> {new Date(tfg.fechaUltimaRevision).toLocaleDateString('es-ES')}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{tfg.progreso}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            tfg.estado === 'Aprobado' ? 'bg-green-500' :
                            tfg.estado === 'En revisión' ? 'bg-yellow-500' :
                            tfg.estado === 'Rechazado' ? 'bg-red-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${tfg.progreso}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Info adicional */}
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-1">
                        <span>📎</span>
                        <span>{tfg.archivo} ({tfg.tamaño})</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>💬</span>
                        <span>{tfg.comentariosCount} comentarios</span>
                      </span>
                      {tfg.calificacion && (
                        <span className="flex items-center space-x-1">
                          <span>🏆</span>
                          <span>Calificación: {tfg.calificacion}/10</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col space-y-2 ml-6">
                    <Link
                      to={`/profesor/tfg/${tfg.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 text-center"
                    >
                      📄 Ver Detalle
                    </Link>
                    <button 
                      onClick={() => setModalActivo({ tipo: 'comentario', tfg })}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                    >
                      💬 Comentar
                    </button>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">
                      ⬇️ Descargar
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setModalActivo({ tipo: 'estado', tfg })}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
                      >
                        🔄 Cambiar Estado
                      </button>
                    </div>
                    {tfg.estado === 'Aprobado' && !tfg.calificacion && (
                      <button 
                        onClick={() => setModalActivo({ tipo: 'calificacion', tfg })}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700"
                      >
                        ⭐ Calificar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para comentarios */}
      {modalActivo?.tipo === 'comentario' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Añadir Comentario
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                TFG: {modalActivo.tfg.titulo}
              </p>
              <textarea
                value={comentarioModal}
                onChange={(e) => setComentarioModal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Escribe tu comentario para el estudiante..."
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setModalActivo(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleEnviarComentario(modalActivo.tfg.id)}
                  disabled={!comentarioModal.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Enviar Comentario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cambiar estado */}  
      {modalActivo?.tipo === 'estado' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cambiar Estado del TFG
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                TFG: {modalActivo.tfg.titulo}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Estado actual: <span className="font-medium">{modalActivo.tfg.estado}</span>
              </p>
              <div className="space-y-2">
                {['En revisión', 'Aprobado', 'Rechazado'].map((estado) => (
                  <button
                    key={estado}
                    onClick={() => handleCambiarEstado(modalActivo.tfg.id, estado)}
                    className={`w-full text-left px-4 py-2 rounded-md border ${
                      estado === modalActivo.tfg.estado
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    disabled={estado === modalActivo.tfg.estado}
                  >
                    {getEstadoIcon(estado)} {estado}
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setModalActivo(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para calificación */}
      {modalActivo?.tipo === 'calificacion' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Asignar Calificación
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                TFG: {modalActivo.tfg.titulo}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={calificacionModal}
                  onChange={(e) => setCalificacionModal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 8.5"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setModalActivo(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleAsignarCalificacion(modalActivo.tfg.id)}
                  disabled={!calificacionModal || calificacionModal < 0 || calificacionModal > 10}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  Asignar Calificación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TFGsAsignados