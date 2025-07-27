function TFGsAsignados() {
  const tfgsAsignados = [
    { id: 1, titulo: 'Sistema de Gestión de TFGs', estudiante: 'Juan Pérez', estado: 'En revisión' },
    { id: 2, titulo: 'App Móvil para Delivery', estudiante: 'María Silva', estado: 'Aprobado' },
    { id: 3, titulo: 'IA para Diagnóstico Médico', estudiante: 'Carlos Ruiz', estado: 'Borrador' }
  ]

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Aprobado': return 'bg-green-100 text-green-800'
      case 'En revisión': return 'bg-yellow-100 text-yellow-800'
      case 'Borrador': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">TFGs Asignados</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tfgsAsignados.map((tfg) => (
            <li key={tfg.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-blue-600 truncate">
                      {tfg.titulo}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Estudiante: <span className="font-medium">{tfg.estudiante}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(tfg.estado)}`}>
                      {tfg.estado}
                    </span>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Ver
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm">
                        Evaluar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default TFGsAsignados