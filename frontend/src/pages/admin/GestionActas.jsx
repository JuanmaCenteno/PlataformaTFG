import { useState, useEffect } from 'react'
import { useDefensas } from '../../hooks/useDefensas'
import { useNotificaciones } from '../../context/NotificacionesContext'
import ActaDownload from '../../components/ActaDownload'

function GestionActas() {
  const [defensas, setDefensas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    estado: 'todas',
    busqueda: '',
    fechaDesde: '',
    fechaHasta: ''
  })
  const [defensaSeleccionada, setDefensaSeleccionada] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  const { obtenerCalendario } = useDefensas()
  const { mostrarNotificacion } = useNotificaciones()

  useEffect(() => {
    cargarDefensas()
  }, [])

  const cargarDefensas = async () => {
    setLoading(true)
    try {
      // Obtener defensas del último año
      const fechaDesde = new Date()
      fechaDesde.setFullYear(fechaDesde.getFullYear() - 1)
      const fechaHasta = new Date()
      fechaHasta.setMonth(fechaHasta.getMonth() + 3)

      const resultado = await obtenerCalendario(
        fechaDesde.toISOString().split('T')[0],
        fechaHasta.toISOString().split('T')[0]
      )

      if (resultado.success) {
        // Filtrar solo defensas completadas o defendidas
        const defensasConActa = resultado.data.filter(
          defensa => defensa.estado === 'completada' || defensa.tfg?.estado === 'defendido'
        )
        setDefensas(defensasConActa)
      } else {
        mostrarNotificacion('Error al cargar las defensas', 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      mostrarNotificacion('Error al cargar las defensas', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filtrarDefensas = () => {
    return defensas.filter(defensa => {
      // Filtro por estado
      if (filtros.estado !== 'todas') {
        if (filtros.estado === 'completadas' && defensa.estado !== 'completada') return false
        if (filtros.estado === 'defendidas' && defensa.tfg?.estado !== 'defendido') return false
      }

      // Filtro por búsqueda
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase()
        const titulo = defensa.tfg?.titulo?.toLowerCase() || ''
        const estudiante = defensa.tfg?.estudiante?.nombreCompleto?.toLowerCase() || ''

        if (!titulo.includes(busqueda) && !estudiante.includes(busqueda)) {
          return false
        }
      }

      // Filtro por fecha
      if (filtros.fechaDesde) {
        const fechaDefensa = new Date(defensa.fechaDefensa)
        const fechaFiltro = new Date(filtros.fechaDesde)
        if (fechaDefensa < fechaFiltro) return false
      }

      if (filtros.fechaHasta) {
        const fechaDefensa = new Date(defensa.fechaDefensa)
        const fechaFiltro = new Date(filtros.fechaHasta)
        if (fechaDefensa > fechaFiltro) return false
      }

      return true
    })
  }

  const obtenerEstadoColor = (defensa) => {
    if (defensa.tfg?.estado === 'defendido') {
      return 'bg-green-100 text-green-800 border-green-200'
    } else if (defensa.estado === 'completada') {
      return 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const obtenerEstadoTexto = (defensa) => {
    if (defensa.tfg?.estado === 'defendido') {
      return 'Defendido'
    } else if (defensa.estado === 'completada') {
      return 'Completada'
    }
    return 'En proceso'
  }

  const defensasFiltradas = filtrarDefensas()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando actas de defensa...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Gestión de Actas</h1>
        <p className="text-gray-600">
          Gestiona y descarga las actas de defensa de todos los TFGs
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="completadas">Completadas</option>
              <option value="defendidas">Defendidas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar TFG o Estudiante
            </label>
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
              placeholder="Título del TFG o nombre del estudiante..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha desde
            </label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha hasta
            </label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{defensas.length}</div>
          <div className="text-sm text-gray-500">Total Defensas</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {defensas.filter(d => d.tfg?.estado === 'defendido').length}
          </div>
          <div className="text-sm text-gray-500">Defendidas</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {defensas.filter(d => d.estado === 'completada' && d.tfg?.estado !== 'defendido').length}
          </div>
          <div className="text-sm text-gray-500">Completadas</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{defensasFiltradas.length}</div>
          <div className="text-sm text-gray-500">Mostradas</div>
        </div>
      </div>

      {/* Lista de defensas */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Actas de Defensa ({defensasFiltradas.length})
          </h2>
        </div>

        {defensasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actas disponibles</h3>
            <p className="text-gray-500">
              No se encontraron actas que coincidan con los filtros seleccionados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TFG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Defensa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acta
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {defensasFiltradas.map((defensa) => (
                  <tr key={defensa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs">
                        {defensa.tfg?.titulo || 'Sin título'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {defensa.tfg?.id || defensa.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {defensa.tfg?.estudiante?.nombreCompleto || 'No disponible'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {defensa.tfg?.estudiante?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {defensa.fechaDefensa
                        ? new Date(defensa.fechaDefensa).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'No programada'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {defensa.tfg?.calificacion
                        ? (
                          <div className="flex items-center">
                            <span className="font-bold text-blue-600 mr-2">
                              {defensa.tfg.calificacion}/10
                            </span>
                            <span className="text-xs text-gray-500">
                              {parseFloat(defensa.tfg.calificacion) >= 9 ? 'Sobresaliente' :
                               parseFloat(defensa.tfg.calificacion) >= 7 ? 'Notable' :
                               parseFloat(defensa.tfg.calificacion) >= 5 ? 'Aprobado' : 'Suspenso'}
                            </span>
                          </div>
                        )
                        : 'Pendiente'
                      }
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${obtenerEstadoColor(defensa)}`}>
                        {obtenerEstadoTexto(defensa)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setDefensaSeleccionada(defensa)
                          setMostrarModal(true)
                        }}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                      >
                        <span className="mr-1">📋</span>
                        Ver Acta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para mostrar acta */}
      {mostrarModal && defensaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Acta de Defensa
                </h3>
                <p className="text-sm text-gray-600">
                  {defensaSeleccionada.tfg?.titulo || 'Sin título'}
                </p>
              </div>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              <ActaDownload
                defensaId={defensaSeleccionada.id}
                defensa={defensaSeleccionada}
                tfg={defensaSeleccionada.tfg}
                userRole="admin"
                showPreview={true}
                size="lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionActas