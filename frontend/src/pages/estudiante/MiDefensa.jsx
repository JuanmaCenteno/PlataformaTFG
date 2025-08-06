function MiDefensa() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Defensa</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado de la Defensa</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-lg">⏰</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Pendiente de Programación
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Tu TFG ha sido aprobado y está esperando asignación de fecha de defensa.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Información del TFG</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Título</dt>
                <dd className="text-sm text-gray-900">Sistema de Gestión de TFGs con React y Symfony</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tutor</dt>
                <dd className="text-sm text-gray-900">Dr. María García</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Tribunal Asignado</h3>
            <div className="text-sm text-gray-600">
              <p><strong>Presidente:</strong> Dr. Carlos López</p>
              <p><strong>Vocal 1:</strong> Dra. Ana Martín</p>
              <p><strong>Vocal 2:</strong> Dr. Pedro Ruiz</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MiDefensa