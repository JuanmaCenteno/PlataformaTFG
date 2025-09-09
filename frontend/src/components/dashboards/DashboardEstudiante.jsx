import { Link } from 'react-router-dom'

function DashboardEstudiante({ user }) {
  // Datos simulados del estudiante
  const estadoTFG = {
    titulo: "Sistema de Gestión de TFGs con React y Symfony",
    estado: "En revisión",
    tutor: "Dr. María García",
    fechaSubida: "15 de Enero, 2025",
    comentarios: 2,
    proximaDefensa: null
  }

  const tareasPendientes = [
    { id: 1, tarea: "Incorporar comentarios del tutor", urgencia: "alta" },
    { id: 2, tarea: "Revisar formato de bibliografía", urgencia: "media" },
    { id: 3, tarea: "Preparar presentación para defensa", urgencia: "baja" }
  ]

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Aprobado': return 'bg-green-100 text-green-800 border-green-200'
      case 'En revisión': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Rechazado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
          Aquí tienes un resumen de tu progreso con el TFG
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
                    {estadoTFG.estado}
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
                    {estadoTFG.tutor}
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
                    {estadoTFG.comentarios} nuevos
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
                    {estadoTFG.proximaDefensa || 'Pendiente'}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {estadoTFG.titulo}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span>Subido: {estadoTFG.fechaSubida}</span>
                    <span>•</span>
                    <span>Tutor: {estadoTFG.tutor}</span>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getEstadoColor(estadoTFG.estado)}`}>
                    {estadoTFG.estado}
                  </span>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <Link 
                    to="/estudiante/mis-tfgs"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    Ver Detalles
                  </Link>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200">
                    Descargar
                  </button>
                </div>
              </div>

              {estadoTFG.comentarios > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-blue-400 text-lg">💬</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">
                        Tienes {estadoTFG.comentarios} comentarios nuevos de tu tutor
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
                {tareasPendientes.map((tarea) => (
                  <div key={tarea.id} className="flex items-start space-x-3">
                    <input type="checkbox" className="mt-1 h-4 w-4 text-blue-600 rounded" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{tarea.tarea}</p>
                      <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getUrgenciaColor(tarea.urgencia)}`}>
                        {tarea.urgencia}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Link 
                  to="/estudiante/mis-tfgs"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver todas las tareas →
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