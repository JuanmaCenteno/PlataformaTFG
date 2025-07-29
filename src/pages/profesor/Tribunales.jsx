import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Tribunales() {
  const [tribunales, setTribunales] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos') // todos, presidente, vocal, proximos
  const [modalActivo, setModalActivo] = useState(null)
  const [nuevoTribunal, setNuevoTribunal] = useState({
    nombre: '',
    descripcion: '',
    fechaDefensa: '',
    horaDefensa: '',
    aula: '',
    tfgId: '',
    presidente: '',
    vocal1: '',
    vocal2: ''
  })

  // Simular carga de tribunales
  useEffect(() => {
    const cargarTribunales = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const tribunalesData = [
        {
          id: 1,
          nombre: "Tribunal TFG - Desarrollo Web",
          descripcion: "Tribunal especializado en proyectos de desarrollo web y aplicaciones móviles",
          fechaDefensa: "2025-02-15T10:00:00Z",
          aula: "Aula 301",
          estado: "Programado",
          tfg: {
            id: 1,
            titulo: "Sistema de Gestión de TFGs con React y Symfony",
            estudiante: "Juan Pérez"
          },
          miembros: [
            { id: 1, nombre: "Dr. María García", rol: "Presidente", email: "maria.garcia@uni.edu", esYo: true },
            { id: 2, nombre: "Dr. Carlos López", rol: "Vocal", email: "carlos.lopez@uni.edu", esYo: false },
            { id: 3, nombre: "Dra. Ana Martín", rol: "Vocal", email: "ana.martin@uni.edu", esYo: false }
          ],
          calificaciones: {
            originalidad: null,
            metodologia: null,
            implementacion: null,
            presentacion: null,
            final: null
          },
          acta: {
            generada: false,
            observaciones: ""
          }
        },
        {
          id: 2,
          nombre: "Tribunal TFG - Inteligencia Artificial",
          descripcion: "Tribunal para proyectos de IA y Machine Learning",
          fechaDefensa: "2025-02-17T12:00:00Z",
          aula: "Aula 205",
          estado: "Pendiente",
          tfg: {
            id: 3,
            titulo: "Sistema de Recomendación basado en IA",
            estudiante: "María Silva"
          },
          miembros: [
            { id: 4, nombre: "Dr. Pedro Ruiz", rol: "Presidente", email: "pedro.ruiz@uni.edu", esYo: false },
            { id: 1, nombre: "Dr. María García", rol: "Vocal", email: "maria.garcia@uni.edu", esYo: true },
            { id: 5, nombre: "Dr. Luis Fernández", rol: "Vocal", email: "luis.fernandez@uni.edu", esYo: false }
          ],
          calificaciones: {
            originalidad: null,
            metodologia: null,
            implementacion: null,
            presentacion: null,
            final: null
          },
          acta: {
            generada: false,
            observaciones: ""
          }
        },
        {
          id: 3,
          nombre: "Tribunal TFG - Completado",
          descripcion: "Tribunal ya evaluado y finalizado",
          fechaDefensa: "2025-01-20T09:00:00Z",
          aula: "Aula 102",
          estado: "Completado",
          tfg: {
            id: 2,
            titulo: "Aplicación Móvil para Gestión de Entregas",
            estudiante: "Carlos Ruiz"
          },
          miembros: [
            { id: 1, nombre: "Dr. María García", rol: "Presidente", email: "maria.garcia@uni.edu", esYo: true },
            { id: 6, nombre: "Dra. Isabel Moreno", rol: "Vocal", email: "isabel.moreno@uni.edu", esYo: false },
            { id: 7, nombre: "Dr. Roberto Silva", rol: "Vocal", email: "roberto.silva@uni.edu", esYo: false }
          ],
          calificaciones: {
            originalidad: 8,
            metodologia: 7,
            implementacion: 9,
            presentacion: 8,
            final: 8.0
          },
          acta: {
            generada: true,
            observaciones: "Excelente trabajo técnico. Presentación clara y bien estructurada."
          }
        }
      ]
      
      setTribunales(tribunalesData)
      setLoading(false)
    }

    cargarTribunales()
  }, [])

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Programado': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Completado': return 'bg-green-100 text-green-800 border-green-200'
      case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Programado': return '📅'
      case 'Pendiente': return '⏳'
      case 'Completado': return '✅'
      case 'Cancelado': return '❌'
      default: return '📋'
    }
  }

  const getRolColor = (rol, esYo) => {
    if (esYo) {
      return rol === 'Presidente' 
        ? 'bg-blue-100 text-blue-800 border-blue-300' 
        : 'bg-purple-100 text-purple-800 border-purple-300'
    }
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }

  const tribunalesFiltrados = tribunales.filter(tribunal => {
    const esPresidente = tribunal.miembros.some(m => m.esYo && m.rol === 'Presidente')
    const esVocal = tribunal.miembros.some(m => m.esYo && m.rol === 'Vocal')
    const esProximo = new Date(tribunal.fechaDefensa) > new Date()

    switch (filtro) {
      case 'presidente':
        return esPresidente
      case 'vocal':
        return esVocal
      case 'proximos':
        return esProximo && tribunal.estado !== 'Completado'
      default:
        return true
    }
  })

  const estadisticas = {
    total: tribunales.length,
    presidente: tribunales.filter(t => t.miembros.some(m => m.esYo && m.rol === 'Presidente')).length,
    vocal: tribunales.filter(t => t.miembros.some(m => m.esYo && m.rol === 'Vocal')).length,
    proximos: tribunales.filter(t => new Date(t.fechaDefensa) > new Date() && t.estado !== 'Completado').length
  }

  const handleCrearTribunal = async () => {
    // Simular creación de tribunal
    const nuevoTribunalObj = {
      id: Date.now(),
      ...nuevoTribunal,
      fechaDefensa: new Date(nuevoTribunal.fechaDefensa + 'T' + nuevoTribunal.horaDefensa).toISOString(),
      estado: 'Pendiente',
      miembros: [
        { id: Date.now(), nombre: nuevoTribunal.presidente, rol: 'Presidente', esYo: true },
        { id: Date.now() + 1, nombre: nuevoTribunal.vocal1, rol: 'Vocal', esYo: false },
        { id: Date.now() + 2, nombre: nuevoTribunal.vocal2, rol: 'Vocal', esYo: false }
      ],
      calificaciones: {
        originalidad: null,
        metodologia: null,
        implementacion: null,
        presentacion: null,
        final: null
      },
      acta: {
        generada: false,
        observaciones: ""
      }
    }

    setTribunales(prev => [nuevoTribunalObj, ...prev])
    setNuevoTribunal({
      nombre: '',
      descripcion: '',
      fechaDefensa: '',
      horaDefensa: '',
      aula: '',
      tfgId: '',
      presidente: '',
      vocal1: '',
      vocal2: ''
    })
    setModalActivo(null)
  }

  const handleGenerarActa = (tribunalId) => {
    setTribunales(prev => prev.map(tribunal => 
      tribunal.id === tribunalId
        ? { ...tribunal, acta: { ...tribunal.acta, generada: true } }
        : tribunal
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tribunales...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Tribunales</h1>
            <p className="text-gray-600 mt-2">
              Gestiona los tribunales donde participas como presidente o vocal
            </p>
          </div>
          <button
            onClick={() => setModalActivo('crear')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Crear Tribunal</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
            <div className="text-sm text-gray-500">Total Tribunales</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{estadisticas.presidente}</div>
            <div className="text-sm text-gray-500">Como Presidente</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{estadisticas.vocal}</div>
            <div className="text-sm text-gray-500">Como Vocal</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{estadisticas.proximos}</div>
            <div className="text-sm text-gray-500">Próximas Defensas</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'todos', label: 'Todos', count: tribunales.length },
            { key: 'presidente', label: 'Como Presidente', count: estadisticas.presidente },
            { key: 'vocal', label: 'Como Vocal', count: estadisticas.vocal },
            { key: 'proximos', label: 'Próximas Defensas', count: estadisticas.proximos }
          ].map((opcion) => (
            <button
              key={opcion.key}
              onClick={() => setFiltro(opcion.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filtro === opcion.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opcion.label}
              {opcion.count > 0 && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  filtro === opcion.key
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {opcion.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Tribunales */}
      <div className="space-y-6">
        {tribunalesFiltrados.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay tribunales {filtro !== 'todos' ? `para el filtro "${filtro}"` : ''}
            </h3>
            <p className="text-gray-500">
              Los tribunales aparecerán aquí cuando seas asignado como miembro
            </p>
          </div>
        ) : (
          tribunalesFiltrados.map((tribunal) => {
            const miRol = tribunal.miembros.find(m => m.esYo)?.rol || 'Vocal'
            const esPresidente = miRol === 'Presidente'
            
            return (
              <div key={tribunal.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header del tribunal */}
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {tribunal.nombre}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getEstadoColor(tribunal.estado)}`}>
                          <span className="mr-1">{getEstadoIcon(tribunal.estado)}</span>
                          {tribunal.estado}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getRolColor(miRol, true)}`}>
                          {miRol === 'Presidente' ? '👑' : '👤'} {miRol}
                        </span>
                      </div>

                      {/* Descripción */}
                      <p className="text-gray-600 mb-4">{tribunal.descripcion}</p>

                      {/* Info del TFG */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">TFG a evaluar:</h4>
                        <p className="text-sm text-gray-700">
                          <strong>{tribunal.tfg.titulo}</strong>
                        </p>
                        <p className="text-sm text-gray-500">
                          Estudiante: {tribunal.tfg.estudiante}
                        </p>
                      </div>

                      {/* Detalles de la defensa */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Fecha y hora:</span>
                          <br />
                          <span className="text-gray-900">
                            {new Date(tribunal.fechaDefensa).toLocaleDateString('es-ES')}
                          </span>
                          <br />
                          <span className="text-gray-900">
                            {new Date(tribunal.fechaDefensa).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Aula:</span>
                          <br />
                          <span className="text-gray-900">{tribunal.aula}</span>
                        </div>
                        <div>
                          <span className="font-medium">Calificación:</span>
                          <br />
                          <span className="text-gray-900">
                            {tribunal.calificaciones.final ? `${tribunal.calificaciones.final}/10` : 'Pendiente'}
                          </span>
                        </div>
                      </div>

                      {/* Miembros del tribunal */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Miembros del Tribunal:</h4>
                        <div className="flex flex-wrap gap-2">
                          {tribunal.miembros.map((miembro) => (
                            <span 
                              key={miembro.id}
                              className={`inline-flex items-center px-3 py-1 text-sm rounded-full border ${getRolColor(miembro.rol, miembro.esYo)}`}
                            >
                              {miembro.rol === 'Presidente' ? '👑' : '👤'} {miembro.nombre}
                              {miembro.esYo && ' (Tú)'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col space-y-2 ml-6">
                      <Link
                        to={`/profesor/tribunal/${tribunal.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 text-center"
                      >
                        📋 Ver Detalle
                      </Link>
                      
                      {tribunal.estado === 'Programado' && (
                        <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                          ⭐ Evaluar TFG
                        </button>
                      )}
                      
                      {esPresidente && tribunal.estado === 'Completado' && !tribunal.acta.generada && (
                        <button 
                          onClick={() => handleGenerarActa(tribunal.id)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
                        >
                          📄 Generar Acta
                        </button>
                      )}
                      
                      {tribunal.acta.generada && (
                        <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">
                          📄 Descargar Acta
                        </button>
                      )}
                      
                      {esPresidente && (
                        <button 
                          onClick={() => setModalActivo({ tipo: 'editar', tribunal })}
                          className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700"
                        >
                          ⚙️ Configurar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal para crear tribunal */}
      {modalActivo === 'crear' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Crear Nuevo Tribunal
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Tribunal
                    </label>
                    <input
                      type="text"
                      value={nuevoTribunal.nombre}
                      onChange={(e) => setNuevoTribunal(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Tribunal TFG - Desarrollo Web"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aula
                    </label>
                    <input
                      type="text"
                      value={nuevoTribunal.aula}
                      onChange={(e) => setNuevoTribunal(prev => ({ ...prev, aula: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Aula 301"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={nuevoTribunal.descripcion}
                    onChange={(e) => setNuevoTribunal(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descripción del tribunal y área de especialización"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Defensa
                    </label>
                    <input
                      type="date"
                      value={nuevoTribunal.fechaDefensa}
                      onChange={(e) => setNuevoTribunal(prev => ({ ...prev, fechaDefensa: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Defensa
                    </label>
                    <input
                      type="time"
                      value={nuevoTribunal.horaDefensa}
                      onChange={(e) => setNuevoTribunal(prev => ({ ...prev, horaDefensa: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Miembros del Tribunal</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Presidente (Tú)
                    </label>
                    <input
                      type="text"
                      value="Dr. María García"
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vocal 1
                    </label>
                    <input
                      type="text"
                      value={nuevoTribunal.vocal1}
                      onChange={(e) => setNuevoTribunal(prev => ({ ...prev, vocal1: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del primer vocal"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vocal 2
                    </label>
                    <input
                      type="text"
                      value={nuevoTribunal.vocal2}
                      onChange={(e) => setNuevoTribunal(prev => ({ ...prev, vocal2: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del segundo vocal"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setModalActivo(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearTribunal}
                  disabled={!nuevoTribunal.nombre || !nuevoTribunal.fechaDefensa || !nuevoTribunal.vocal1 || !nuevoTribunal.vocal2}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Crear Tribunal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tribunales