import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTFGs } from '../../hooks/useTFGs'
import { useNotificaciones } from '../../context/NotificacionesContext'

function TFGsAsignados() {
  const [tfgs, setTfgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos') // todos, revision, aprobados, rechazados
  const [modalActivo, setModalActivo] = useState(null)
  const [comentarioModal, setComentarioModal] = useState('')
  const [calificacionModal, setCalificacionModal] = useState('')
  const { obtenerTFGsAsignados, cambiarEstado, añadirComentario, descargarTFG } = useTFGs()
  const { mostrarNotificacion } = useNotificaciones()

  // Cargar TFGs asignados desde la API
  useEffect(() => {
    const cargarTFGs = async () => {
      setLoading(true)
      try {
        const resultado = await obtenerTFGsAsignados()
        if (resultado.success) {
          setTfgs(resultado.data || [])
        } else {
          mostrarNotificacion(resultado.error || 'Error al cargar TFGs asignados', 'error')
          setTfgs([])
        }
      } catch (error) {
        console.error('Error cargando TFGs asignados:', error)
        mostrarNotificacion('Error al cargar TFGs asignados', 'error')
        setTfgs([])
      } finally {
        setLoading(false)
      }
    }

    cargarTFGs()
  }, [])

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado': return 'bg-green-100 text-green-800 border-green-200'
      case 'revision': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rechazado': return 'bg-red-100 text-red-800 border-red-200'
      case 'borrador': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'defendido': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'aprobado': return '✅'
      case 'revision': return '⏳'
      case 'rechazado': return '❌'
      case 'borrador': return '📝'
      case 'defendido': return '🎯'
      default: return '📄'
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'aprobado': return 'Aprobado'
      case 'revision': return 'En revisión'
      case 'rechazado': return 'Rechazado'
      case 'borrador': return 'Borrador'
      case 'defendido': return 'Defendido'
      default: return estado
    }
  }

  const tfgsFiltrados = tfgs.filter(tfg => {
    switch (filtro) {
      case 'revision':
        return tfg.estado === 'revision'
      case 'aprobados':
        return tfg.estado === 'aprobado'
      case 'rechazados':
        return tfg.estado === 'rechazado'
      case 'borradores':
        return tfg.estado === 'borrador'
      default:
        return true
    }
  })

  const estadisticas = {
    total: tfgs.length,
    enRevision: tfgs.filter(t => t.estado === 'revision').length,
    aprobados: tfgs.filter(t => t.estado === 'aprobado').length,
    borradores: tfgs.filter(t => t.estado === 'borrador').length
  }

  const handleCambiarEstado = async (tfgId, nuevoEstado) => {
    try {
      const resultado = await cambiarEstado(tfgId, nuevoEstado, comentarioModal)
      if (resultado.success) {
        // Recargar la lista de TFGs
        const resultadoTFGs = await obtenerTFGsAsignados()
        if (resultadoTFGs.success) {
          setTfgs(resultadoTFGs.data || [])
        }
        mostrarNotificacion(`Estado cambiado a ${getEstadoLabel(nuevoEstado)}`, 'success')
      } else {
        mostrarNotificacion(resultado.error || 'Error al cambiar estado', 'error')
      }
    } catch (error) {
      console.error('Error cambiando estado:', error)
      mostrarNotificacion('Error al cambiar estado del TFG', 'error')
    }
    setModalActivo(null)
    setComentarioModal('')
  }

  const handleEnviarComentario = async (tfgId) => {
    if (!comentarioModal.trim()) return

    try {
      const resultado = await añadirComentario(tfgId, comentarioModal)
      if (resultado.success) {
        mostrarNotificacion('Comentario enviado correctamente', 'success')
        // Recargar la lista para actualizar contadores
        const resultadoTFGs = await obtenerTFGsAsignados()
        if (resultadoTFGs.success) {
          setTfgs(resultadoTFGs.data || [])
        }
      } else {
        mostrarNotificacion(resultado.error || 'Error al enviar comentario', 'error')
      }
    } catch (error) {
      console.error('Error enviando comentario:', error)
      mostrarNotificacion('Error al enviar comentario', 'error')
    }

    setComentarioModal('')
    setModalActivo(null)
  }

  const handleDescargar = async (tfg) => {
    try {
      const resultado = await descargarTFG(tfg.id, tfg.archivoOriginalName || `tfg_${tfg.id}.pdf`)
      if (!resultado.success) {
        mostrarNotificacion(resultado.error || 'Error al descargar archivo', 'error')
      }
    } catch (error) {
      console.error('Error descargando archivo:', error)
      mostrarNotificacion('Error al descargar archivo', 'error')
    }
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
            <div className="text-2xl font-bold text-gray-600">{estadisticas.borradores}</div>
            <div className="text-sm text-gray-500">Borradores</div>
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
            { key: 'borradores', label: 'Borradores', count: estadisticas.borradores },
            { key: 'rechazados', label: 'Rechazados', count: tfgs.filter(t => t.estado === 'rechazado').length }
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
                        {getEstadoLabel(tfg.estado)}
                      </span>
                    </div>

                    {/* Info del estudiante */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Estudiante:</span>
                        <br />
                        <span className="text-gray-900">{tfg.estudiante?.nombreCompleto || 'No disponible'}</span>
                        <br />
                        <span className="text-gray-500">{tfg.estudiante?.email || 'No disponible'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Progreso:</span> {tfg.progreso || 0}%
                        <br />
                        <span className="font-medium">Palabras clave:</span> {
                          tfg.palabrasClave && Array.isArray(tfg.palabrasClave) ?
                            tfg.palabrasClave.slice(0, 2).join(', ') + (tfg.palabrasClave.length > 2 ? '...' : '') :
                            'No especificadas'
                        }
                      </div>
                      <div>
                        <span className="font-medium">Subido:</span> {tfg.createdAt ? new Date(tfg.createdAt).toLocaleDateString('es-ES') : 'No disponible'}
                        <br />
                        <span className="font-medium">Actualizado:</span> {tfg.updatedAt ? new Date(tfg.updatedAt).toLocaleDateString('es-ES') : 'No disponible'}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{tfg.progreso || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            tfg.estado === 'aprobado' ? 'bg-green-500' :
                            tfg.estado === 'revision' ? 'bg-yellow-500' :
                            tfg.estado === 'rechazado' ? 'bg-red-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${tfg.progreso || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Info adicional */}
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-1">
                        <span>📎</span>
                        <span>{tfg.archivoOriginalName || 'Sin archivo'} ({tfg.archivoInfo?.size_formatted || 'N/A'})</span>
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