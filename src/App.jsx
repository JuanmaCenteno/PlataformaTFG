import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Importar Context y componentes
import { AuthProvider } from './context/AuthContext'
import { NotificacionesProvider } from './context/NotificacionesContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Importar páginas
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import MisTFGs from './pages/estudiante/MisTFGs'
import SubirTFG from './pages/estudiante/SubirTFG'
import DetalleTFG from './pages/estudiante/DetalleTFG'
import Notificaciones from './pages/estudiante/Notificaciones'
import MiDefensa from './pages/estudiante/MiDefensa'
import TFGsAsignados from './pages/profesor/TFGsAsignados'
import DetalleTFGProfesor from './pages/profesor/DetalleTFGProfesor'
import Tribunales from './pages/profesor/Tribunales'
import DetalleTribunal from './pages/profesor/DetalleTribunal'
import Calendario from './pages/profesor/Calendario'
import GestionUsuarios from './pages/admin/GestionUsuarios'

function App() {
  return (
    <AuthProvider>
      <NotificacionesProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta raíz redirige al dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rutas de autenticación */}
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard principal - requiere autenticación */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Rutas de estudiante - solo para estudiantes */}
            <Route path="/estudiante/mis-tfgs" element={
              <ProtectedRoute requiredRole="estudiante">
                <Layout><MisTFGs /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/estudiante/subir-tfg" element={
              <ProtectedRoute requiredRole="estudiante">
                <Layout><SubirTFG /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/estudiante/tfg/:id" element={
              <ProtectedRoute requiredRole="estudiante">
                <Layout><DetalleTFG /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/estudiante/notificaciones" element={
              <ProtectedRoute requiredRole="estudiante">
                <Layout><Notificaciones /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/estudiante/defensa" element={
              <ProtectedRoute requiredRole="estudiante">
                <Layout><MiDefensa /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Rutas de profesor - solo para profesores */}
            <Route path="/profesor/tfgs-asignados" element={
              <ProtectedRoute requiredRole="profesor">
                <Layout><TFGsAsignados /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profesor/tfg/:id" element={
              <ProtectedRoute requiredRole="profesor">
                <Layout><DetalleTFGProfesor /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profesor/tribunales" element={
              <ProtectedRoute requiredRole="profesor">
                <Layout><Tribunales /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profesor/tribunal/:id" element={
              <ProtectedRoute requiredRole="profesor">
                <Layout><DetalleTribunal /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profesor/calendario" element={
              <ProtectedRoute requiredRole="profesor">
                <Layout><Calendario /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Rutas de administrador - solo para admins */}
            <Route path="/admin/usuarios" element={
              <ProtectedRoute requiredRole="admin">
                <Layout><GestionUsuarios /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Ruta 404 */}
            <Route path="*" element={
              <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900">404</h1>
                  <p className="text-gray-600 mt-2">Página no encontrada</p>
                  <a href="/dashboard" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                    Volver al dashboard
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </NotificacionesProvider>
    </AuthProvider>
  )
}

export default App