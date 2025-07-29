// src/pages/profesor/DetalleTFGProfesor.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function DetalleTFGProfesor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tfg, setTfg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('revision')
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [tipoComentario, setTipoComentario] = useState('revision')
  const [enviandoComentario, setEnviandoComentario] = useState(false)

  // Simular carga de datos del TFG
  useEffect(() => {
    const cargarTFG = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const tfgData = {
        id: parseInt(id),
        titulo: "Sistema de Gestión de TFGs con React y Symfony",
        resumen: "Este trabajo presenta el desarrollo de una plataforma web completa para la gestión de Trabajos de Fin de Grado en instituciones educativas. La solución implementa un frontend moderno usando React con TypeScript y un backend robusto desarrollado en Symfony, permitiendo a estudiantes, profesores y administradores gestionar eficientemente todo el proceso académico desde la propuesta inicial hasta la defensa final.",
        palabrasClave: "React, Symfony, TFG, Sistema de gestión, Educación",
        area: "Desarrollo Web",
        tipoTFG: "Desarrollo de Software",
        idioma: "Español",
        estado: "En revisión",
        fechaSubida: "2025-01-15T10:30:00Z",
        fechaUltimaActualizacion: "2025-01-20T14:45:00Z",
        estudiante: {
          nombre: "Juan Pérez",
          email: "juan.perez@estudiante.edu",
          curso: "4º Ingeniería Informática",
          telefono: "+34 666 123 456"
        },
        archivo: {
          nombre: "tfg_juan_perez_v2.pdf",
          tamaño: "2.5 MB",
          fechaSubida: "2025-01-20T14:45:00Z",
          versiones: [
            { version: "v2", fecha: "2025-01-20T14:45:00Z", cambios: "Incorporación de feedback inicial" },
            { version: "v1", fecha: "2025-01-15T10:30:00Z", cambios: "Versión inicial" }
          ]
        },
        comentarios: [
          {
            id: 1,
            autor: "Dr. María García",
            fecha: "2025-01-20T14:45:00Z",
            tipo: "revision",
            mensaje: "El trabajo presenta una buena estructura general. Sin embargo, es necesario ampliar la sección de metodología y añadir más detalles sobre las pruebas realizadas. La implementación técnica se ve sólida pero falta documentación de la arquitectura.",
            respondido: false
          },
          {
            id: 2,
            autor: "Dr. María García", 
            fecha: "2025-01-18T09:15:00Z",
            tipo: "aprobacion",
            mensaje: "La propuesta inicial está bien fundamentada. Puedes proceder con el desarrollo completo del sistema. Me gusta el enfoque tecnológico elegido.",
            respondido: true
          }
        ],
        criteriosEvaluacion: {
          originalidad: null,
          metodologia: null,
          implementacion: null,
          documentacion: null,
          presentacion: null
        },
        historialEstados: [
          { fecha: "2025-01-20T14:45:00Z", estado: "En revisión", comentario: "Revisión inicial completada" },
          { fecha: "2025-01-18T09:15:00Z", estado: "En revisión", comentario: "Cambio a revisión para evaluación" },
          { fecha: "2025-01-15T10:30:00Z", estado: "Borrador", comentario: "Trabajo subido inicialmente" }
        ]
      }
      
      setTfg(tfgData)
      setLoading(false)
    }

    cargarTFG()
  }, [id])

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) return
    
    setEnviandoComentario(true)
    
    // Simular envío de comentario
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const nuevoComentarioObj = {
      id: Date.now(),
      autor: "Dr. María García",
      fecha: new Date().toISOString(),
      tipo: tipoComentario,
      mensaje: nuevoComentario,
      respondido: false
    }
    
    setTfg(prev => ({
      ...prev,
      comentarios: [nuevoComentarioObj, ...prev.comentarios]
    }))
    
    setNuevoComentario('')
    setEnviandoComentario(false)
  }

  const handleCambiarEstado = async (nuevoEstado) => {
    // Simular cambio de estado
    const nuevoHistorial = {
      fecha: new Date().toISOString(),
      estado: nuevoEstado,
      comentario: `Estado cambiado por el tutor`
    }
    
    setTfg(prev => ({
      ...prev,
      estado: nuevoEstado,
      historialEstados: [nuevoHistorial, ...prev.historialEstados]
    }))
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
      case 'Aprobado': return 'bg-green-100 text-green-800 border-green-200'
      case 'En revisión': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Rechazado': return 'bg-red-100 text-red-800 border-red-200'
      case 'Borrador': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
              <span>Estudiante: <strong>{tfg.estudiante.nombre}</strong></span>
              <span>•</span>
              <span>Área: <strong>{tfg.area}</strong></span>
              <span>•</span>
              <span>Subido: {new Date(tfg.fechaSubida).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 ml-6">
            <span className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border ${getEstadoColor(tfg.estado)}`}>
              {tfg.estado}
            </span>
            <div className="relative">
              <select 
                onChange={(e) => handleCambiarEstado(e.target.value)}
                value=""
                className="appearance-none bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 cursor-pointer"
              >
                <option value="" disabled>Cambiar Estado</option>
                <option value="En revisión">En revisión</option>
                <option value="Aprobado">Aprobar</option>
                <option value="Rechazado">Rechazar</option>
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
            <p className="text-sm text-gray-900">{tfg.estudiante.nombre}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm text-gray-900">{tfg.estudiante.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Curso</p>
            <p className="text-sm text-gray-900">{tfg.estudiante.curso}</p>
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
              { id: 'comentarios', name: 'Comentarios', icon: '💬', badge: tfg.comentarios.filter(c => !c.respondido).length },
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
                  <p className="text-sm text-gray-700 leading-relaxed">{tfg.resumen}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Detalles Técnicos</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tipo de TFG</dt>
                      <dd className="text-sm text-gray-900">{tfg.tipoTFG}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Área</dt>
                      <dd className="text-sm text-gray-900">{tfg.area}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Idioma</dt>
                      <dd className="text-sm text-gray-900">{tfg.idioma}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Palabras Clave</h3>
                  <div className="flex flex-wrap gap-2">
                    {tfg.palabrasClave.split(', ').map((palabra, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {palabra}
                      </span>
                    ))}
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
                  Historial de Comentarios ({tfg.comentarios.length})
                </h3>
              </div>

              {tfg.comentarios.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin comentarios</h3>
                  <p className="text-gray-500">Aún no has añadido comentarios a este TFG</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tfg.comentarios.map((comentario) => (
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
                            <p className="text-sm font-medium text-gray-900">{comentario.autor}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(comentario.fecha).toLocaleDateString('es-ES')} a las{' '}
                              {new Date(comentario.fecha).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
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
                      <p className="text-sm text-gray-700">{comentario.mensaje}</p>
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
                <ul className="-mb-8">
                  {tfg.historialEstados.map((evento, eventoIdx) => (
                    <li key={eventoIdx}>
                      <div className="relative pb-8">
                        {eventoIdx !== tfg.historialEstados.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                        )}
                        <div className="relative flex space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <span className="text-sm">🔄</span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Estado: {evento.estado}
                              </p>
                              <p className="text-sm text-gray-500">{evento.comentario}</p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {new Date(evento.fecha).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
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
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{tfg.archivo.nombre}</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Tamaño: {tfg.archivo.tamaño} • 
                    Subido: {new Date(tfg.archivo.fechaSubida).toLocaleDateString('es-ES')}
                  </p>
                  
                  <div className="flex justify-center space-x-3">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
                      <span>👁️</span>
                      <span>Previsualizar</span>
                    </button>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2">
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

              {/* Historial de versiones */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Historial de Versiones</h4>
                <div className="space-y-3">
                  {tfg.archivo.versiones.map((version, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{version.version}</p>
                        <p className="text-sm text-gray-500">{version.cambios}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(version.fecha).toLocaleDateString('es-ES')}
                        </p>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Descargar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetalleTFGProfesor