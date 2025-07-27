function Calendario() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Calendario de Defensas</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <span className="text-6xl">📅</span>
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            Calendario de Defensas
          </h3>
          <p className="text-gray-500 mt-2">
            Aquí se integrará FullCalendar.js para gestionar las defensas
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900">Próximas Defensas</h4>
              <p className="text-sm text-gray-500 mt-1">15 de Febrero - Juan Pérez</p>
              <p className="text-sm text-gray-500">17 de Febrero - María Silva</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900">Mis Tribunales</h4>
              <p className="text-sm text-gray-500 mt-1">3 tribunales asignados</p>
              <p className="text-sm text-gray-500">2 como presidente</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900">Disponibilidad</h4>
              <p className="text-sm text-gray-500 mt-1">Lunes a Viernes</p>
              <p className="text-sm text-gray-500">09:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendario