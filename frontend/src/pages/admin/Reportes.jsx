import { useState, useEffect } from 'react'
import { useReportes } from '../../hooks/useReportes'
import { useUsuarios } from '../../hooks/useUsuarios'
import { useTribunales } from '../../hooks/useTribunales'
import { useNotificaciones } from '../../context/NotificacionesContext'

function Reportes() {
  const { mostrarNotificacion } = useNotificaciones()
  const {
    loading,
    error,
    generarReporteTFGs,
    generarReporteUsuarios,
    generarReporteTribunales,
    exportarAPDF,
    exportarAExcel,
    generarReportePersonalizado,
    clearError
  } = useReportes()

  const { obtenerProfesores } = useUsuarios()
  const { obtenerPresidentes } = useTribunales()

  // Estados principales
  const [tipoReporteActivo, setTipoReporteActivo] = useState('tfgs')
  const [datosReporte, setDatosReporte] = useState(null)
  const [vistaActiva, setVistaActiva] = useState('generador') // generador, resultados, personalizado

  // Función para obtener fechas por defecto
  const obtenerFechasPorDefecto = () => {
    const hoy = new Date()
    const hace30Dias = new Date()
    hace30Dias.setDate(hoy.getDate() - 30)

    return {
      fechaInicio: hace30Dias.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0]
    }
  }

  const fechasDefecto = obtenerFechasPorDefecto()

  // Filtros por tipo de reporte
  const [filtrosTFGs, setFiltrosTFGs] = useState({
    estado: 'todos',
    tutor: 'todos',
    departamento: 'todos',
    fechaInicio: fechasDefecto.fechaInicio,
    fechaFin: fechasDefecto.fechaFin
  })

  const [filtrosUsuarios, setFiltrosUsuarios] = useState({
    rol: 'todos',
    estado: 'todos',
    departamento: 'todos',
    fechaRegistroInicio: fechasDefecto.fechaInicio,
    fechaRegistroFin: fechasDefecto.fechaFin
  })

  const [filtrosTribunales, setFiltrosTribunales] = useState({
    estado: 'todos',
    presidente: 'todos',
    departamento: 'todos',
    fechaCreacionInicio: fechasDefecto.fechaInicio,
    fechaCreacionFin: fechasDefecto.fechaFin
  })

  // Estados para reporte personalizado
  const [reportePersonalizado, setReportePersonalizado] = useState({
    tiposReporte: ['tfgs'],
    incluirEstadisticas: true,
    incluirGraficos: true,
    formatoExportacion: 'pdf'
  })

  // Listas dinámicas para filtros
  const [profesoresDisponibles, setProfesoresDisponibles] = useState([])
  const [presidentesDisponibles, setPresidentesDisponibles] = useState([])

  // Cargar datos para filtros dinámicos
  useEffect(() => {
    cargarProfesores()
    cargarPresidentes()
  }, [])

  const cargarProfesores = async () => {
    try {
      const resultado = await obtenerProfesores()
      if (resultado.success) {
        setProfesoresDisponibles(resultado.data || [])
      }
    } catch (error) {
      console.error('Error cargando profesores para filtros:', error)
      setProfesoresDisponibles([])
    }
  }

  const cargarPresidentes = async () => {
    try {
      const resultado = await obtenerPresidentes()
      if (resultado.success) {
        setPresidentesDisponibles(resultado.data || [])
      }
    } catch (error) {
      console.error('Error cargando presidentes para filtros:', error)
      setPresidentesDisponibles([])
    }
  }

  // Limpiar error al cambiar de tipo
  useEffect(() => {
    clearError()
  }, [tipoReporteActivo, clearError])

  // Generar reporte según el tipo activo
  const generarReporte = async () => {
    let resultado
    
    switch (tipoReporteActivo) {
      case 'tfgs':
        resultado = await generarReporteTFGs(filtrosTFGs)
        break
      case 'usuarios':
        resultado = await generarReporteUsuarios(filtrosUsuarios)
        break
      case 'tribunales':
        resultado = await generarReporteTribunales(filtrosTribunales)
        break
      default:
        mostrarNotificacion('Tipo de reporte no válido', 'error')
        return
    }

    if (resultado.success) {
      setDatosReporte(resultado.data)
      setVistaActiva('resultados')
      mostrarNotificacion('Reporte generado correctamente', 'success')
    } else {
      mostrarNotificacion(resultado.error, 'error')
    }
  }

  // Generar reporte personalizado
  const generarPersonalizado = async () => {
    const configuracion = {
      tiposReporte: reportePersonalizado.tiposReporte,
      filtros: {
        tfgs: filtrosTFGs,
        usuarios: filtrosUsuarios,
        tribunales: filtrosTribunales
      },
      incluirEstadisticas: reportePersonalizado.incluirEstadisticas,
      incluirGraficos: reportePersonalizado.incluirGraficos
    }

    const resultado = await generarReportePersonalizado(configuracion)

    if (resultado.success) {
      setDatosReporte(resultado.data)
      setVistaActiva('resultados')
      mostrarNotificacion(resultado.message, 'success')
    } else {
      mostrarNotificacion(resultado.error, 'error')
    }
  }

  // Exportar reporte
  const exportarReporte = async (formato) => {
    if (!datosReporte) {
      mostrarNotificacion('No hay datos para exportar', 'error')
      return
    }

    let resultado

    if (formato === 'pdf') {
      resultado = await exportarAPDF(tipoReporteActivo, datosReporte)
    } else if (formato === 'excel') {
      resultado = await exportarAExcel(tipoReporteActivo, datosReporte)
    }

    if (resultado.success) {
      mostrarNotificacion(`${resultado.message} - ${resultado.data.archivo}`, 'success')
      // En un caso real, aquí se iniciaría la descarga
    } else {
      mostrarNotificacion(resultado.error, 'error')
    }
  }

  // Renderizar filtros según el tipo de reporte
  const renderFiltros = () => {
    switch (tipoReporteActivo) {
      case 'tfgs':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filtrosTFGs.estado}
                onChange={(e) => setFiltrosTFGs({...filtrosTFGs, estado: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="todos">Todos los estados</option>
                <option value="aprobado">✅ Aprobado</option>
                <option value="en desarrollo">🔄 En desarrollo</option>
                <option value="en revisión">📋 En revisión</option>
                <option value="suspenso">❌ Suspenso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tutor</label>
              <select
                value={filtrosTFGs.tutor}
                onChange={(e) => setFiltrosTFGs({...filtrosTFGs, tutor: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="todos">Todos los tutores</option>
                {profesoresDisponibles.map((profesor) => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombreCompleto || `${profesor.nombre} ${profesor.apellidos || ''}`.trim()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
              <select
                value={filtrosTFGs.departamento}
                onChange={(e) => setFiltrosTFGs({...filtrosTFGs, departamento: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="todos">Todos</option>
                <option value="Ingeniería de Software">Ingeniería de Software</option>
                <option value="Desarrollo Móvil">Desarrollo Móvil</option>
                <option value="Análisis de Datos">Análisis de Datos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={filtrosTFGs.fechaInicio}
                onChange={(e) => setFiltrosTFGs({...filtrosTFGs, fechaInicio: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={filtrosTFGs.fechaFin}
                onChange={(e) => setFiltrosTFGs({...filtrosTFGs, fechaFin: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        )

      case 'usuarios':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select
                value={filtrosUsuarios.rol}
                onChange={(e) => setFiltrosUsuarios({...filtrosUsuarios, rol: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="todos">Todos los roles</option>
                <option value="admin">👑 Administrador</option>
                <option value="profesor">👨‍🏫 Profesor</option>
                <option value="estudiante">🎓 Estudiante</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filtrosUsuarios.estado}
                onChange={(e) => setFiltrosUsuarios({...filtrosUsuarios, estado: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">✅ Activo</option>
                <option value="inactivo">⏸️ Inactivo</option>
                <option value="suspendido">🚫 Suspendido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
              <select
                value={filtrosUsuarios.departamento}
                onChange={(e) => setFiltrosUsuarios({...filtrosUsuarios, departamento: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="todos">Todos</option>
                <option value="Ingeniería de Software">Ingeniería de Software</option>
                <option value="Desarrollo Móvil">Desarrollo Móvil</option>
                <option value="Análisis de Datos">Análisis de Datos</option>
                <option value="Administración de Sistemas">Administración</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registro Desde</label>
              <input
                type="date"
                value={filtrosUsuarios.fechaRegistroInicio}
                onChange={(e) => setFiltrosUsuarios({...filtrosUsuarios, fechaRegistroInicio: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registro Hasta</label>
              <input
                type="date"
                value={filtrosUsuarios.fechaRegistroFin}
                onChange={(e) => setFiltrosUsuarios({...filtrosUsuarios, fechaRegistroFin: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        )

      case 'tribunales':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filtrosTribunales.estado}
                onChange={(e) => setFiltrosTribunales({...filtrosTribunales, estado: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">🟢 Activo</option>
                <option value="completado">✅ Completado</option>
                <option value="cancelado">❌ Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Presidente</label>
              <select
                value={filtrosTribunales.presidente}
                onChange={(e) => setFiltrosTribunales({...filtrosTribunales, presidente: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="todos">Todos los presidentes</option>
                {presidentesDisponibles.map((presidente) => (
                  <option key={presidente.id} value={presidente.id}>
                    {presidente.nombreCompleto || `${presidente.nombre} ${presidente.apellidos || ''}`.trim()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
              <select
                value={filtrosTribunales.departamento}
                onChange={(e) => setFiltrosTribunales({...filtrosTribunales, departamento: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="todos">Todos</option>
                <option value="Ingeniería de Software">Ingeniería de Software</option>
                <option value="Desarrollo Móvil">Desarrollo Móvil</option>
                <option value="Análisis de Datos">Análisis de Datos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Creado Desde</label>
              <input
                type="date"
                value={filtrosTribunales.fechaCreacionInicio}
                onChange={(e) => setFiltrosTribunales({...filtrosTribunales, fechaCreacionInicio: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Creado Hasta</label>
              <input
                type="date"
                value={filtrosTribunales.fechaCreacionFin}
                onChange={(e) => setFiltrosTribunales({...filtrosTribunales, fechaCreacionFin: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Renderizar estadísticas según el tipo de reporte
  const renderEstadisticas = (estadisticas) => {
    if (!estadisticas) return null

    switch (tipoReporteActivo) {
      case 'tfgs':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
              <div className="text-sm text-blue-700">Total TFGs</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{estadisticas.porEstado.aprobado}</div>
              <div className="text-sm text-green-700">Aprobados</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{estadisticas.promedioCalificacion}</div>
              <div className="text-sm text-purple-700">Promedio Nota</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{estadisticas.duracionPromedioDefensa}</div>
              <div className="text-sm text-orange-700">Min. Promedio</div>
            </div>
          </div>
        )

      case 'usuarios':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.totalUsuarios}</div>
              <div className="text-sm text-blue-700">Total Usuarios</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{estadisticas.usuariosActivos}</div>
              <div className="text-sm text-green-700">Activos</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{estadisticas.promedioSesiones}</div>
              <div className="text-sm text-purple-700">Sesiones/Mes</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{estadisticas.promedioHorasActividad}</div>
              <div className="text-sm text-orange-700">Horas Actividad</div>
            </div>
          </div>
        )

      case 'tribunales':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.totalTribunales}</div>
              <div className="text-sm text-blue-700">Total Tribunales</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{estadisticas.totalDefensasRealizadas}</div>
              <div className="text-sm text-green-700">Defensas Realizadas</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{estadisticas.promedioGeneralCalificaciones}</div>
              <div className="text-sm text-purple-700">Promedio Nota</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{estadisticas.duracionPromedioGeneral}</div>
              <div className="text-sm text-orange-700">Min. Promedio</div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading && !datosReporte) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generando reporte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Sistema de Reportes</h1>
          <p className="text-gray-600 mt-2">Genera reportes detallados y estadísticas del sistema</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setVistaActiva('generador')}
            className={`px-4 py-2 rounded-md ${vistaActiva === 'generador' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            🔧 Generador
          </button>
          <button
            onClick={() => setVistaActiva('personalizado')}
            className={`px-4 py-2 rounded-md ${vistaActiva === 'personalizado' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            ⚙️ Personalizado
          </button>
          {datosReporte && (
            <button
              onClick={() => setVistaActiva('resultados')}
              className={`px-4 py-2 rounded-md ${vistaActiva === 'resultados' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              📋 Resultados
            </button>
          )}
        </div>
      </div>

      {/* Vista Generador */}
      {vistaActiva === 'generador' && (
        <div className="space-y-6">
          {/* Selector de tipo de reporte */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tipo de Reporte</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setTipoReporteActivo('tfgs')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  tipoReporteActivo === 'tfgs' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Reportes de TFGs</h3>
                    <p className="text-sm text-gray-600">Estado, defensas, calificaciones</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setTipoReporteActivo('usuarios')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  tipoReporteActivo === 'usuarios' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Reportes de Usuarios</h3>
                    <p className="text-sm text-gray-600">Actividad, roles, estadísticas</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setTipoReporteActivo('tribunales')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  tipoReporteActivo === 'tribunales' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Reportes de Tribunales</h3>
                    <p className="text-sm text-gray-600">Defensas, calificaciones, rendimiento</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Filtros</h2>
            {renderFiltros()}
          </div>

          {/* Botón generar */}
          <div className="flex justify-center">
            <button
              onClick={generarReporte}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
              <span>📊 Generar Reporte</span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Vista Personalizado */}
      {vistaActiva === 'personalizado' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Reporte Personalizado</h2>
            
            {/* Selección de tipos de reporte */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipos de reporte a incluir:
              </label>
              <div className="space-y-2">
                {[
                  { id: 'tfgs', label: '📚 TFGs y Defensas', desc: 'Estado, calificaciones, tribunales' },
                  { id: 'usuarios', label: '👥 Usuarios y Actividad', desc: 'Roles, sesiones, estadísticas' },
                  { id: 'tribunales', label: '⚖️ Tribunales y Defensas', desc: 'Rendimiento, calificaciones' }
                ].map((tipo) => (
                  <label key={tipo.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={reportePersonalizado.tiposReporte.includes(tipo.id)}
                      onChange={(e) => {
                        const tipos = e.target.checked
                          ? [...reportePersonalizado.tiposReporte, tipo.id]
                          : reportePersonalizado.tiposReporte.filter(t => t !== tipo.id)
                        setReportePersonalizado({...reportePersonalizado, tiposReporte: tipos})
                      }}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{tipo.label}</div>
                      <div className="text-sm text-gray-600">{tipo.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Opciones adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Opciones de contenido:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportePersonalizado.incluirEstadisticas}
                      onChange={(e) => setReportePersonalizado({
                        ...reportePersonalizado, 
                        incluirEstadisticas: e.target.checked
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">📈 Incluir estadísticas detalladas</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportePersonalizado.incluirGraficos}
                      onChange={(e) => setReportePersonalizado({
                        ...reportePersonalizado, 
                        incluirGraficos: e.target.checked
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">📊 Incluir gráficos y visualizaciones</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Formato de exportación:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="formato"
                      value="pdf"
                      checked={reportePersonalizado.formatoExportacion === 'pdf'}
                      onChange={(e) => setReportePersonalizado({
                        ...reportePersonalizado, 
                        formatoExportacion: e.target.value
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">📄 PDF (Recomendado)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="formato"
                      value="excel"
                      checked={reportePersonalizado.formatoExportacion === 'excel'}
                      onChange={(e) => setReportePersonalizado({
                        ...reportePersonalizado, 
                        formatoExportacion: e.target.value
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">📊 Excel (Para análisis)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Botón generar personalizado */}
            <div className="flex justify-center">
              <button
                onClick={generarPersonalizado}
                disabled={loading || reportePersonalizado.tiposReporte.length === 0}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                <span>⚙️ Generar Reporte Personalizado</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista Resultados */}
      {vistaActiva === 'resultados' && datosReporte && (
        <div className="space-y-6">
          {/* Header de resultados */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">📋 Resultados del Reporte</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Generado el {new Date(datosReporte.fechaGeneracion).toLocaleString('es-ES')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => exportarReporte('pdf')}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>📄 Exportar PDF</span>
                </button>
                <button
                  onClick={() => exportarReporte('excel')}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>📊 Exportar Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-lg shadow p-6">
            {datosReporte.reportes ? (
              // Reporte personalizado
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">📊 Estadísticas Generales</h3>
                {datosReporte.reportes.map((reporte, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {reporte.tipo === 'tfgs' ? '📚 TFGs' : 
                       reporte.tipo === 'usuarios' ? '👥 Usuarios' : '⚖️ Tribunales'}
                    </h4>
                    {renderEstadisticas(reporte.datos.estadisticas)}
                  </div>
                ))}
              </div>
            ) : (
              // Reporte simple
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Estadísticas</h3>
                {renderEstadisticas(datosReporte.estadisticas)}
              </>
            )}
          </div>

          {/* Tabla de datos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">📋 Datos Detallados</h3>
            </div>

            {datosReporte.reportes ? (
              // Mostrar múltiples reportes
              <div className="p-6 space-y-8">
                {datosReporte.reportes.map((reporte, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      {reporte.tipo === 'tfgs' ? '📚 Lista de TFGs' : 
                       reporte.tipo === 'usuarios' ? '👥 Lista de Usuarios' : '⚖️ Lista de Tribunales'}
                    </h4>
                    
                    {reporte.tipo === 'tfgs' && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TFG</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calificación</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Defensa</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reporte.datos.tfgs.map((tfg) => (
                              <tr key={tfg.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">{tfg.titulo}</div>
                                  <div className="text-sm text-gray-500">Tutor: {tfg.tutor}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{tfg.estudiante}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    tfg.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                                    tfg.estado === 'En desarrollo' ? 'bg-blue-100 text-blue-800' :
                                    tfg.estado === 'En revisión' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {tfg.estado}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {tfg.calificacion ? tfg.calificacion.toFixed(1) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {tfg.fechaDefensa ? new Date(tfg.fechaDefensa).toLocaleDateString('es-ES') : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {reporte.tipo === 'usuarios' && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesiones/Mes</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Acceso</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reporte.datos.usuarios.map((usuario) => (
                              <tr key={usuario.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                                  <div className="text-sm text-gray-500">{usuario.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    usuario.rol === 'admin' ? 'bg-red-100 text-red-800' :
                                    usuario.rol === 'profesor' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {usuario.rol}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    usuario.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {usuario.estado}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{usuario.sesionesUltimoMes}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {new Date(usuario.ultimoAcceso).toLocaleDateString('es-ES')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {reporte.tipo === 'tribunales' && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tribunal</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presidente</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defensas</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reporte.datos.tribunales.map((tribunal) => (
                              <tr key={tribunal.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">{tribunal.nombre}</div>
                                  <div className="text-sm text-gray-500">{tribunal.departamento}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{tribunal.presidente}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    tribunal.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                                    tribunal.estado === 'Completado' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {tribunal.estado}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {tribunal.defensasRealizadas} / {tribunal.defensasRealizadas + tribunal.defensasPendientes}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {tribunal.promedioCalificaciones.toFixed(1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Mostrar reporte simple
              <div className="overflow-x-auto">
                {/* Mostrar tabla según el tipo de reporte actual */}
                {tipoReporteActivo === 'tfgs' && datosReporte.tfgs && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TFG</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calificación</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Defensa</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {datosReporte.tfgs.map((tfg) => (
                        <tr key={tfg.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{tfg.titulo}</div>
                            <div className="text-sm text-gray-500">Tutor: {tfg.tutor}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{tfg.estudiante}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tfg.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                              tfg.estado === 'En desarrollo' ? 'bg-blue-100 text-blue-800' :
                              tfg.estado === 'En revisión' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {tfg.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {tfg.calificacion ? tfg.calificacion.toFixed(1) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {tfg.fechaDefensa ? new Date(tfg.fechaDefensa).toLocaleDateString('es-ES') : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {tipoReporteActivo === 'usuarios' && datosReporte.usuarios && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesiones/Mes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Acceso</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {datosReporte.usuarios.map((usuario) => (
                        <tr key={usuario.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              usuario.rol === 'admin' ? 'bg-red-100 text-red-800' :
                              usuario.rol === 'profesor' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {usuario.rol}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              usuario.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {usuario.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{usuario.sesionesUltimoMes}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(usuario.ultimoAcceso).toLocaleDateString('es-ES')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {tipoReporteActivo === 'tribunales' && datosReporte.tribunales && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tribunal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presidente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defensas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {datosReporte.tribunales.map((tribunal) => (
                        <tr key={tribunal.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{tribunal.nombre}</div>
                            <div className="text-sm text-gray-500">{tribunal.departamento}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{tribunal.presidente}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tribunal.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                              tribunal.estado === 'Completado' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {tribunal.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {tribunal.defensasRealizadas} / {tribunal.defensasRealizadas + tribunal.defensasPendientes}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {tribunal.promedioCalificaciones.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Reportes