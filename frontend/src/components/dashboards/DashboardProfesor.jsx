import { Link } from 'react-router-dom'

function DashboardProfesor({ user }) {
  // Datos simulados del profesor
  const estadisticas = {
    tfgsAsignados: 8,
    tfgsPendientes: 3,
    tribunalesActivos: 2,
    proximasDefensas: 4
  }

  const tfgsRecientes = [
    { 
      id: 1, 
      titulo: "Sistema de Gestión de TFGs", 
      estudiante: "Juan Pérez", 
      estado: "En revisión",
      fechaActualizacion: "Hace 2 días",
      requiereAccion: true
    },
    { 
      id: 2, 
      titulo: "App Móvil para Delivery", 
      estudiante: "María Silva", 
      estado: "Aprobado",
      fechaActualizacion: "Hace 1 semana",
      requiereAccion: false
    },
    { 
      id: 3, 
      titulo: "IA para Diagnóstico Médico", 
      estudiante: "Carlos Ruiz", 
      estado: "Borrador",
      fechaActualizacion: "Hace 3 días",
      requiereAccion: false
    }
  ]

  const proximasDefensas = [
    { 
      id: 1, 
      estudiante: "Ana López", 
      fecha: "15 Feb 2025", 
      hora: "10:00", 
      rol: "Presidente",
      sala: "Aula 301"
    },
    { 
      id: 2, 
      estudiante: "Pedro García", 
      fecha: "17 Feb 2025", 
      hora: "12:00", 
      rol: "Vocal",
      sala: "Aula 205"
    }
  ]

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Aprobado': return 'bg-green-100 text-green-800'
      case 'En revisión': return 'bg-yellow-100 text-yellow-800'
      case 'Borrador': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRolColor = (rol) => {
    switch (rol) {
      case 'Presidente': return 'bg-blue-100 text-blue-800'
      case 'Vocal': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.nombre || user?.nombreCompleto || 'Profesor'} 👨‍🏫
        </h1>
        <p className="text-gray-600 mt-2">
          Panel de control para la gestión de TFGs y tribunales
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    TFGs Asignados
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {estadisticas.tfgsAsignados}
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
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pendientes de Revisión
                  </dt>
                  <dd className="text-2xl font-bold text-orange-600">
                    {estadisticas.tfgsPendientes}
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
                <span className="text-2xl">⚖️</span>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tribunales Activos
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {estadisticas.tribunalesActivos}
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
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Próximas Defensas
                  </dt>
                  <dd className="text-2xl font-bold text-blue-600">
                    {estadisticas.proximasDefensas}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TFGs que requieren atención */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">TFGs Recientes</h2>
              <Link 
                to="/profesor/tfgs-asignados"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todos
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {tfgsRecientes.map((tfg) => (
                <div key={tfg.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-base font-medium text-gray-900">
                          {tfg.titulo}
                        </h3>
                        {tfg.requiereAccion && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Requiere atención
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Estudiante: <span className="font-medium">{tfg.estudiante}</span>
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(tfg.estado)}`}>
                          {tfg.estado}
                        </span>
                        <span className="text-xs text-gray-500">
                          {tfg.fechaActualizacion}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Revisar
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">
                        Descargar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-6">
          {/* Próximas defensas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Próximas Defensas</h2>
              <Link 
                to="/profesor/calendario"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Ver calendario
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {proximasDefensas.map((defensa) => (
                  <div key={defensa.id} className="border-l-4 border-blue-400 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {defensa.estudiante}
                        </p>
                        <p className="text-xs text-gray-500">
                          {defensa.fecha} - {defensa.hora}
                        </p>
                        <p className="text-xs text-gray-500">
                          {defensa.sala}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRolColor(defensa.rol)}`}>
                        {defensa.rol}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link 
                to="/profesor/tfgs-asignados"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
              >
                📚 Revisar TFGs
              </Link>
              <Link 
                to="/profesor/tribunales"
                className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-md hover:bg-purple-700 text-sm"
              >
                ⚖️ Gestionar Tribunales
              </Link>
              <Link 
                to="/profesor/calendario"
                className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 text-sm"
              >
                📅 Ver Calendario
              </Link>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Nuevo TFG subido</p>
                    <p className="text-xs text-gray-500">Juan Pérez - Hace 2 horas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Defensa programada</p>
                    <p className="text-xs text-gray-500">Ana López - 15 Feb</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardProfesor