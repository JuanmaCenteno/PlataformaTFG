import { useState, useEffect } from 'react'
import { useUsuarios } from '../../hooks/useUsuarios'
import { useNotificaciones } from '../../context/NotificacionesContext'

function GestionUsuarios() {
  const { mostrarNotificacion } = useNotificaciones()
  const {
    loading,
    error,
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    cambiarEstadoUsuario,
    asignarRol,
    resetearPassword,
    obtenerEstadisticasUsuarios,
    obtenerLogActividad,
    clearError
  } = useUsuarios()

  // Estados principales
  const [usuarios, setUsuarios] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [vistaActiva, setVistaActiva] = useState('lista') // lista, estadisticas, logs
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    rol: 'todos',
    estado: 'todos',
    departamento: 'todos',
    busqueda: ''
  })

  // Estados de modales
  const [modalActivo, setModalActivo] = useState(null)
  const [formularioUsuario, setFormularioUsuario] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'estudiante',
    departamento: '',
    especialidad: '', // Cambiar curso por especialidad para coincidir con BD
    telefono: '',
    dni: '',
    universidad: '',
    especialidades: [],
    permisos: []
  })

  // Estados auxiliares
  const [logs, setLogs] = useState([])
  const [ordenamiento, setOrdenamiento] = useState({
    campo: 'nombre',
    direccion: 'asc'
  })

  // Cargar datos iniciales
  useEffect(() => {
    cargarUsuarios()
    cargarEstadisticas()
  }, [])

  const cargarUsuarios = async () => {
    const resultado = await obtenerUsuarios()
    if (resultado.success) {
      setUsuarios(resultado.data)
    } else {
      mostrarNotificacion(resultado.error, 'error')
    }
  }

  const cargarEstadisticas = async () => {
    const resultado = await obtenerEstadisticasUsuarios()
    if (resultado.success) {
      setEstadisticas(resultado.data)
    }
  }

  const cargarLogs = async (usuarioId = null) => {
    const resultado = await obtenerLogActividad(usuarioId)
    if (resultado.success) {
      setLogs(resultado.data)
    }
  }

  // Manejar creación de usuario
  const manejarCrearUsuario = async (e) => {
    e.preventDefault()

    // Dividir el nombre completo en nombre y apellidos
    const nombreCompleto = formularioUsuario.nombre.trim()
    const partesNombre = nombreCompleto.split(/\s+/)

    const nombre = partesNombre[0] || ''
    const apellidos = partesNombre.slice(1).join(' ') || partesNombre[0] || ''

    // Convertir rol simple a array de roles de Symfony
    const roleMapping = {
      'estudiante': ['ROLE_ESTUDIANTE'],
      'profesor': ['ROLE_PROFESOR'],
      'presidente': ['ROLE_PRESIDENTE_TRIBUNAL'],
      'admin': ['ROLE_ADMIN']
    }

    const roles = roleMapping[formularioUsuario.rol] || ['ROLE_ESTUDIANTE']

    // Preparar datos con nombre, apellidos y roles en formato correcto
    const datosUsuario = {
      ...formularioUsuario,
      nombre,
      apellidos,
      roles
    }

    const resultado = await crearUsuario(datosUsuario)

    if (resultado.success) {
      mostrarNotificacion(resultado.message, 'success')
      setModalActivo(null)
      cargarUsuarios()
      cargarEstadisticas()
      limpiarFormulario()
    } else {
      mostrarNotificacion(resultado.error, 'error')
    }
  }

  // Manejar edición de usuario
  const manejarEditarUsuario = async (e) => {
    e.preventDefault()

    // Dividir el nombre completo en nombre y apellidos
    const nombreCompleto = formularioUsuario.nombre.trim()
    const partesNombre = nombreCompleto.split(/\s+/)

    const nombre = partesNombre[0] || ''
    const apellidos = partesNombre.slice(1).join(' ') || partesNombre[0] || ''

    // Convertir rol simple a array de roles de Symfony
    const roleMapping = {
      'estudiante': ['ROLE_ESTUDIANTE'],
      'profesor': ['ROLE_PROFESOR'],
      'presidente': ['ROLE_PRESIDENTE_TRIBUNAL'],
      'admin': ['ROLE_ADMIN']
    }

    const roles = roleMapping[formularioUsuario.rol] || ['ROLE_ESTUDIANTE']

    // Preparar datos con nombre, apellidos y roles en formato correcto
    const datosUsuario = {
      ...formularioUsuario,
      nombre,
      apellidos,
      roles
    }

    // En edición, excluir password si está vacío
    if (!formularioUsuario.password.trim()) {
      delete datosUsuario.password
    }

    // En edición, no enviar campos únicos que no han cambiado para evitar conflictos
    // Email: nunca enviar en edición para evitar conflictos
    delete datosUsuario.email

    // DNI: solo enviar si ha cambiado y no está vacío
    if (!formularioUsuario.dni ||
        formularioUsuario.dni.trim() === '' ||
        formularioUsuario.dni === usuarioSeleccionado.dni) {
      delete datosUsuario.dni
    }

    // Limpiar campos vacíos para evitar problemas con el backend
    Object.keys(datosUsuario).forEach(key => {
      if (datosUsuario[key] === '' || datosUsuario[key] === null || datosUsuario[key] === undefined) {
        delete datosUsuario[key]
      }
    })


    // Verificar que tenemos un ID válido
    if (!usuarioSeleccionado.id) {
      mostrarNotificacion('Error: ID de usuario no válido', 'error')
      return
    }

    const resultado = await actualizarUsuario(usuarioSeleccionado.id, datosUsuario)

    if (resultado.success) {
      mostrarNotificacion(resultado.message, 'success')
      setModalActivo(null)
      cargarUsuarios()
      setUsuarioSeleccionado(null)
      limpiarFormulario()
    } else {
      mostrarNotificacion(resultado.error, 'error')
    }
  }

  // Manejar eliminación de usuario
  const manejarEliminarUsuario = async (usuarioId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      const resultado = await eliminarUsuario(usuarioId)
      
      if (resultado.success) {
        mostrarNotificacion(resultado.message, 'success')
        cargarUsuarios()
        cargarEstadisticas()
      } else {
        mostrarNotificacion(resultado.error, 'error')
      }
    }
  }

  // Manejar cambio de estado (activar/desactivar)
  const manejarCambiarEstado = async (usuarioId) => {
    const resultado = await cambiarEstadoUsuario(usuarioId)

    if (resultado.success) {
      mostrarNotificacion(resultado.message, 'success')
      cargarUsuarios()
      cargarEstadisticas()
    } else {
      mostrarNotificacion(resultado.error, 'error')
    }
  }

  // Manejar reset de password
  const manejarResetPassword = async (usuarioId) => {
    if (window.confirm('¿Generar nueva contraseña temporal para este usuario?')) {
      const resultado = await resetearPassword(usuarioId)
      
      if (resultado.success) {
        const mensaje = resultado.data.passwordTemporal 
          ? `Nueva contraseña: ${resultado.data.passwordTemporal}`
          : 'Contraseña restablecida. El usuario recibirá un email.'
        mostrarNotificacion(mensaje, 'success')
      } else {
        mostrarNotificacion(resultado.error, 'error')
      }
    }
  }

  const limpiarFormulario = () => {
    setFormularioUsuario({
      nombre: '',
      email: '',
      password: '',
      rol: 'estudiante',
      departamento: '',
      especialidad: '', // Cambiar curso por especialidad
      telefono: '',
      dni: '',
      universidad: '',
      especialidades: [],
      permisos: []
    })
  }

  const abrirModalCrear = () => {
    limpiarFormulario()
    setUsuarioSeleccionado(null)
    setModalActivo({ tipo: 'crear' })
  }

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario)
    // Combinar nombre y apellidos para mostrar en el formulario
    const nombreCompleto = usuario.apellidos
      ? `${usuario.nombre} ${usuario.apellidos}`
      : usuario.nombre

    // Convertir array de roles de Symfony a rol simple para el formulario
    const rolMapping = {
      'ROLE_ADMIN': 'admin',
      'ROLE_PRESIDENTE_TRIBUNAL': 'presidente',
      'ROLE_PROFESOR': 'profesor',
      'ROLE_ESTUDIANTE': 'estudiante'
    }

    const rolSimple = usuario.roles && usuario.roles.length > 0
      ? rolMapping[usuario.roles[0]] || 'estudiante'
      : usuario.rol || 'estudiante'

    setFormularioUsuario({
      nombre: nombreCompleto,
      email: usuario.email,
      password: '', // No cargamos el password en edición
      rol: rolSimple,
      departamento: usuario.departamento || '',
      especialidad: usuario.especialidad || '', // Cambiar curso por especialidad
      telefono: usuario.telefono || '',
      dni: usuario.dni || '',
      universidad: usuario.universidad || '',
      especialidades: usuario.especialidades || [],
      permisos: usuario.permisos || []
    })
    setModalActivo({ tipo: 'editar' })
  }

  // Convertir roles de Symfony a texto legible
  const obtenerRolPrincipal = (usuario) => {
    if (!usuario.roles || usuario.roles.length === 0) return 'estudiante'

    const rol = usuario.roles[0]
    const roleMapping = {
      'ROLE_ADMIN': 'admin',
      'ROLE_PRESIDENTE_TRIBUNAL': 'presidente',
      'ROLE_PROFESOR': 'profesor',
      'ROLE_ESTUDIANTE': 'estudiante'
    }

    return roleMapping[rol] || 'estudiante'
  }

  // Filtrar y ordenar usuarios
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const rolPrincipal = obtenerRolPrincipal(usuario)

    // Filtrar por rol
    if (filtros.rol !== 'todos' && rolPrincipal !== filtros.rol) {
      return false
    }

    // Filtrar por estado
    if (filtros.estado === 'activo' && !usuario.is_active) return false
    if (filtros.estado === 'inactivo' && usuario.is_active) return false

    // Filtrar por departamento
    if (filtros.departamento !== 'todos' && usuario.departamento !== filtros.departamento) {
      return false
    }

    // Filtrar por búsqueda
    if (filtros.busqueda) {
      const termino = filtros.busqueda.toLowerCase()
      const nombreCompleto = `${usuario.nombre} ${usuario.apellidos || ''}`.toLowerCase()
      const email = usuario.email.toLowerCase()

      if (!nombreCompleto.includes(termino) && !email.includes(termino)) {
        return false
      }
    }

    return true
  })

  // Ordenar usuarios filtrados
  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
    const valorA = a[ordenamiento.campo]
    const valorB = b[ordenamiento.campo]

    if (ordenamiento.direccion === 'asc') {
      return valorA > valorB ? 1 : -1
    } else {
      return valorA < valorB ? 1 : -1
    }
  })

  // Obtener icono y color por rol
  const obtenerIconoRol = (rolTexto) => {
    switch (rolTexto) {
      case 'admin': return { icono: '👑', color: 'text-red-600' }
      case 'presidente': return { icono: '⚖️', color: 'text-purple-600' }
      case 'profesor': return { icono: '👨‍🏫', color: 'text-blue-600' }
      case 'estudiante': return { icono: '🎓', color: 'text-green-600' }
      default: return { icono: '👤', color: 'text-gray-600' }
    }
  }

  // Obtener color por estado activo/inactivo
  const obtenerColorEstado = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  // Obtener texto del estado
  const obtenerTextoEstado = (isActive) => {
    return isActive ? 'Activo' : 'Inactivo'
  }

  if (loading && usuarios.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Administra usuarios, roles y permisos del sistema</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setVistaActiva('lista')}
            className={`px-4 py-2 rounded-md ${vistaActiva === 'lista' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            👥 Usuarios
          </button>
          <button
            onClick={abrirModalCrear}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.totalUsuarios}</div>
              <div className="text-sm text-gray-500">Total Usuarios</div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{estadisticas.usuariosActivos}</div>
              <div className="text-sm text-gray-500">Usuarios Activos</div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{estadisticas.porRol.profesor}</div>
              <div className="text-sm text-gray-500">Profesores</div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{estadisticas.nuevosUltimoMes}</div>
              <div className="text-sm text-gray-500">Nuevos este mes</div>
            </div>
          </div>
        </div>
      )}

      {/* Vista Lista de Usuarios */}
      {vistaActiva === 'lista' && (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={filtros.rol}
                  onChange={(e) => setFiltros({...filtros, rol: e.target.value})}
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
                  value={filtros.estado}
                  onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
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
                  value={filtros.departamento}
                  onChange={(e) => setFiltros({...filtros, departamento: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="todos">Todos los departamentos</option>
                  <option value="ingeniería">Ingeniería de Software</option>
                  <option value="datos">Análisis de Datos</option>
                  <option value="móvil">Desarrollo Móvil</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Nombre o email..."
                />
              </div>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" style={{ width: '30%' }}
                      onClick={() => setOrdenamiento({
                        campo: 'nombre',
                        direccion: ordenamiento.campo === 'nombre' && ordenamiento.direccion === 'asc' ? 'desc' : 'asc'
                      })}>
                    Usuario {ordenamiento.campo === 'nombre' && (ordenamiento.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '15%' }}>
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '12%' }}>
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '43%' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuariosOrdenados.map((usuario) => {
                  const rolPrincipal = obtenerRolPrincipal(usuario)
                  const { icono, color } = obtenerIconoRol(rolPrincipal)

                  return (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap" style={{ width: '30%' }}>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-lg">{icono}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {usuario.apellidos ? `${usuario.nombre} ${usuario.apellidos}` : usuario.nombre}
                            </div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                            {usuario.departamento && (
                              <div className="text-xs text-gray-400">{usuario.departamento}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ width: '15%' }}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} bg-gray-100`}>
                          {rolPrincipal.charAt(0).toUpperCase() + rolPrincipal.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ width: '12%' }}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${obtenerColorEstado(usuario.is_active)}`}>
                          {obtenerTextoEstado(usuario.is_active)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ width: '43%' }}>
                        <div className="flex items-center justify-start gap-2">
                          <button
                            onClick={() => abrirModalEditar(usuario)}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 text-sm"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => manejarCambiarEstado(usuario.id)}
                            className={`px-2 py-1 text-sm min-w-[100px] ${usuario.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {usuario.is_active ? '⏸️ Desactivar' : '▶️ Activar'}
                          </button>
                          <button
                            onClick={() => manejarResetPassword(usuario.id)}
                            className="text-yellow-600 hover:text-yellow-900 px-2 py-1 text-sm"
                          >
                            🔑 Reset Pass
                          </button>
                          <button
                            onClick={() => manejarEliminarUsuario(usuario.id)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 text-sm"
                            disabled={usuario.id === 3} // No eliminar admin principal
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {usuariosOrdenados.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-500 mb-4">Ajusta los filtros o crea un nuevo usuario</p>
              <button
                onClick={abrirModalCrear}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Crear Primer Usuario
              </button>
            </div>
          )}
        </div>
      )}

      {/* Vista Estadísticas */}
      {vistaActiva === 'estadisticas' && estadisticas && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📊 Análisis Detallado</h2>
            
            {/* Gráficos de distribución */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Distribución por roles */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-4">Distribución por Roles</h3>
                <div className="space-y-3">
                  {Object.entries(estadisticas.porRol).map(([rol, cantidad]) => {
                    const porcentaje = ((cantidad / estadisticas.totalUsuarios) * 100).toFixed(1)
                    const { icono, color } = obtenerIconoRol(rol)
                    return (
                      <div key={rol} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{icono}</span>
                          <span className={`font-medium ${color}`}>
                            {rol.charAt(0).toUpperCase() + rol.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-200 rounded-full h-2 w-20 overflow-hidden">
                            <div 
                              className={`h-full ${color.includes('red') ? 'bg-red-500' : color.includes('blue') ? 'bg-blue-500' : 'bg-green-500'}`}
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {cantidad} ({porcentaje}%)
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Distribución por departamentos */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-4">Por Departamentos</h3>
                <div className="space-y-3">
                  {estadisticas.departamentos.map((dept, index) => {
                    const porcentaje = ((dept.usuarios / estadisticas.totalUsuarios) * 100).toFixed(1)
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{dept.nombre}</span>
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-200 rounded-full h-2 w-16 overflow-hidden">
                            <div 
                              className="h-full bg-purple-500"
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {dept.usuarios} ({porcentaje}%)
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Métricas de tendencias */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  +{estadisticas.tendencias.crecimientoMensual}%
                </div>
                <div className="text-sm text-blue-700">Crecimiento Mensual</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {estadisticas.tendencias.actividad}%
                </div>
                <div className="text-sm text-green-700">Nivel de Actividad</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {estadisticas.tendencias.retencion}%
                </div>
                <div className="text-sm text-purple-700">Tasa de Retención</div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">ℹ️ Información Adicional</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Último acceso promedio:</strong><br/>
                  {new Date(estadisticas.ultimoAccesoPromedio).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div>
                  <strong>Usuarios inactivos:</strong><br/>
                  {estadisticas.usuariosInactivos} usuarios sin actividad reciente
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista Logs */}
      {vistaActiva === 'logs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">📋 Registro de Actividad</h2>
              <p className="text-sm text-gray-600 mt-1">Historial de acciones realizadas en el sistema</p>
            </div>
            
            <div className="p-6">
              {loading && logs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando logs...</p>
                </div>
              ) : logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log) => {
                    const fechaFormateada = new Date(log.timestamp).toLocaleString('es-ES')
                    
                    // Obtener icono según la acción
                    const obtenerIconoAccion = (accion) => {
                      switch (accion) {
                        case 'login': return '🔐'
                        case 'logout': return '🚪'
                        case 'create_user': return '👤➕'
                        case 'update_user': return '✏️'
                        case 'delete_user': return '🗑️'
                        case 'upload_tfg': return '📄⬆️'
                        case 'create_tribunal': return '⚖️➕'
                        case 'modify_tribunal': return '⚖️✏️'
                        default: return '📝'
                      }
                    }

                    // Obtener color según la acción
                    const obtenerColorAccion = (accion) => {
                      if (accion.includes('delete')) return 'text-red-600 bg-red-50'
                      if (accion.includes('create')) return 'text-green-600 bg-green-50'
                      if (accion.includes('update') || accion.includes('modify')) return 'text-blue-600 bg-blue-50'
                      if (accion === 'login') return 'text-purple-600 bg-purple-50'
                      return 'text-gray-600 bg-gray-50'
                    }

                    return (
                      <div key={log.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg border border-gray-100">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${obtenerColorAccion(log.accion)}`}>
                          <span className="text-sm">{obtenerIconoAccion(log.accion)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {log.usuario}
                            </p>
                            <p className="text-xs text-gray-500">
                              {fechaFormateada}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {log.descripcion}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <span>ID: {log.usuarioId}</span>
                            <span>IP: {log.ip}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {log.accion.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                  <p className="text-gray-500">No se encontraron logs de actividad</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear/editar usuario */}
      {modalActivo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header del modal */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalActivo.tipo === 'crear' ? '➕ Crear Nuevo Usuario' : '✏️ Editar Usuario'}
                </h3>
                <button
                  onClick={() => setModalActivo(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={modalActivo.tipo === 'crear' ? manejarCrearUsuario : manejarEditarUsuario} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={formularioUsuario.nombre}
                      onChange={(e) => setFormularioUsuario({...formularioUsuario, nombre: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Dr. María García"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formularioUsuario.email}
                      onChange={(e) => setFormularioUsuario({...formularioUsuario, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="nombre@uni.edu"
                      required
                    />
                  </div>

                  {/* Password - Solo en creación */}
                  {modalActivo.tipo === 'crear' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        value={formularioUsuario.password}
                        onChange={(e) => setFormularioUsuario({...formularioUsuario, password: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        La contraseña debe tener al menos 6 caracteres
                      </p>
                    </div>
                  )}

                  {/* Rol */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol *
                    </label>
                    <select
                      value={formularioUsuario.rol}
                      onChange={(e) => setFormularioUsuario({...formularioUsuario, rol: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="estudiante">🎓 Estudiante</option>
                      <option value="profesor">👨‍🏫 Profesor</option>
                      <option value="admin">👑 Administrador</option>
                    </select>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formularioUsuario.telefono}
                      onChange={(e) => setFormularioUsuario({...formularioUsuario, telefono: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+34 600 123 456"
                    />
                  </div>

                  {/* DNI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DNI
                    </label>
                    <input
                      type="text"
                      value={formularioUsuario.dni}
                      onChange={(e) => setFormularioUsuario({...formularioUsuario, dni: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12345678X"
                    />
                  </div>

                  {/* Universidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Universidad
                    </label>
                    <input
                      type="text"
                      value={formularioUsuario.universidad}
                      onChange={(e) => setFormularioUsuario({...formularioUsuario, universidad: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Universidad de Cádiz"
                    />
                  </div>

                  {/* Departamento - Solo para profesores */}
                  {formularioUsuario.rol === 'profesor' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departamento *
                      </label>
                      <select
                        value={formularioUsuario.departamento}
                        onChange={(e) => setFormularioUsuario({...formularioUsuario, departamento: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={formularioUsuario.rol === 'profesor'}
                      >
                        <option value="">Seleccionar departamento</option>
                        <option value="Ingeniería de Software">Ingeniería de Software</option>
                        <option value="Desarrollo Móvil">Desarrollo Móvil</option>
                        <option value="Análisis de Datos">Análisis de Datos</option>
                        <option value="Administración de Sistemas">Administración de Sistemas</option>
                      </select>
                    </div>
                  )}

                  {/* Curso - Solo para estudiantes */}
                  {formularioUsuario.rol === 'estudiante' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Curso *
                      </label>
                      <select
                        value={formularioUsuario.especialidad}
                        onChange={(e) => setFormularioUsuario({...formularioUsuario, especialidad: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={formularioUsuario.rol === 'estudiante'}
                      >
                        <option value="">Seleccionar curso</option>
                        <option value="1º Ingeniería Informática">1º Ingeniería Informática</option>
                        <option value="2º Ingeniería Informática">2º Ingeniería Informática</option>
                        <option value="3º Ingeniería Informática">3º Ingeniería Informática</option>
                        <option value="4º Ingeniería Informática">4º Ingeniería Informática</option>
                        <option value="Máster en Ingeniería de Software">Máster en Ingeniería de Software</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Especialidades - Solo para profesores */}
                {formularioUsuario.rol === 'profesor' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especialidades
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['Desarrollo Web', 'Bases de Datos', 'Android', 'iOS', 'React Native', 'Big Data', 'Estadística', 'Machine Learning', 'Inteligencia Artificial', 'Seguridad'].map((especialidad) => (
                        <label key={especialidad} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formularioUsuario.especialidades.includes(especialidad)}
                            onChange={(e) => {
                              const especialidades = e.target.checked 
                                ? [...formularioUsuario.especialidades, especialidad]
                                : formularioUsuario.especialidades.filter(esp => esp !== especialidad)
                              setFormularioUsuario({...formularioUsuario, especialidades})
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{especialidad}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Permisos - Solo para administradores */}
                {formularioUsuario.rol === 'admin' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permisos de Administrador
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['usuarios', 'sistema', 'reportes', 'configuracion', 'tribunales', 'tfgs'].map((permiso) => (
                        <label key={permiso} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formularioUsuario.permisos.includes(permiso)}
                            onChange={(e) => {
                              const permisos = e.target.checked 
                                ? [...formularioUsuario.permisos, permiso]
                                : formularioUsuario.permisos.filter(p => p !== permiso)
                              setFormularioUsuario({...formularioUsuario, permisos})
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700 capitalize">{permiso}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mensaje de error */}
                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setModalActivo(null)}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <span>{modalActivo.tipo === 'crear' ? 'Crear Usuario' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionUsuarios