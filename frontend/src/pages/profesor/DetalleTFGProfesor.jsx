import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTFGs } from '../../hooks/useTFGs'
import { useNotificaciones } from '../../context/NotificacionesContext'

function DetalleTFGProfesor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tfg, setTfg] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [activeTab, setActiveTab] = useState('revision')
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [tipoComentario, setTipoComentario] = useState('revision')

  const {
    obtenerTFG,
    obtenerComentarios,
    añadirComentario,
    cambiarEstado,
    descargarTFG,
    loading,
    error
  } = useTFGs()

  const { mostrarNotificacion } = useNotificaciones()
  const [enviandoComentario, setEnviandoComentario] = useState(false)

  // Cargar datos del TFG desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      if (!id) return

      try {
        // Cargar TFG
        const resultadoTFG = await obtenerTFG(id)
        if (resultadoTFG.success) {
          setTfg(resultadoTFG.data)
        } else {
          mostrarNotificacion(resultadoTFG.error, 'error')
          navigate('/profesor/tfgs-asignados')
          return
        }

        // Cargar comentarios
        const resultadoComentarios = await obtenerComentarios(id)
        if (resultadoComentarios.success) {
          setComentarios(resultadoComentarios.data)
        }
      } catch (error) {
        console.error('Error cargando TFG:', error)
        mostrarNotificacion('Error al cargar el TFG', 'error')
        navigate('/profesor/tfgs-asignados')
      }
    }

    cargarDatos()
  }, [id])

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) return

    setEnviandoComentario(true)

    try {
      const resultado = await añadirComentario(id, nuevoComentario)
      if (resultado.success) {
        mostrarNotificacion(resultado.message, 'success')
        setNuevoComentario('')

        // Recargar comentarios
        const resultadoComentarios = await obtenerComentarios(id)
        if (resultadoComentarios.success) {
          setComentarios(resultadoComentarios.data)
        }
      } else {
        mostrarNotificacion(resultado.error, 'error')
      }
    } catch (error) {
      console.error('Error enviando comentario:', error)
      mostrarNotificacion('Error al enviar comentario', 'error')
    } finally {
      setEnviandoComentario(false)
    }
  }

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!nuevoEstado) return

    try {
      const resultado = await cambiarEstado(id, nuevoEstado, '')
      if (resultado.success) {
        mostrarNotificacion(resultado.message, 'success')
        setTfg(prev => ({
          ...prev,
          estado: nuevoEstado
        }))
      } else {
        mostrarNotificacion(resultado.error, 'error')
      }
    } catch (error) {
      console.error('Error cambiando estado:', error)
      mostrarNotificacion('Error al cambiar estado', 'error')
    }
  }

  const getTipoComentarioColor = (tipo) => {
    switch (tipo) {
      case 'aprobacion': return 'bg-green-50 border-green-200'
      case 'revision': return 'bg-yellow-50 border-yellow-200'
      case 'rechazo': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado': return 'bg-green-100 text-green-800 border-green-200'
      case 'revision': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rechazado': return 'bg-red-100 text-red-800 border-red-200'
      case 'borrador': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'aprobado': return 'Aprobado'
      case 'revision': return 'En revisión'
      case 'rechazado': return 'Rechazado'
      case 'borrador': return 'Borrador'
      default: return estado
    }
  }

  const handleDescargar = async () => {
    try {
      const resultado = await descargarTFG(id, tfg.archivoOriginalName || `tfg_${id}.pdf`)
      if (!resultado.success) {
        mostrarNotificacion(resultado.error, 'error')
      }
    } catch (error) {
      console.error('Error descargando TFG:', error)
      mostrarNotificacion('Error al descargar el archivo', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando TFG...</p>
        </div>
      </div>
    )
  }

  if (!tfg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">TFG no encontrado</h1>
          <button 
            onClick={() => navigate('/profesor/tfgs-asignados')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Volver a TFGs Asignados
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/profesor/tfgs-asignados')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Volver a TFGs Asignados
        </button>
        
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tfg.titulo}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Estudiante: <strong>{tfg.estudiante?.nombreCompleto || 'No disponible'}</strong></span>
              <span>•</span>
              <span>Área: <strong>{tfg.area || 'No especificada'}</strong></span>
              <span>•</span>
              <span>Subido: {tfg.createdAt ? new Date(tfg.createdAt).toLocaleDateString('es-ES') : 'No disponible'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 ml-6">
            <span className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border ${getEstadoColor(tfg.estado)}`}>
              {getEstadoTexto(tfg.estado)}
            </span>
            <div className="relative">
              <select 
                onChange={(e) => handleCambiarEstado(e.target.value)}
                value=""
                className="appearance-none bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 cursor-pointer"
              >
                <option value="" disabled>Cambiar Estado</option>
                <option value="revision">En revisión</option>
                <option value="aprobado">Aprobar</option>
                <option value="rechazado">Rechazar</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Información del estudiante */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Estudiante</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nombre completo</p>
            <p className="text-sm text-gray-900">{tfg.estudiante?.nombreCompleto || 'No disponible'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm text-gray-900">{tfg.estudiante?.email || 'No disponible'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Curso</p>
            <p className="text-sm text-gray-900">{tfg.estudiante?.curso || 'No disponible'}</p>
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
            📧 Enviar Email
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
            📅 Programar Reunión
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'revision', name: 'Revisión', icon: '🔍' },
              { id: 'comentarios', name: 'Comentarios', icon: '💬', badge: comentarios.length },
              { id: 'evaluacion', name: 'Evaluación', icon: '⭐' },
              { id: 'historial', name: 'Historial', icon: '📝' },
              { id: 'archivo', name: 'Archivo', icon: '📎' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
                {tab.badge > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Revisión */}
          {activeTab === 'revision' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Resumen del Trabajo</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{tfg.resumen || 'No disponible'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Detalles Técnicos</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tipo de TFG</dt>
                      <dd className="text-sm text-gray-900">{tfg.tipo || 'No especificado'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Área</dt>
                      <dd className="text-sm text-gray-900">{tfg.area || 'No especificada'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Idioma</dt>
                      <dd className="text-sm text-gray-900">{tfg.idioma || 'No especificado'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Palabras Clave</h3>
                  <div className="flex flex-wrap gap-2">
                    {tfg.palabrasClave && tfg.palabrasClave.length > 0 ? (
                      tfg.palabrasClave.map((palabra, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {palabra}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No especificadas</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Formulario para nuevo comentario */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Añadir Comentario</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de comentario
                    </label>
                    <select
                      value={tipoComentario}
                      onChange={(e) => setTipoComentario(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="revision">Revisión/Sugerencia</option>
                      <option value="aprobacion">Aprobación</option>
                      <option value="rechazo">Rechazo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentario
                    </label>
                    <textarea
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Escribe tu comentario detallado para el estudiante..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleEnviarComentario}
                      disabled={!nuevoComentario.trim() || enviandoComentario}
                      className={`px-6 py-2 rounded-md text-white font-medium ${
                        enviandoComentario
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {enviandoComentario ? 'Enviando...' : 'Enviar Comentario'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Comentarios */}
          {activeTab === 'comentarios' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Historial de Comentarios ({comentarios.length})
                </h3>
              </div>

              {comentarios.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin comentarios</h3>
                  <p className="text-gray-500">Aún no has añadido comentarios a este TFG</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comentarios.map((comentario) => (
                    <div 
                      key={comentario.id} 
                      className={`border rounded-lg p-4 ${getTipoComentarioColor(comentario.tipo)}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            MG
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{comentario.autor || 'Usuario'}</p>
                            <p className="text-xs text-gray-500">
                              {comentario.createdAt ? new Date(comentario.createdAt).toLocaleDateString('es-ES') : 'Fecha no disponible'} a las{' '}
                              {comentario.createdAt ? new Date(comentario.createdAt).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}) : ''}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          comentario.tipo === 'aprobacion' ? 'bg-green-100 text-green-800' :
                          comentario.tipo === 'revision' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {comentario.tipo}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comentario.comentario || comentario.mensaje}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Evaluación */}
          {activeTab === 'evaluacion' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Criterios de Evaluación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'originalidad', name: 'Originalidad y Creatividad', descripcion: 'Nivel de innovación y aporte original' },
                  { key: 'metodologia', name: 'Metodología', descripcion: 'Rigor metodológico y enfoque sistemático' },
                  { key: 'implementacion', name: 'Implementación Técnica', descripcion: 'Calidad de la solución técnica' },
                  { key: 'documentacion', name: 'Documentación', descripcion: 'Claridad y completitud de la documentación' }
                ].map((criterio) => (
                  <div key={criterio.key} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{criterio.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{criterio.descripcion}</p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((valor) => (
                        <button
                          key={valor}
                          className={`w-8 h-8 rounded-full border ${
                            tfg.criteriosEvaluacion[criterio.key] === valor
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                          onClick={() => {
                            setTfg(prev => ({
                              ...prev,
                              criteriosEvaluacion: {
                                ...prev.criteriosEvaluacion,
                                [criterio.key]: valor
                              }
                            }))
                          }}
                        >
                          {valor}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Calificación Final</h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                  />
                  <span className="text-sm text-gray-500">/ 10</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    Guardar Calificación
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Historial */}
          {activeTab === 'historial' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Historial de Estados</h3>

              <div className="flow-root">
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Historial no disponible</h3>
                  <p className="text-gray-500">El historial detallado de estados no está implementado aún</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Archivo */}
          {activeTab === 'archivo' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Documento del TFG</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{tfg.archivoOriginalName || 'Sin archivo'}</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    {tfg.archivoInfo?.size_formatted ? `Tamaño: ${tfg.archivoInfo.size_formatted} • ` : ''}
                    Subido: {tfg.createdAt ? new Date(tfg.createdAt).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                  </p>
                  
                  <div className="flex justify-center space-x-3">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
                      <span>👁️</span>
                      <span>Previsualizar</span>
                    </button>
                    <button
                      onClick={handleDescargar}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <span>⬇️</span>
                      <span>Descargar</span>
                    </button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2">
                      <span>📝</span>
                      <span>Anotar PDF</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Información del archivo */}
              {tfg.archivoPath && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Información del Archivo</h4>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Versión actual</p>
                      <p className="text-sm text-gray-500">Última actualización: {tfg.updatedAt ? new Date(tfg.updatedAt).toLocaleDateString('es-ES') : 'No disponible'}</p>
                    </div>
                    <div className="text-right mt-2">
                      <button
                        onClick={handleDescargar}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Descargar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetalleTFGProfesor