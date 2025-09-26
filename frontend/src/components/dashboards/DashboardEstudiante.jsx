import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTFGs } from '../../hooks/useTFGs'

function DashboardEstudiante({ user }) {
  const { obtenerMisTFGs, loading } = useTFGs()
  const [tfgPrincipal, setTfgPrincipal] = useState(null)

  // Cargar el TFG principal del estudiante
  useEffect(() => {
    const cargarTFG = async () => {
      try {
        const resultado = await obtenerMisTFGs()
        if (resultado.success && resultado.data?.length > 0) {
          // Tomar el primer TFG (más reciente)
          setTfgPrincipal(resultado.data[0])
        }
      } catch (error) {
        console.error('Error cargando TFG del dashboard:', error)
      }
    }

    cargarTFG()
  }, [])

  // Generar tareas pendientes basadas en el estado del TFG
  const tareasPendientes = (() => {
    if (!tfgPrincipal) return []

    const tareas = []

    switch (tfgPrincipal.estado) {
      case 'borrador':
        tareas.push({ id: 1, tarea: "Finalizar documento y enviarlo a revisión", urgencia: "alta" })
        break
      case 'revision':
        tareas.push({ id: 1, tarea: "Esperar feedback del tutor", urgencia: "media" })
        if (tfgPrincipal.comentarios > 0) {
          tareas.push({ id: 2, tarea: "Incorporar comentarios del tutor", urgencia: "alta" })
        }
        break
      case 'aprobado':
        tareas.push({ id: 1, tarea: "Preparar presentación para defensa", urgencia: "alta" })
        tareas.push({ id: 2, tarea: "Revisar formato final del documento", urgencia: "media" })
        break
      case 'defendido':
        tareas.push({ id: 1, tarea: "Entregar versión final corregida", urgencia: "baja" })
        break
    }

    return tareas
  })()

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

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'aprobado': return 'Aprobado para defensa'
      case 'revision': return 'En revisión'
      case 'rechazado': return 'Rechazado'
      case 'borrador': return 'Borrador'
      case 'defendido': return 'Defendido'
      default: return estado || 'Sin estado'
    }
  }

  const getUrgenciaColor = (urgencia) => {
    switch (urgencia) {
      case 'alta': return 'bg-red-100 text-red-800'
      case 'media': return 'bg-yellow-100 text-yellow-800'
      case 'baja': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Hola, {user?.nombre || user?.nombreCompleto || 'Estudiante'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona tu Trabajo de Fin de Grado y sigue su progreso
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📄</span>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Estado del TFG
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {tfgPrincipal ? getEstadoLabel(tfgPrincipal.estado) : 'Sin TFG'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tutor Asignado
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {tfgPrincipal?.tutor?.apellidos
                      ? `${tfgPrincipal.tutor.nombre} ${tfgPrincipal.tutor.apellidos}`
                      : tfgPrincipal?.tutor?.nombre || 'No asignado'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Comentarios
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {tfgPrincipal?.comentarios || 0} nuevos
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Próxima Defensa
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {tfgPrincipal?.proxima_defensa || 'Pendiente'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Estado del TFG */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Mi TFG</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {tfgPrincipal ? (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {tfgPrincipal.titulo}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <span>Creado: {(() => {
                          if (!tfgPrincipal.createdAt) return 'Fecha no disponible'
                          const date = new Date(tfgPrincipal.createdAt)
                          return isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-ES')
                        })()}</span>
                        <span>•</span>
                        <span>Tutor: {tfgPrincipal.tutor?.apellidos
                          ? `${tfgPrincipal.tutor.nombre} ${tfgPrincipal.tutor.apellidos}`
                          : tfgPrincipal.tutor?.nombre || 'No asignado'}</span>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getEstadoColor(tfgPrincipal.estado)}`}>
                        {getEstadoLabel(tfgPrincipal.estado)}
                      </span>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No tienes ningún TFG subido
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Sube tu Trabajo de Fin de Grado para comenzar el proceso
                      </p>
                      <Link
                        to="/estudiante/subir-tfg"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                      >
                        Subir TFG
                      </Link>
                    </div>
                  )}
                </div>
                {tfgPrincipal && (
                  <div className="flex flex-col space-y-2 ml-4">
                    <Link
                      to="/estudiante/mis-tfgs"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                )}
              </div>

              {tfgPrincipal?.comentarios > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-blue-400 text-lg">💬</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">
                        Tienes {tfgPrincipal.comentarios} comentarios nuevos de tu tutor
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Revisa los comentarios para continuar con el proceso.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tareas pendientes */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Tareas Pendientes</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {tareasPendientes.length > 0 ? (
                  tareasPendientes.map((tarea) => (
                    <div key={tarea.id} className="flex items-start space-x-3">
                      <input type="checkbox" className="mt-1 h-4 w-4 text-blue-600 rounded" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{tarea.tarea}</p>
                        <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getUrgenciaColor(tarea.urgencia)}`}>
                          {tarea.urgencia}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">No tienes tareas pendientes</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Link 
                  to="/estudiante/mis-tfgs"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver mi TFG →
                </Link>
              </div>
            </div>
          </div>

          {/* Próximos pasos */}
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Próximos Pasos</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Incorporar feedback del tutor</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Aprobación final</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Programar defensa</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Defensa oral</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardEstudiante