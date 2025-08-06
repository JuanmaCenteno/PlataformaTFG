import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function DetalleTribunal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tribunal, setTribunal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('evaluacion')
  const [calificaciones, setCalificaciones] = useState({
    originalidad: null,
    metodologia: null,
    implementacion: null,
    presentacion: null,
    defensa: null
  })
  const [observaciones, setObservaciones] = useState('')
  const [guardandoCalificaciones, setGuardandoCalificaciones] = useState(false)

  // Simular carga de datos del tribunal
  useEffect(() => {
    const cargarTribunal = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const tribunalData = {
        id: parseInt(id),
        nombre: "Tribunal TFG - Desarrollo Web",
        descripcion: "Tribunal especializado en proyectos de desarrollo web y aplicaciones móviles",
        fechaDefensa: "2025-02-15T10:00:00Z",
        aula: "Aula 301",
        estado: "Programado",
        tfg: {
          id: 1,
          titulo: "Sistema de Gestión de TFGs con React y Symfony",
          estudiante: {
            nombre: "Juan Pérez",
            email: "juan.perez@estudiante.edu",
            curso: "4º Ingeniería Informática"
          },
          tutor: "Dr. Carlos López",
          resumen: "Este trabajo presenta el desarrollo de una plataforma web completa para la gestión de Trabajos de Fin de Grado en instituciones educativas. La solución implementa un frontend moderno usando React y un backend robusto desarrollado en Symfony.",
          archivo: "tfg_juan_perez_final.pdf"
        },
        miembros: [
          { 
            id: 1, 
            nombre: "Dr. María García", 
            rol: "Presidente", 
            email: "maria.garcia@uni.edu", 
            esYo: true,
            calificaciones: {
              originalidad: null,
              metodologia: null,
              implementacion: null,
              presentacion: null,
              defensa: null
            }
          },
          { 
            id: 2, 
            nombre: "Dr. Carlos López", 
            rol: "Vocal", 
            email: "carlos.lopez@uni.edu", 
            esYo: false,
            calificaciones: {
              originalidad: 8,
              metodologia: 7,
              implementacion: 9,
              presentacion: null,
              defensa: null
            }
          },
          { 
            id: 3, 
            nombre: "Dra. Ana Martín", 
            rol: "Vocal", 
            email: "ana.martin@uni.edu", 
            esYo: false,
            calificaciones: {
              originalidad: null,
              metodologia: null,
              implementacion: null,
              presentacion: null,
              defensa: null
            }
          }
        ],
        criteriosEvaluacion: [
          {
            id: 1,
            nombre: "Originalidad y Creatividad",
            descripcion: "Nivel de innovación y aporte original del trabajo",
            peso: 20
          },
          {
            id: 2,
            nombre: "Metodología",
            descripcion: "Rigor metodológico y enfoque sistemático del desarrollo",
            peso: 20
          },
          {
            id: 3,
            nombre: "Implementación Técnica",
            descripcion: "Calidad de la solución técnica y código desarrollado",
            peso: 30
          },
          {
            id: 4,
            nombre: "Presentación Escrita",
            descripcion: "Claridad, estructura y calidad de la documentación",
            peso: 15
          },
          {
            id: 5,
            nombre: "Defensa Oral",
            descripcion: "Capacidad de presentación y defensa del trabajo",
            peso: 15
          }
        ],
        acta: {
          generada: false,
          observaciones: "",
          calificacionFinal: null,
          fechaGeneracion: null
        },
        cronograma: [
          { hora: "10:00", actividad: "Presentación del estudiante", duracion: "20 min" },
          { hora: "10:20", actividad: "Preguntas del tribunal", duracion: "15 min" },
          { hora: "10:35", actividad: "Deliberación privada", duracion: "10 min" },
          { hora: "10:45", actividad: "Comunicación del resultado", duracion: "5 min" }
        ]
      }
      
      setTribunal(tribunalData)
      setLoading(false)
    }

    cargarTribunal()
  }, [id])

  const handleGuardarCalificaciones = async () => {
    setGuardandoCalificaciones(true)
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Actualizar las calificaciones del miembro actual
    setTribunal(prev => ({
      ...prev,
      miembros: prev.miembros.map(miembro => 
        miembro.esYo 
          ? { ...miembro, calificaciones }
          : miembro
      )
    }))
    
    setGuardandoCalificaciones(false)
  }

  const calcularCalificacionFinal = () => {
    const miembro = tribunal.miembros.find(m => m.esYo)
    if (!miembro) return null

    const califs = miembro.calificaciones
    const criterios = tribunal.criteriosEvaluacion

    let sumaTotal = 0
    let pesoTotal = 0
    
    criterios.forEach((criterio, index) => {
      const valor = Object.values(califs)[index]
      if (valor !== null) {
        sumaTotal += valor * (criterio.peso / 100)
        pesoTotal += criterio.peso / 100
      }
    })

    return pesoTotal > 0 ? (sumaTotal / pesoTotal).toFixed(1) : null
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Programado': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'En curso': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Completado': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRolIcon = (rol) => {
    return rol === 'Presidente' ? '👑' : '👤'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tribunal...</p>
        </div>
      </div>
    )
  }

  if (!tribunal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Tribunal no encontrado</h1>
          <button 
            onClick={() => navigate('/profesor/tribunales')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Volver a Tribunales
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
          onClick={() => navigate('/profesor/tribunales')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Volver a Tribunales
        </button>
        
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tribunal.nombre}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>TFG: <strong>{tribunal.tfg.titulo}</strong></span>
              <span>•</span>
              <span>Estudiante: <strong>{tribunal.tfg.estudiante.nombre}</strong></span>
              <span>•</span>
              <span>Fecha: {new Date(tribunal.fechaDefensa).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
          
          <div className="ml-6">
            <span className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border ${getEstadoColor(tribunal.estado)}`}>
              {tribunal.estado}
            </span>
          </div>
        </div>
      </div>

      {/* Información general */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Detalles de la Defensa</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Fecha y hora</dt>
                <dd className="text-gray-900">
                  {new Date(tribunal.fechaDefensa).toLocaleDateString('es-ES')} - {' '}
                  {new Date(tribunal.fechaDefensa).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Aula</dt>
                <dd className="text-gray-900">{tribunal.aula}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Tutor</dt>
                <dd className="text-gray-900">{tribunal.tfg.tutor}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Tribunal</h3>
            <div className="space-y-2">
              {tribunal.miembros.map((miembro) => (
                <div key={miembro.id} className="flex items-center space-x-2">
                  <span>{getRolIcon(miembro.rol)}</span>
                  <span className="text-sm text-gray-900">
                    {miembro.nombre} ({miembro.rol})
                    {miembro.esYo && ' - Tú'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Cronograma</h3>
            <div className="space-y-2">
              {tribunal.cronograma.map((item, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-900">{item.hora}</span>
                  <span className="text-gray-600 ml-2">
                    {item.actividad} ({item.duracion})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'evaluacion', name: 'Mi Evaluación', icon: '⭐' },
              { id: 'tfg', name: 'Detalles del TFG', icon: '📄' },
              { id: 'calificaciones', name: 'Calificaciones', icon: '📊' },
              { id: 'acta', name: 'Acta', icon: '📋' }
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
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Mi Evaluación */}
          {activeTab === 'evaluacion' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Evaluación del TFG
                </h3>
                {calcularCalificacionFinal() && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Calificación calculada</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {calcularCalificacionFinal()}/10
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tribunal.criteriosEvaluacion.map((criterio, index) => (
                  <div key={criterio.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{criterio.nombre}</h4>
                        <p className="text-sm text-gray-600 mt-1">{criterio.descripcion}</p>
                      </div>
                      <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {criterio.peso}%
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Puntuación (0-10):</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={Object.values(calificaciones)[index] || ''}
                          onChange={(e) => {
                            const valor = e.target.value ? parseFloat(e.target.value) : null
                            const claves = Object.keys(calificaciones)
                            setCalificaciones(prev => ({
                              ...prev,
                              [claves[index]]: valor
                            }))
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.0"
                        />
                      </div>
                      
                      {/* Escala visual */}
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              const claves = Object.keys(calificaciones)
                              setCalificaciones(prev => ({
                                ...prev,
                                [claves[index]]: num
                              }))
                            }}
                            className={`w-6 h-6 rounded text-xs ${
                              Object.values(calificaciones)[index] === num
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Observaciones</h4>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Comentarios adicionales sobre el trabajo y la defensa..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGuardarCalificaciones}
                  disabled={guardandoCalificaciones}
                  className={`px-6 py-2 rounded-md text-white font-medium ${
                    guardandoCalificaciones
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {guardandoCalificaciones ? 'Guardando...' : 'Guardar Evaluación'}
                </button>
              </div>
            </div>
          )}

          {/* Tab: Detalles del TFG */}
          {activeTab === 'tfg' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Información del Trabajo</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{tribunal.tfg.titulo}</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{tribunal.tfg.resumen}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Información del Estudiante</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-gray-500">Nombre</dt>
                      <dd className="text-gray-900">{tribunal.tfg.estudiante.nombre}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Email</dt>
                      <dd className="text-gray-900">{tribunal.tfg.estudiante.email}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Curso</dt>
                      <dd className="text-gray-900">{tribunal.tfg.estudiante.curso}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Documento</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">📄</div>
                    <p className="text-sm font-medium text-gray-900">{tribunal.tfg.archivo}</p>
                    <div className="mt-3 space-x-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Ver PDF
                      </button>
                      <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                        Descargar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Calificaciones del Tribunal */}
          {activeTab === 'calificaciones' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Calificaciones del Tribunal
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miembro
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      {tribunal.criteriosEvaluacion.map((criterio) => (
                        <th key={criterio.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {criterio.nombre}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tribunal.miembros.map((miembro) => {
                      const califs = Object.values(miembro.calificaciones)
                      const promedio = califs.filter(c => c !== null).length > 0
                        ? (califs.filter(c => c !== null).reduce((a, b) => a + b, 0) / califs.filter(c => c !== null).length).toFixed(1)
                        : '-'

                      return (
                        <tr key={miembro.id} className={miembro.esYo ? 'bg-blue-50' : ''}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">
                                {miembro.nombre}
                                {miembro.esYo && ' (Tú)'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {getRolIcon(miembro.rol)} {miembro.rol}
                            </span>
                          </td>
                          {califs.map((calif, index) => (
                            <td key={index} className="px-4 py-4 whitespace-nowrap text-center">
                              <span className={`text-sm ${
                                calif !== null 
                                  ? 'text-gray-900 font-medium' 
                                  : 'text-gray-400'
                              }`}>
                                {calif !== null ? calif : '-'}
                              </span>
                            </td>
                          ))}
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-bold text-blue-600">
                              {promedio !== '-' ? `${promedio}/10` : '-'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Acta */}
          {activeTab === 'acta' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Acta del Tribunal</h3>
                {!tribunal.acta.generada && tribunal.miembros.find(m => m.esYo)?.rol === 'Presidente' && (
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    📄 Generar Acta
                  </button>
                )}
              </div>

              {tribunal.acta.generada ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-gray-900">ACTA DE DEFENSA DE TRABAJO FIN DE GRADO</h4>
                    <p className="text-gray-600 mt-2">Universidad - Facultad de Informática</p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <p><strong>Tribunal:</strong> {tribunal.nombre}</p>
                    <p><strong>Fecha:</strong> {new Date(tribunal.fechaDefensa).toLocaleDateString('es-ES')}</p>
                    <p><strong>Estudiante:</strong> {tribunal.tfg.estudiante.nombre}</p>
                    <p><strong>Trabajo:</strong> {tribunal.tfg.titulo}</p>
                    <p><strong>Calificación final:</strong> {tribunal.acta.calificacionFinal}/10</p>
                    <p><strong>Observaciones:</strong> {tribunal.acta.observaciones}</p>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      📄 Descargar Acta PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Acta no generada</h4>
                  <p className="text-gray-500">
                    El acta se generará automáticamente cuando se complete la evaluación
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetalleTribunal