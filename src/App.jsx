import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Importar Layout
import Layout from './components/Layout'

// Importar páginas
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import MisTFGs from './pages/estudiante/MisTFGs'
import MiDefensa from './pages/estudiante/MiDefensa'
import TFGsAsignados from './pages/profesor/TFGsAsignados'
import Tribunales from './pages/profesor/Tribunales'
import Calendario from './pages/profesor/Calendario'
import GestionUsuarios from './pages/admin/GestionUsuarios'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz redirige al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard principal */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        
        {/* Rutas de estudiante */}
        <Route path="/estudiante/mis-tfgs" element={<Layout><MisTFGs /></Layout>} />
        <Route path="/estudiante/defensa" element={<Layout><MiDefensa /></Layout>} />
        
        {/* Rutas de profesor */}
        <Route path="/profesor/tfgs-asignados" element={<Layout><TFGsAsignados /></Layout>} />
        <Route path="/profesor/tribunales" element={<Layout><Tribunales /></Layout>} />
        <Route path="/profesor/calendario" element={<Layout><Calendario /></Layout>} />
        
        {/* Rutas de administrador */}
        <Route path="/admin/usuarios" element={<Layout><GestionUsuarios /></Layout>} />
        
        {/* Ruta 404 - cualquier ruta no encontrada */}
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
  )
}

export default App