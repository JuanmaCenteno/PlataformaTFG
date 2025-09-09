import { Link } from 'react-router-dom'

function DashboardAdmin({ user }) {
  // Datos simulados del sistema
  const estadisticasGenerales = {
    totalUsuarios: 324,
    totalTFGs: 89,
    defensasProgramadas: 12,
    tribunalesActivos: 8
  }

  const estadisticasTFGs = {
    enRevision: 15,
    aprobados: 45,
    defendidos: 29,
    borradores: 12
  }

  const actividadReciente = [
    { tipo: 'tfg_subido', descripcion: 'Juan Pérez subió nuevo TFG', tiempo: 'Hace 30 min' },
    { tipo: 'defensa_programada', descripcion: 'Defensa programada para Ana López', tiempo: 'Hace 1 hora' },
    { tipo: 'usuario_creado', descripcion: 'Nuevo profesor registrado: Dr. Carlos López', tiempo: 'Hace 2 horas' },
    { tipo: 'tfg_aprobado', descripcion: 'TFG de María Silva aprobado', tiempo: 'Hace 4 horas' }
  ]

  const alertas = [
    { tipo: 'warning', mensaje: '3 TFGs llevan más de 2 semanas en revisión', urgencia: 'media' },
    { tipo: 'info', mensaje: 'Backup programado para esta noche', urgencia: 'baja' },
    { tipo: 'error', mensaje: 'Fallo en el envío de notificaciones', urgencia: 'alta' }
  ]

  const getIconoActividad = (tipo) => {
    switch (tipo) {
      case 'tfg_subido': return '📄'
      case 'defensa_programada': return '📅'
      case 'usuario_creado': return '👤'
      case 'tfg_aprobado': return '✅'
      default: return '📌'
    }
  }

  const getColorAlerta = (tipo, urgencia) => {
    if (urgencia === 'alta') return 'bg-red-100 text-red-800 border-red-200'
    if (urgencia === 'media') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel de Administración 🛠️
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.nombre || user?.nombreCompleto || 'Administrador'}. Control general del sistema TFG
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Usuarios
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {estadisticasGenerales.totalUsuarios}
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
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total TFGs
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {estadisticasGenerales.totalTFGs}
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
                    Defensas Programadas
                  </dt>
                  <dd className="text-2xl font-bold text-blue-600">
                    {estadisticasGenerales.defensasProgramadas}
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
                    {estadisticasGenerales.tribunalesActivos}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas del sistema */}
      {alertas.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas del Sistema</h2>
          <div className="space-y-3">
            {alertas.map((alerta, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getColorAlerta(alerta.tipo, alerta.urgencia)}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{alerta.mensaje}</p>
                  <button className="text-xs opacity-60 hover:opacity-100">
                    Descartar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Estadísticas de TFGs */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Estado de los TFGs</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {estadisticasTFGs.enRevision}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">En Revisión</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {estadisticasTFGs.aprobados}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Aprobados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {estadisticasTFGs.defendidos}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Defendidos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">
                    {estadisticasTFGs.borradores}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Borradores</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {actividadReciente.map((actividad, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">{getIconoActividad(actividad.tipo)}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{actividad.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-1">{actividad.tiempo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-6">
          {/* Acciones rápidas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Gestión Rápida</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link 
                to="/admin/usuarios"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
              >
                👥 Gestionar Usuarios
              </Link>
              <button className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 text-sm">
                📚 Ver Todos los TFGs
              </button>
              <button className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-md hover:bg-purple-700 text-sm">
                ⚖️ Configurar Tribunales
              </button>
              <button className="block w-full bg-orange-600 text-white text-center py-2 px-4 rounded-md hover:bg-orange-700 text-sm">
                📊 Generar Reportes
              </button>
            </div>
          </div>

          {/* Estadísticas del sistema */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Estado del Sistema</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Uso de almacenamiento</span>
                  <span className="text-sm font-medium text-gray-900">67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '67%'}}></div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-600">Usuarios activos hoy</span>
                  <span className="text-sm font-medium text-gray-900">84</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Último backup</span>
                  <span className="text-sm font-medium text-green-600">Hace 2 horas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración rápida */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Configuración</h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="block w-full text-left text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-2 rounded">
                ⚙️ Configuración general
              </button>
              <button className="block w-full text-left text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-2 rounded">
                📧 Configurar notificaciones
              </button>
              <button className="block w-full text-left text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-2 rounded">
                🔒 Gestión de permisos
              </button>
              <button className="block w-full text-left text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-2 rounded">
                💾 Configurar backups
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAdmin