import { useState, useEffect } from 'react'
import { useDefensas } from '../hooks/useDefensas'
import { useNotificaciones } from '../context/NotificacionesContext'

/**
 * Componente reutilizable para mostrar y descargar actas de defensa
 * @param {Object} props
 * @param {number} props.defensaId - ID de la defensa
 * @param {Object} props.defensa - Objeto de defensa (opcional)
 * @param {Object} props.tfg - Objeto de TFG (opcional)
 * @param {string} props.userRole - Rol del usuario actual
 * @param {boolean} props.showPreview - Mostrar vista previa (default: true)
 * @param {string} props.size - Tamaño del componente ('sm', 'md', 'lg')
 */
function ActaDownload({
  defensaId,
  defensa = null,
  tfg = null,
  userRole = 'estudiante',
  showPreview = true,
  size = 'md'
}) {
  const [infoActa, setInfoActa] = useState(null)
  const [cargandoActa, setCargandoActa] = useState(false)
  const [mostrarModal, setMostrarModal] = useState(false)

  const { obtenerInfoActa, descargarActa } = useDefensas()
  const { mostrarNotificacion } = useNotificaciones()

  // Cargar información del acta
  useEffect(() => {
    if (defensaId && (defensa?.estado === 'completada' || tfg?.estado === 'defendido')) {
      cargarInfoActa()
    }
  }, [defensaId, defensa?.estado, tfg?.estado])

  const cargarInfoActa = async () => {
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

  const manejarDescargarActa = async () => {
    try {
      const resultado = await descargarActa(defensaId)
      if (resultado.success) {
        mostrarNotificacion('Acta descargada correctamente', 'success')
      } else {
        mostrarNotificacion(resultado.error || 'Error al descargar el acta', 'error')
      }
    } catch {
      mostrarNotificacion('Error al descargar el acta', 'error')
    }
  }

  const obtenerConfiguracionTamaño = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          title: 'text-sm font-semibold',
          button: 'px-3 py-1 text-xs',
          icon: 'text-base',
          spacing: 'space-y-2',
          layout: 'compact'
        }
      case 'lg':
        return {
          container: 'p-8',
          title: 'text-xl font-bold',
          button: 'px-6 py-3 text-base',
          icon: 'text-3xl',
          spacing: 'space-y-6',
          layout: 'full'
        }
      default: // md
        return {
          container: 'p-6',
          title: 'text-lg font-semibold',
          button: 'px-4 py-2 text-sm',
          icon: 'text-2xl',
          spacing: 'space-y-4',
          layout: 'full'
        }
    }
  }

  const config = obtenerConfiguracionTamaño()

  if (cargandoActa) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${config.container}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Verificando disponibilidad del acta...</span>
        </div>
      </div>
    )
  }

  if (!infoActa?.actaDisponible) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg ${config.container} text-center`}>
        <div className={`${config.icon} mb-3`}>⏳</div>
        <h4 className={`${config.title} text-gray-900 mb-2`}>Acta en proceso</h4>
        <p className="text-gray-600 text-sm">
          El acta se generará automáticamente cuando todos los miembros del tribunal completen sus evaluaciones.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={`bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg ${config.container}`}>
        {config.layout === 'compact' ? (
          // Layout compacto para tamaño small (usado en tablas)
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className={config.icon}>📋</span>
                </div>
              </div>
              <div>
                <h4 className={`${config.title} text-green-800`}>Acta Disponible</h4>
                {showPreview && (
                  <p className="text-green-600 text-xs">
                    Lista para descarga
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-1">
              {showPreview && (
                <button
                  onClick={() => setMostrarModal(true)}
                  className={`inline-flex items-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors duration-200 ${config.button}`}
                  title="Vista previa"
                >
                  <span className="mr-1">👁️</span>
                  <span className="hidden sm:inline">Vista</span>
                </button>
              )}
              <button
                onClick={manejarDescargarActa}
                className={`inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors duration-200 ${config.button}`}
                title="Descargar PDF"
              >
                <span className="mr-1">📄</span>
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        ) : (
          // Layout completo para tamaños medium y large
          <div className={`flex items-center justify-between mb-4`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className={config.icon}>📋</span>
                </div>
              </div>
              <div>
                <h4 className={`${config.title} text-green-800`}>Acta Oficial Disponible</h4>
                <p className="text-green-600 text-sm">
                  {userRole === 'admin'
                    ? 'Acta de defensa generada y disponible para descarga'
                    : 'Tu acta de defensa ha sido generada y está lista para descarga'
                  }
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              {showPreview && (
                <button
                  onClick={() => setMostrarModal(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 text-sm"
                >
                  <span className="mr-1">👁️</span>
                  Vista previa
                </button>
              )}
              <button
                onClick={manejarDescargarActa}
                className={`inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 ${config.button}`}
              >
                <span className="mr-2">📄</span>
                Descargar PDF
              </button>
            </div>
          </div>
        )}

        {config.layout !== 'compact' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h5 className="font-medium text-gray-900 mb-2">Información del Documento</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="text-gray-900 font-medium">Acta Oficial de Defensa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TFG:</span>
                    <span className="text-gray-900 font-medium text-xs">
                      {tfg?.titulo || defensa?.tfg?.titulo || 'No disponible'}
                    </span>
                  </div>
                  {infoActa.fechaGeneracion && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generada:</span>
                      <span className="text-gray-900">
                        {new Date(infoActa.fechaGeneracion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h5 className="font-medium text-gray-900 mb-2">Contenido Incluido</h5>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Información completa del TFG</div>
                  <div>• Datos del tribunal evaluador</div>
                  <div>• Calificaciones detalladas</div>
                  <div>• Comentarios y observaciones</div>
                  <div>• Resultado oficial final</div>
                  <div>• Firmas del tribunal</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm text-green-700">
                <span className="font-medium">💡 Importante:</span> Este documento es {userRole === 'admin' ? 'el acta oficial' : 'tu acta oficial'} de defensa.
                {userRole !== 'admin' && ' Consérvala como comprobante de haber completado exitosamente tu TFG.'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal de vista previa */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Vista Previa del Acta</h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    UNIVERSIDAD DE CÁDIZ - ACTA DE DEFENSA DE TFG
                  </h4>
                  <p className="text-gray-600">Vista previa del documento oficial</p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>TFG:</strong> {tfg?.titulo || defensa?.tfg?.titulo || 'No disponible'}
                    </div>
                    <div>
                      <strong>Estudiante:</strong> {tfg?.estudiante?.nombreCompleto || defensa?.tfg?.estudiante?.nombreCompleto || 'No disponible'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Fecha:</strong> {defensa?.fechaDefensa ? new Date(defensa.fechaDefensa).toLocaleDateString('es-ES') : 'No disponible'}
                    </div>
                    <div>
                      <strong>Calificación:</strong> {tfg?.calificacion ? `${tfg.calificacion}/10` : 'No disponible'}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-blue-700">
                      📄 Para ver el contenido completo del acta, descarga el documento PDF
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setMostrarModal(false)
                  manejarDescargarActa()
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ActaDownload