import { useState, useEffect } from 'react'
import { useDefensas } from '../../hooks/useDefensas'
import { useTFGs } from '../../hooks/useTFGs'
import { useNotificaciones } from '../../context/NotificacionesContext'
import ActaDownload from '../../components/ActaDownload'

function MiDefensa() {
  const [defensa, setDefensa] = useState(null)
  const [tfg, setTfg] = useState(null)
  const [tribunal, setTribunal] = useState(null)
  const [estadoDefensa, setEstadoDefensa] = useState('sin_programar')

  const { obtenerMiDefensa, obtenerInfoActa, descargarActa, loading: loadingDefensa } = useDefensas()
  const { obtenerMisTFGs, loading: loadingTFG } = useTFGs()
  const { mostrarNotificacion } = useNotificaciones()

  // Estado para el acta
  const [infoActa, setInfoActa] = useState(null)
  const [cargandoActa, setCargandoActa] = useState(false)

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Primero obtenemos los TFGs del estudiante
        const resultadoTFGs = await obtenerMisTFGs()
        if (resultadoTFGs.success && resultadoTFGs.data.length > 0) {
          // Buscar TFG en orden de prioridad: defendido > aprobado > más reciente
          const tfgDefendido = resultadoTFGs.data.find(t => t.estado === 'defendido')
          const tfgAprobado = resultadoTFGs.data.find(t => t.estado === 'aprobado')
          const tfgActual = tfgDefendido || tfgAprobado || resultadoTFGs.data[0]

          setTfg(tfgActual)


          // Si el TFG está aprobado o defendido, intentamos obtener la defensa
          if (tfgActual.estado === 'aprobado' || tfgActual.estado === 'defendido') {
            const resultadoDefensa = await obtenerMiDefensa()
            if (resultadoDefensa.success) {
              setDefensa(resultadoDefensa.data)

              // Si la defensa incluye información del TFG actualizada, usarla
              // pero mantener la del endpoint mis-tfgs que tiene la calificación
              let tfgFinal = tfgActual
              if (resultadoDefensa.data.tfg) {
                // Merge de datos: priorizar los datos de mis-tfgs (más completos)
                tfgFinal = {
                  ...tfgActual, // Usar como base los datos de mis-tfgs
                  ...resultadoDefensa.data.tfg, // Sobrescribir con datos de defensa si existen
                  calificacion: tfgActual.calificacion || resultadoDefensa.data.tfg.calificacion, // Priorizar calificación de mis-tfgs
                  estado: tfgActual.estado || resultadoDefensa.data.tfg.estado // Priorizar estado de mis-tfgs
                }
                setTfg(tfgFinal)
              }

              // Determinar estado basándose tanto en TFG como en defensa
              if (tfgFinal.estado === 'defendido') {
                setEstadoDefensa('defendido')
              } else if (resultadoDefensa.data.estado === 'completada') {
                setEstadoDefensa('defendido') // Si la defensa está completada, se considera defendido
              } else {
                setEstadoDefensa(resultadoDefensa.data.estado || 'programada')
              }

              // Si hay tribunal asignado en la defensa, usamos esa información
              if (resultadoDefensa.data.tribunal) {
                setTribunal(resultadoDefensa.data.tribunal)
              }
            } else {
              // No hay defensa programada
              if (tfgActual.estado === 'defendido') {
                // Caso extraño: TFG defendido pero sin defensa encontrada
                setEstadoDefensa('defendido')
              } else {
                // TFG aprobado pero sin defensa programada
                setEstadoDefensa('pendiente_programacion')
              }
            }
          } else {
            setEstadoDefensa('tfg_no_aprobado')
          }
        } else {
          setEstadoDefensa('sin_tfg')
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
        mostrarNotificacion('Error al cargar información de la defensa', 'error')
      }
    }

    cargarDatos()
  }, [])

  // Función para cargar información del acta
  const cargarInfoActa = async (defensaId) => {
    if (!defensaId) return

    setCargandoActa(true)
    try {
      const resultado = await obtenerInfoActa(defensaId)
      if (resultado.success) {
        setInfoActa(resultado.data)
      }
    } catch (error) {
      console.warn('Error al cargar información del acta:', error)
    } finally {
      setCargandoActa(false)
    }
  }

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

  // Cargar información del acta cuando la defensa esté lista
  useEffect(() => {
    if (defensa && defensa.id && estadoDefensa === 'defendido') {
      cargarInfoActa(defensa.id)
    }
  }, [defensa, estadoDefensa])

  const getEstadoTFGTexto = (estado) => {
    const estadosTexto = {
      'borrador': 'Borrador',
      'en_revision': 'En Revisión',
      'aprobado': 'Aprobado',
      'defendido': 'Defendido',
      'completado': 'Completado'
    }
    return estadosTexto[estado] || estado.charAt(0).toUpperCase() + estado.slice(1)
  }

  const getEstadoInfo = () => {
    switch (estadoDefensa) {
      case 'sin_tfg':
        return {
          color: 'bg-gray-50 border-gray-200',
          icon: '📝',
          iconColor: 'text-gray-400',
          titulo: 'Sin TFG',
          mensaje: 'Aún no has subido tu Trabajo de Fin de Grado.'
        }
      case 'tfg_no_aprobado':
        return {
          color: 'bg-blue-50 border-blue-200',
          icon: '⏳',
          iconColor: 'text-blue-400',
          titulo: 'TFG en Proceso',
          mensaje: 'Tu TFG está en revisión. La defensa se programará una vez que sea aprobado.'
        }
      case 'pendiente_programacion':
        return {
          color: 'bg-yellow-50 border-yellow-200',
          icon: '⏰',
          iconColor: 'text-yellow-400',
          titulo: 'Pendiente de Programación',
          mensaje: 'Tu TFG ha sido aprobado y está esperando asignación de fecha de defensa.'
        }
      case 'programada':
        return {
          color: 'bg-green-50 border-green-200',
          icon: '📅',
          iconColor: 'text-green-400',
          titulo: 'Defensa Programada',
          mensaje: 'Tu defensa ha sido programada. Revisa los detalles a continuación.'
        }
      case 'completada':
      case 'defendido':
        // Si tenemos calificación disponible, mostrarla
        const tieneCalificacion = tfg?.calificacion && tfg.calificacion.toString().trim() !== ''
        return {
          color: 'bg-green-50 border-green-200',
          icon: '🏆',
          iconColor: 'text-green-400',
          titulo: '¡TFG Defendido Exitosamente!',
          mensaje: tieneCalificacion
            ? `Has completado tu Trabajo de Fin de Grado con una calificación de ${tfg.calificacion}/10.`
            : 'Has defendido exitosamente tu TFG. La calificación se publicará pronto.'
        }
      default:
        return {
          color: 'bg-gray-50 border-gray-200',
          icon: '❓',
          iconColor: 'text-gray-400',
          titulo: 'Estado Desconocido',
          mensaje: 'No se pudo determinar el estado de tu defensa.'
        }
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Por determinar'
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const estadoInfo = getEstadoInfo()

  if (loadingDefensa || loadingTFG) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información de la defensa...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Defensa</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado de la Defensa</h2>
          <div className={`${estadoInfo.color} border rounded-md p-4`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <span className={`${estadoInfo.iconColor} text-lg`}>{estadoInfo.icon}</span>
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${estadoInfo.iconColor.replace('text-', 'text-')}-800`}>
                  {estadoInfo.titulo}
                </h3>
                <p className={`text-sm ${estadoInfo.iconColor.replace('text-', 'text-')}-700 mt-1`}>
                  {estadoInfo.mensaje}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Información del TFG</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Título</dt>
                <dd className="text-sm text-gray-900">
                  {tfg?.titulo || 'No disponible'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tutor</dt>
                <dd className="text-sm text-gray-900">
                  {tfg?.tutor?.nombreCompleto || 'No asignado'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd className="text-sm text-gray-900">
                  {tfg?.estado ?
                    getEstadoTFGTexto(tfg.estado) :
                    (estadoDefensa === 'defendido' ? 'Defendido' : 'No disponible')
                  }
                </dd>
              </div>
              {tfg?.area && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Área</dt>
                  <dd className="text-sm text-gray-900">{tfg.area}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {tribunal ? 'Tribunal Asignado' : 'Tribunal'}
            </h3>
            {tribunal ? (
              <div className="text-sm text-gray-600 space-y-2">
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-2">{tribunal.nombre}</h4>
                </div>
                {tribunal.miembrosInfo?.presidente && (
                  <p><strong>Presidente:</strong> {tribunal.miembrosInfo.presidente.nombre_completo}</p>
                )}
                {tribunal.miembrosInfo?.secretario && (
                  <p><strong>Secretario:</strong> {tribunal.miembrosInfo.secretario.nombre_completo}</p>
                )}
                {tribunal.miembrosInfo?.vocal && (
                  <p><strong>Vocal:</strong> {tribunal.miembrosInfo.vocal.nombre_completo}</p>
                )}
                {tribunal.miembrosInfo?.suplente && (
                  <p><strong>Suplente:</strong> {tribunal.miembrosInfo.suplente.nombre_completo}</p>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                <p>Tribunal aún no asignado</p>
                <p className="mt-1">Se asignará cuando se programe la defensa</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información de la defensa si está programada */}
      {defensa && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Detalles de la Defensa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha y Hora</dt>
                  <dd className="text-sm text-gray-900 font-medium">
                    {formatearFecha(defensa.fechaDefensa)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Duración Estimada</dt>
                  <dd className="text-sm text-gray-900">
                    {defensa.duracion_minutos || 45} minutos
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                  <dd className="text-sm text-gray-900">
                    {defensa.aula || 'Por determinar'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Modalidad</dt>
                  <dd className="text-sm text-gray-900">
                    {defensa.modalidad || 'Presencial'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {defensa.observaciones && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <dt className="text-sm font-medium text-gray-500 mb-2">Observaciones</dt>
              <dd className="text-sm text-gray-700">
                {defensa.observaciones}
              </dd>
            </div>
          )}
        </div>
      )}

      {/* Checklist de preparación */}
      {(estadoDefensa === 'programada' || estadoDefensa === 'pendiente_programacion') && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Preparación para la Defensa</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <input type="checkbox" className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Revisar presentación</p>
                <p className="text-xs text-gray-500">Prepara una presentación de 10-15 minutos</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <input type="checkbox" className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Documentación completa</p>
                <p className="text-xs text-gray-500">Asegúrate de que toda la documentación está actualizada</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <input type="checkbox" className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Demostración técnica</p>
                <p className="text-xs text-gray-500">Prepara una demostración del sistema funcionando</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <input type="checkbox" className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Posibles preguntas</p>
                <p className="text-xs text-gray-500">Anticipa preguntas sobre metodología, resultados y conclusiones</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultados de la defensa */}
      {(estadoDefensa === 'completada' || estadoDefensa === 'defendido' || tfg?.estado === 'defendido') && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-green-500 mr-2">🎓</span>
            Resultado de la Defensa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calificación Final */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
              <div className="mb-4">
                <span className="text-4xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Calificación Final</h3>
              {(tfg?.calificacion && tfg.calificacion.toString().trim() !== '') ? (
                <div>
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {tfg.calificacion}/10
                  </div>
                  <div className="text-sm text-green-600">
                    {parseFloat(tfg.calificacion) >= 9 ? 'Sobresaliente' :
                     parseFloat(tfg.calificacion) >= 7 ? 'Notable' :
                     parseFloat(tfg.calificacion) >= 5 ? 'Aprobado' : 'Suspenso'}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-lg text-green-600 mb-2">Pendiente</div>
                  <div className="text-sm text-green-500">Se publicará pronto</div>
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Defensa completada</p>
                  <p className="text-xs text-gray-500">
                    {defensa?.fechaDefensa ? formatearFecha(defensa.fechaDefensa) : 'Fecha no disponible'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-green-500">🎯</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">TFG finalizado</p>
                  <p className="text-xs text-gray-500">Todos los requisitos académicos cumplidos</p>
                </div>
              </div>

              {tribunal && (
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">👥</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Evaluado por</p>
                    <p className="text-xs text-gray-500">{tribunal.nombre}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sección del Acta de Defensa */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="text-blue-500 mr-2">📋</span>
              Acta de Defensa
            </h3>

            <ActaDownload
              defensaId={defensa?.id}
              defensa={defensa}
              tfg={tfg}
              userRole="estudiante"
              showPreview={true}
              size="md"
            />
          </div>

          {/* Mensaje final */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                🎉 ¡Felicitaciones por completar tu TFG!
              </h4>
              <p className="text-sm text-blue-700">
                Has finalizado exitosamente una etapa importante de tu formación académica.
                Este logro representa tu dedicación, esfuerzo y conocimientos adquiridos durante tus estudios.
              </p>
              {(tfg?.calificacion && tfg.calificacion.toString().trim() !== '') && (
                <p className="text-sm text-blue-600 mt-2 font-medium">
                  Tu trabajo ha sido valorado con una puntuación de {tfg.calificacion}/10
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MiDefensa