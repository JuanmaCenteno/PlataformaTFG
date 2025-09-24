import { useState, useEffect } from 'react'
import { useDefensas } from '../../hooks/useDefensas'
import { useTFGs } from '../../hooks/useTFGs'
import { useTribunales } from '../../hooks/useTribunales'
import { useNotificaciones } from '../../context/NotificacionesContext'

function MiDefensa() {
  const [defensa, setDefensa] = useState(null)
  const [tfg, setTfg] = useState(null)
  const [tribunal, setTribunal] = useState(null)
  const [estadoDefensa, setEstadoDefensa] = useState('sin_programar')

  const { obtenerMiDefensa, loading: loadingDefensa } = useDefensas()
  const { obtenerMisTFGs, loading: loadingTFG } = useTFGs()
  const { obtenerMiembrosTribunal, loading: loadingTribunal } = useTribunales()
  const { mostrarNotificacion } = useNotificaciones()

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Primero obtenemos los TFGs del estudiante
        const resultadoTFGs = await obtenerMisTFGs()
        if (resultadoTFGs.success && resultadoTFGs.data.length > 0) {
          // Tomamos el TFG más reciente o el aprobado
          const tfgAprobado = resultadoTFGs.data.find(t => t.estado === 'aprobado') || resultadoTFGs.data[0]
          setTfg(tfgAprobado)

          // Si el TFG está aprobado, intentamos obtener la defensa
          if (tfgAprobado.estado === 'aprobado' || tfgAprobado.estado === 'defendido') {
            const resultadoDefensa = await obtenerMiDefensa()
            if (resultadoDefensa.success) {
              setDefensa(resultadoDefensa.data)
              setEstadoDefensa(resultadoDefensa.data.estado || 'programada')

              // Si hay tribunal asignado, obtenemos los miembros
              if (resultadoDefensa.data.tribunal_id) {
                const resultadoTribunal = await obtenerMiembrosTribunal(resultadoDefensa.data.tribunal_id)
                if (resultadoTribunal.success) {
                  setTribunal(resultadoTribunal.data)
                }
              }
            } else {
              // No hay defensa programada pero el TFG está aprobado
              setEstadoDefensa('pendiente_programacion')
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
        return {
          color: 'bg-blue-50 border-blue-200',
          icon: '🎯',
          iconColor: 'text-blue-400',
          titulo: 'Defensa Completada',
          mensaje: 'Has defendido exitosamente tu TFG. ¡Felicitaciones!'
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

  if (loadingDefensa || loadingTFG || loadingTribunal) {
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
                    tfg.estado.charAt(0).toUpperCase() + tfg.estado.slice(1) :
                    'No disponible'
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
                {tribunal.presidente && (
                  <p><strong>Presidente:</strong> {tribunal.presidente.nombre} {tribunal.presidente.apellidos}</p>
                )}
                {tribunal.secretario && (
                  <p><strong>Secretario:</strong> {tribunal.secretario.nombre} {tribunal.secretario.apellidos}</p>
                )}
                {tribunal.vocal && (
                  <p><strong>Vocal:</strong> {tribunal.vocal.nombre} {tribunal.vocal.apellidos}</p>
                )}
                {tribunal.suplente && (
                  <p><strong>Suplente:</strong> {tribunal.suplente.nombre} {tribunal.suplente.apellidos}</p>
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
                    {formatearFecha(defensa.fecha_hora)}
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
    </div>
  )
}

export default MiDefensa