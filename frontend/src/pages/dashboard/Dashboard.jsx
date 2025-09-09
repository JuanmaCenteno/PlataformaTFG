import { useAuth } from '../../context/AuthContext'
import DashboardEstudiante from '../../components/dashboards/DashboardEstudiante'
import DashboardProfesor from '../../components/dashboards/DashboardProfesor'
import DashboardAdmin from '../../components/dashboards/DashboardAdmin'

function Dashboard() {
  const { user, getUserRole } = useAuth()

  // Mostrar dashboard según el rol del usuario
  switch (getUserRole()) {
    case 'estudiante':
      return <DashboardEstudiante user={user} />
    case 'profesor':
      return <DashboardProfesor user={user} />
    case 'admin':
      return <DashboardAdmin user={user} />
    default:
      return (
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Rol no reconocido</p>
          </div>
        </div>
      )
  }
}

export default Dashboard