import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTribunales } from '../../hooks/useTribunales'
import { useDefensas } from '../../hooks/useDefensas'
import { useNotificaciones } from '../../context/NotificacionesContext'
import { useAuth } from '../../context/AuthContext'

function DetalleTribunal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tribunal, setTribunal] = useState(null)
  const [defensa, setDefensa] = useState(null)
  const [tfg, setTfg] = useState(null)
  const [evaluaciones, setEvaluaciones] = useState([])
  const [loading, setLoading] = useState(true)

  const {
    obtenerTribunal
  } = useTribunales()

  const {
    calificarDefensa,
    obtenerCalificacionesDefensa,
    cambiarEstadoDefensa,
    obtenerDefensasPendientesCalificar,
    obtenerInfoActa,
    descargarActa
  } = useDefensas()

  const { mostrarNotificacion } = useNotificaciones()
  const [activeTab, setActiveTab] = useState('evaluacion')
  const [calificaciones, setCalificaciones] = useState({
    originalidad: null,
    presentacion: null,
    implementacion: null,
    contenido: null,
    defensa: null
  })
  const [comentarios, setComentarios] = useState('')
  const [guardandoEvaluacion, setGuardandoEvaluacion] = useState(false)
  const [yaEvalue, setYaEvalue] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [infoActa, setInfoActa] = useState(null)
  const [cargandoActa, setCargandoActa] = useState(false)

  // Cargar datos del tribunal y defensa desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      if (!id) return
      setLoading(true)

      try {
        // Cargar información del tribunal
        const resultadoTribunal = await obtenerTribunal(id)
        if (resultadoTribunal.success) {
          const tribunalData = resultadoTribunal.data
          setTribunal(tribunalData)


          // Buscar defensas pendientes de calificar para este usuario
          let defensaData = null
          try {
            const resultadoDefensasPendientes = await obtenerDefensasPendientesCalificar()
            if (resultadoDefensasPendientes.success && resultadoDefensasPendientes.data.length > 0) {
              // Buscar una defensa de este tribunal
              const defensaDelTribunal = resultadoDefensasPendientes.data.find(
                defensa => defensa.tribunal?.id === parseInt(id)
              )
              if (defensaDelTribunal) {
                defensaData = defensaDelTribunal

                // Usar los datos del TFG directamente desde la defensa
                if (defensaData.tfg) {
                  // Crear un objeto TFG compatible con la estructura esperada
                  const tfgData = {
                    id: defensaData.tfg.id || defensaData.tfg,
                    titulo: defensaData.tfg.titulo || 'TFG sin título',
                    resumen: defensaData.tfg.resumen || '',
                    palabrasClave: defensaData.tfg.palabrasClave || [],
                    estudiante: defensaData.tfg.estudiante || null,
                    tutor: defensaData.tfg.tutor || null,
                    ...defensaData.tfg
                  }
                  setTfg(tfgData)
                }
              }
            }
          } catch (error) {
            console.warn('Error al buscar defensas pendientes:', error)
          }

          // Fallback: buscar en proximaDefensa del tribunal
          if (!defensaData && tribunalData.proximaDefensa) {
            defensaData = tribunalData.proximaDefensa

            // También cargar TFG si está disponible en proximaDefensa
            if (defensaData.tfg) {
              const tfgData = {
                id: defensaData.tfg.id || defensaData.tfg,
                titulo: defensaData.tfg.titulo || 'TFG sin título',
                resumen: defensaData.tfg.resumen || '',
                palabrasClave: defensaData.tfg.palabrasClave || [],
                estudiante: defensaData.tfg.estudiante || null,
                tutor: defensaData.tfg.tutor || null,
                ...defensaData.tfg
              }
              setTfg(tfgData)
            }
          } else if (!defensaData && tribunalData.defensas && tribunalData.defensas.length > 0) {
            // Tomar la primera defensa disponible
            defensaData = tribunalData.defensas[0]

            // También cargar TFG si está disponible
            if (defensaData.tfg) {
              const tfgData = {
                id: defensaData.tfg.id || defensaData.tfg,
                titulo: defensaData.tfg.titulo || 'TFG sin título',
                resumen: defensaData.tfg.resumen || '',
                palabrasClave: defensaData.tfg.palabrasClave || [],
                estudiante: defensaData.tfg.estudiante || null,
                tutor: defensaData.tfg.tutor || null,
                ...defensaData.tfg
              }
              setTfg(tfgData)
            }
          }

          if (defensaData) {
            setDefensa(defensaData)

            // Cargar evaluaciones existentes si hay una defensa y tiene ID
            if (defensaData.id) {
              try {
                const resultadoEvaluaciones = await obtenerCalificacionesDefensa(defensaData.id)
                if (resultadoEvaluaciones.success) {
                  setEvaluaciones(resultadoEvaluaciones.data)

                  // Verificar si ya evalué
                  const miEvaluacion = resultadoEvaluaciones.data.find(evaluacion => evaluacion.evaluador?.id === user?.id)
                  if (miEvaluacion) {
                    setYaEvalue(true)
                    setCalificaciones({
                      originalidad: miEvaluacion.notaPresentacion,
                      presentacion: miEvaluacion.notaPresentacion,
                      implementacion: miEvaluacion.notaContenido,
                      contenido: miEvaluacion.notaContenido,
                      defensa: miEvaluacion.notaDefensa
                    })
                    setComentarios(miEvaluacion.comentarios || '')
                  }
                }
              } catch (evalError) {
                console.warn('No se pudieron cargar las evaluaciones:', evalError)
                // No es crítico, continúa sin evaluaciones previas
              }
            }
          }
        } else {
          mostrarNotificacion(resultadoTribunal.error, 'error')
          navigate('/profesor/tribunales')
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
        mostrarNotificacion('Error al cargar la información', 'error')
        navigate('/profesor/tribunales')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [id, user?.id])

  // Función para cargar información del acta
  const cargarInfoActa = useCallback(async (defensaId) => {
    setCargandoActa(true)
    try {
      const resultado = await obtenerInfoActa(defensaId)
      if (resultado.success) {
        setInfoActa(resultado.data)
      }
    } catch (err) {
      console.warn('Error al cargar información del acta:', err)
    } finally {
      setCargandoActa(false)
    }
  }, [obtenerInfoActa])

  // Función para descargar acta
  const manejarDescargarActa = async () => {
    if (!defensa?.id) return

    try {
      const resultado = await descargarActa(defensa.id)
      if (resultado.success) {
        mostrarNotificacion('Acta descargada correctamente', 'success')
      } else {
        mostrarNotificacion(resultado.error || 'Error al descargar el acta', 'error')
      }
    } catch (error) {
      mostrarNotificacion('Error al descargar el acta', 'error')
    }
  }

  // Verificar si hay acta disponible cuando cambie la defensa
  useEffect(() => {
    if (defensa && defensa.id && defensa.estado === 'completada') {
      cargarInfoActa(defensa.id)
    }
  }, [defensa, cargarInfoActa])

  const handleMarcarCompletada = async () => {
    if (!defensa) {
      mostrarNotificacion('No hay defensa para completar', 'error')
      return
    }

    if (defensa.estado !== 'programada') {
      mostrarNotificacion('Solo se pueden completar defensas programadas', 'error')
      return
    }

    setCambiandoEstado(true)

    try {
      const resultado = await cambiarEstadoDefensa(defensa.id, 'completada', 'Defensa realizada satisfactoriamente')
      if (resultado.success) {
        mostrarNotificacion('Defensa marcada como completada. Ya se puede proceder a calificar.', 'success')

        // Actualizar el estado local de la defensa
        setDefensa(prev => ({
          ...prev,
          estado: 'completada'
        }))
      } else {
        mostrarNotificacion(resultado.error || 'Error al marcar defensa como completada', 'error')
      }
    } catch (error) {
      console.error('Error marcando defensa como completada:', error)
      mostrarNotificacion('Error al marcar defensa como completada', 'error')
    } finally {
      setCambiandoEstado(false)
    }
  }

  const handleGuardarEvaluacion = async () => {
    if (!defensa) {
      mostrarNotificacion('No hay defensa para evaluar', 'error')
      return
    }

    // Validar que todas las calificaciones estén completas
    const notasValidas = [
      calificaciones.originalidad,
      calificaciones.presentacion,
      calificaciones.implementacion,
      calificaciones.contenido,
      calificaciones.defensa
    ].every(nota => nota !== null && nota >= 0 && nota <= 10)

    if (!notasValidas) {
      mostrarNotificacion('Por favor, completa todas las calificaciones (0-10)', 'error')
      return
    }

    setGuardandoEvaluacion(true)

    try {
      const datosEvaluacion = {
        calificaciones: {
          nota_presentacion: (calificaciones.originalidad + calificaciones.presentacion) / 2,
          nota_contenido: (calificaciones.implementacion + calificaciones.contenido) / 2,
          nota_defensa: calificaciones.defensa,
          comentarios: comentarios
        }
      }

      const resultado = await calificarDefensa(defensa.id, datosEvaluacion)
      if (resultado.success) {
        mostrarNotificacion('Evaluación guardada correctamente', 'success')
        setYaEvalue(true)

        // Recargar evaluaciones
        const resultadoEvaluaciones = await obtenerCalificacionesDefensa(defensa.id)
        if (resultadoEvaluaciones.success) {
          setEvaluaciones(resultadoEvaluaciones.data)
        }
      } else {
        mostrarNotificacion(resultado.error || 'Error al guardar evaluación', 'error')
      }
    } catch (error) {
      console.error('Error guardando evaluación:', error)
      mostrarNotificacion('Error al guardar evaluación', 'error')
    } finally {
      setGuardandoEvaluacion(false)
    }
  }

  const calcularMiCalificacion = () => {
    const notas = Object.values(calificaciones).filter(nota => nota !== null)
    if (notas.length === 0) return null

    const promedio = notas.reduce((acc, nota) => acc + nota, 0) / notas.length
    return promedio.toFixed(1)
  }

  const calcularPromedioTribunal = () => {
    if (evaluaciones.length === 0) return null

    const notasFinales = evaluaciones
      .filter(evaluacion => evaluacion.notaFinal !== null)
      .map(evaluacion => parseFloat(evaluacion.notaFinal))

    if (notasFinales.length === 0) return null

    const promedio = notasFinales.reduce((acc, nota) => acc + nota, 0) / notasFinales.length
    return promedio.toFixed(1)
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'programada': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completada': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelada': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'programada': return 'Programada'
      case 'completada': return 'Completada'
      case 'cancelada': return 'Cancelada'
      default: return estado
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
          <p className="mt-4 text-gray-600">Cargando información...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">⭐ Evaluación de TFG</h1>
            {defensa && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>TFG: <strong>{tfg?.titulo || defensa?.tfg?.titulo || 'Sin título'}</strong></span>
                <span>•</span>
                <span>Estudiante: <strong>{tfg?.estudiante?.nombreCompleto || defensa?.tfg?.estudiante?.nombreCompleto || 'No disponible'}</strong></span>
                <span>•</span>
                <span>Estado: <strong>{getEstadoLabel(defensa.estado)}</strong></span>
              </div>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>Tribunal: <strong>{tribunal?.nombre}</strong></span>
              {defensa?.fechaDefensa && (
                <>
                  <span>•</span>
                  <span>Fecha: <strong>{new Date(defensa.fechaDefensa).toLocaleDateString('es-ES')}</strong></span>
                </>
              )}
            </div>
          </div>

          <div className="ml-6">
            {defensa && (
              <span className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border ${getEstadoColor(defensa.estado)}`}>
                {getEstadoLabel(defensa.estado)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Información del TFG y estado de evaluación */}
      {defensa && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Información del TFG</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Título</dt>
                  <dd className="text-gray-900">{tfg?.titulo || defensa?.tfg?.titulo || 'Sin título'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Estudiante</dt>
                  <dd className="text-gray-900">{tfg?.estudiante?.nombreCompleto || defensa?.tfg?.estudiante?.nombreCompleto || 'No disponible'}</dd>
                </div>
                {(tfg?.resumen || defensa?.tfg?.resumen) && (
                  <div>
                    <dt className="font-medium text-gray-500">Resumen</dt>
                    <dd className="text-gray-900 text-xs">{(tfg?.resumen || defensa?.tfg?.resumen)?.substring(0, 150)}{(tfg?.resumen || defensa?.tfg?.resumen)?.length > 150 ? '...' : ''}</dd>
                  </div>
                )}
                {(tfg?.tutor || defensa?.tfg?.tutor) && (
                  <div>
                    <dt className="font-medium text-gray-500">Tutor</dt>
                    <dd className="text-gray-900">{tfg?.tutor?.nombreCompleto || tfg?.tutor?.nombre || defensa?.tfg?.tutor?.nombreCompleto || defensa?.tfg?.tutor?.nombre}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-gray-500">Estado de la defensa</dt>
                  <dd className="text-gray-900">{getEstadoLabel(defensa.estado)}</dd>
                </div>
                {defensa.aula && (
                  <div>
                    <dt className="font-medium text-gray-500">Aula</dt>
                    <dd className="text-gray-900">{defensa.aula}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Miembros del Tribunal</h3>
              <div className="space-y-2">
                {tribunal?.miembrosConUsuario && tribunal.miembrosConUsuario.map((miembro) => (
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
              <h3 className="font-medium text-gray-900 mb-3">Estado de Evaluaciones</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Evaluaciones completadas:</span>
                  <span className="text-gray-600 ml-2">{evaluaciones.length}/3</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Mi evaluación:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    yaEvalue ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {yaEvalue ? 'Completada' : 'Pendiente'}
                  </span>
                </div>
                {calcularPromedioTribunal() && (
                  <div>
                    <span className="font-medium text-gray-900">Promedio actual:</span>
                    <span className="text-blue-600 font-bold ml-2">{calcularPromedioTribunal()}/10</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'evaluacion', name: 'Mi Evaluación', icon: '⭐' },
              { id: 'resumen', name: 'Resumen de Evaluaciones', icon: '📊' },
              { id: 'tfg', name: 'Información del TFG', icon: '📄' },
              { id: 'tribunal', name: 'Mi Tribunal', icon: '👥' },
              ...(defensa?.estado === 'completada' ? [{ id: 'acta', name: 'Acta de Defensa', icon: '📋' }] : [])
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
                  Mi Evaluación del TFG
                </h3>
                <div className="flex items-center space-x-4">
                  {yaEvalue && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      ✅ Ya evaluado
                    </span>
                  )}
                  {calcularMiCalificacion() && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Mi calificación</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {calcularMiCalificacion()}/10
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {!defensa && tribunal && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-yellow-600 text-xl mr-3">⚠️</span>
                    <div>
                      <h4 className="font-medium text-yellow-800">No hay defensa programada</h4>
                      <p className="text-sm text-yellow-700">
                        Este tribunal ({tribunal.nombre}) aún no tiene una defensa programada.
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        La evaluación estará disponible una vez que se programe una defensa.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {defensa && defensa.estado === 'programada' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Defensa programada</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Para poder calificar, primero marca la defensa como completada una vez que haya finalizado.
                      </p>
                    </div>
                    <button
                      onClick={handleMarcarCompletada}
                      disabled={cambiandoEstado}
                      className={`px-4 py-2 rounded-md font-medium ${
                        cambiandoEstado
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {cambiandoEstado ? 'Marcando...' : '✅ Marcar completada'}
                    </button>
                  </div>
                </div>
              )}

              {defensa && defensa.estado === 'completada' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'originalidad', nombre: 'Originalidad', descripcion: 'Innovación y creatividad del trabajo' },
                    { key: 'presentacion', nombre: 'Presentación', descripcion: 'Calidad de la exposición y defensa oral' },
                    { key: 'implementacion', nombre: 'Implementación', descripcion: 'Calidad técnica y desarrollo del proyecto' },
                    { key: 'contenido', nombre: 'Contenido', descripcion: 'Profundidad y rigor del contenido académico' },
                    { key: 'defensa', nombre: 'Defensa', descripcion: 'Respuestas a preguntas y dominio del tema' }
                  ].map((criterio) => (
                    <div key={criterio.key} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900">{criterio.nombre}</h4>
                        <p className="text-sm text-gray-600 mt-1">{criterio.descripcion}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Puntuación (0-10):</span>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={calificaciones[criterio.key] || ''}
                            onChange={(e) => {
                              const valor = e.target.value ? parseFloat(e.target.value) : null
                              setCalificaciones(prev => ({
                                ...prev,
                                [criterio.key]: valor
                              }))
                            }}
                            disabled={yaEvalue}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="0.0"
                          />
                        </div>

                        {/* Escala visual */}
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button
                              key={num}
                              onClick={() => {
                                if (!yaEvalue) {
                                  setCalificaciones(prev => ({
                                    ...prev,
                                    [criterio.key]: num
                                  }))
                                }
                              }}
                              disabled={yaEvalue}
                              className={`w-6 h-6 rounded text-xs transition-colors ${
                                calificaciones[criterio.key] === num
                                  ? 'bg-blue-500 text-white'
                                  : yaEvalue
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
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
              )}

              {defensa && (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Comentarios de Evaluación</h4>
                    <textarea
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      disabled={yaEvalue}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      rows={4}
                      placeholder="Comentarios adicionales sobre el trabajo y la defensa..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    {yaEvalue ? (
                      <div className="flex items-center text-green-600">
                        <span className="mr-2">✅</span>
                        <span>Evaluación completada</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleGuardarEvaluacion}
                        disabled={guardandoEvaluacion}
                        className={`px-6 py-2 rounded-md text-white font-medium ${
                          guardandoEvaluacion
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {guardandoEvaluacion ? 'Guardando...' : 'Guardar Evaluación'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: Resumen de Evaluaciones */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Resumen de Evaluaciones del Tribunal
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evaluador
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Presentación
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contenido
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Defensa
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nota Final
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tribunal?.miembrosConUsuario && tribunal.miembrosConUsuario.map((miembro) => {
                      const evaluacion = evaluaciones.find(ev => ev.evaluador?.id === miembro.id)
                      const esYo = miembro.esYo

                      return (
                        <tr key={miembro.id} className={esYo ? 'bg-blue-50' : ''}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">
                                {miembro.nombre}
                                {esYo && ' (Tú)'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {getRolIcon(miembro.rol)} {miembro.rol}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-900">
                              {evaluacion?.notaPresentacion ? parseFloat(evaluacion.notaPresentacion).toFixed(1) : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-900">
                              {evaluacion?.notaContenido ? parseFloat(evaluacion.notaContenido).toFixed(1) : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-900">
                              {evaluacion?.notaDefensa ? parseFloat(evaluacion.notaDefensa).toFixed(1) : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-bold text-blue-600">
                              {evaluacion?.notaFinal ? `${parseFloat(evaluacion.notaFinal).toFixed(1)}/10` : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              evaluacion ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {evaluacion ? '✅ Completada' : '⏳ Pendiente'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {calcularPromedioTribunal() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Calificación Final del Tribunal</h4>
                      <p className="text-sm text-blue-700">
                        Promedio de {evaluaciones.length} evaluación(es) completada(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">
                        {calcularPromedioTribunal()}/10
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Información del TFG */}
          {activeTab === 'tfg' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Información Detallada del TFG</h3>

              {(defensa && tfg) || (defensa && defensa.tfg) ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Información del Trabajo</h4>
                      <dl className="space-y-3 text-sm">
                        <div>
                          <dt className="font-medium text-gray-500">Título</dt>
                          <dd className="text-gray-900 mt-1">{tfg?.titulo || defensa?.tfg?.titulo || 'Sin título'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">Estudiante</dt>
                          <dd className="text-gray-900 mt-1">{tfg?.estudiante?.nombreCompleto || defensa?.tfg?.estudiante?.nombreCompleto || 'No disponible'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">Email del estudiante</dt>
                          <dd className="text-gray-900 mt-1">{tfg?.estudiante?.email || defensa?.tfg?.estudiante?.email || 'No disponible'}</dd>
                        </div>
                        {(tfg?.tutor || defensa?.tfg?.tutor) && (
                          <div>
                            <dt className="font-medium text-gray-500">Tutor</dt>
                            <dd className="text-gray-900 mt-1">{tfg?.tutor?.nombreCompleto || defensa?.tfg?.tutor?.nombreCompleto || 'No disponible'}</dd>
                          </div>
                        )}
                        {(tfg?.palabrasClave || defensa?.tfg?.palabrasClave) && (
                          <div>
                            <dt className="font-medium text-gray-500">Palabras clave</dt>
                            <dd className="text-gray-900 mt-1">{(tfg?.palabrasClave || defensa?.tfg?.palabrasClave || []).join(', ') || 'No disponible'}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Información de la Defensa</h4>
                      <dl className="space-y-3 text-sm">
                        <div>
                          <dt className="font-medium text-gray-500">Fecha de defensa</dt>
                          <dd className="text-gray-900 mt-1">
                            {defensa.fechaDefensa ? new Date(defensa.fechaDefensa).toLocaleString('es-ES') : 'No programada'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">Aula</dt>
                          <dd className="text-gray-900 mt-1">{defensa.aula || 'No especificada'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">Duración estimada</dt>
                          <dd className="text-gray-900 mt-1">{defensa.duracionEstimada || 30} minutos</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">Estado</dt>
                          <dd className="mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(defensa.estado)}`}>
                              {getEstadoLabel(defensa.estado)}
                            </span>
                          </dd>
                        </div>
                        {defensa.observaciones && (
                          <div>
                            <dt className="font-medium text-gray-500">Observaciones</dt>
                            <dd className="text-gray-900 mt-1">{defensa.observaciones}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {(tfg?.resumen || defensa?.tfg?.resumen) && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Resumen del TFG</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {tfg?.resumen || defensa?.tfg?.resumen}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No hay información del TFG</h4>
                  <p className="text-gray-500">
                    La información del TFG aparecerá aquí cuando esté disponible
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Mi Tribunal */}
          {activeTab === 'tribunal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Información del Tribunal</h3>

              {tribunal ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Información General</h4>
                      <dl className="space-y-3 text-sm">
                        <div>
                          <dt className="font-medium text-gray-500">Nombre</dt>
                          <dd className="text-gray-900 mt-1">{tribunal.nombre}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">Descripción</dt>
                          <dd className="text-gray-900 mt-1">{tribunal.descripcion || 'Sin descripción'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">Estado</dt>
                          <dd className="mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tribunal.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {tribunal.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">Creado</dt>
                          <dd className="text-gray-900 mt-1">
                            {tribunal.createdAt ? new Date(tribunal.createdAt).toLocaleDateString('es-ES') : 'No disponible'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Miembros del Tribunal</h4>
                      <div className="space-y-3">
                        {tribunal.miembrosConUsuario && tribunal.miembrosConUsuario.map((miembro) => (
                          <div key={miembro.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                            miembro.esYo ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{getRolIcon(miembro.rol)}</span>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {miembro.nombre}
                                  {miembro.esYo && <span className="text-blue-600"> (Tú)</span>}
                                </p>
                                <p className="text-sm text-gray-500">{miembro.email}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              miembro.rol === 'Presidente'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {miembro.rol}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Estadísticas del Tribunal</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-600">{tribunal.defensasProgramadasCount || 0}</div>
                        <div className="text-xs text-gray-500">Programadas</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-600">{tribunal.defensasCompletadasCount || 0}</div>
                        <div className="text-xs text-gray-500">Completadas</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-600">{tribunal.totalDefensas || 0}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {tribunal.cargaTrabajo?.porcentaje_completadas || 0}%
                        </div>
                        <div className="text-xs text-gray-500">Completado</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No hay información del tribunal</h4>
                  <p className="text-gray-500">
                    La información del tribunal aparecerá aquí cuando esté disponible
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Acta de Defensa */}
          {activeTab === 'acta' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Acta de Defensa
                </h3>
                <div className="flex items-center space-x-4">
                  {infoActa?.actaDisponible && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      ✅ Acta disponible
                    </span>
                  )}
                </div>
              </div>

              {cargandoActa ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando información del acta...</span>
                </div>
              ) : infoActa?.actaDisponible ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📋</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-green-800">Acta de Defensa Generada</h4>
                      <p className="text-green-600">
                        El acta oficial de la defensa ha sido generada automáticamente
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h5 className="font-medium text-gray-900 mb-2">Información del Acta</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Archivo:</span>
                          <span className="text-gray-900 font-medium">{infoActa.nombreArchivo}</span>
                        </div>
                        {infoActa.fechaGeneracion && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Generada:</span>
                            <span className="text-gray-900">
                              {new Date(infoActa.fechaGeneracion).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h5 className="font-medium text-gray-900 mb-2">Contenido del Acta</h5>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>• Información completa del TFG</div>
                        <div>• Composición del tribunal</div>
                        <div>• Calificaciones de todos los miembros</div>
                        <div>• Comentarios y observaciones</div>
                        <div>• Resultado final oficial</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={manejarDescargarActa}
                      className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      <span className="mr-2">📄</span>
                      Descargar Acta PDF
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-green-200">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Nota:</span> El acta se generó automáticamente cuando todos los miembros
                      del tribunal completaron sus evaluaciones. Contiene toda la información oficial de la defensa.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Acta no disponible</h4>
                  <p className="text-gray-500 mb-4">
                    El acta se generará automáticamente cuando todos los miembros del tribunal hayan completado sus evaluaciones.
                  </p>
                  {evaluaciones.length > 0 && (
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 font-medium">
                        Evaluaciones completadas: {evaluaciones.length}/3
                      </span>
                    </div>
                  )}
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