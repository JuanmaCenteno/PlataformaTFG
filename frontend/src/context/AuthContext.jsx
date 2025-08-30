import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar si hay usuario guardado al cargar la app
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  // Función de login con JWT
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      
      const { token, refresh_token, user: userData } = response.data

      // Guardar tokens y datos del usuario
      localStorage.setItem('token', token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      
      return { success: true, user: userData }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al iniciar sesión'
      return { success: false, error: errorMessage }
    }
  }

  // Función de logout
  const logout = async () => {
    try {
      // Intentar invalidar el token en el backend
      await authAPI.logout()
    } catch (error) {
      // Si falla, no importa, limpiamos local igualmente
      console.log('Error al hacer logout:', error.message)
    } finally {
      // Limpiar todos los datos locales
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
    }
  }

  // Verificar si usuario tiene un rol específico
  const hasRole = (requiredRole) => {
    if (!user || !user.roles) return false
    
    // Los roles de Symfony vienen en formato ['ROLE_ESTUDIANTE', 'ROLE_ADMIN']
    const roleMap = {
      'estudiante': 'ROLE_ESTUDIANTE',
      'profesor': 'ROLE_PROFESOR', 
      'presidente': 'ROLE_PRESIDENTE_TRIBUNAL',
      'admin': 'ROLE_ADMIN'
    }
    
    const symfonyRole = roleMap[requiredRole] || requiredRole
    return user.roles.includes(symfonyRole)
  }

  // Verificar si usuario está autenticado
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token')
  }

  // Obtener rol principal del usuario (para compatibilidad)
  const getUserRole = () => {
    if (!user || !user.roles || user.roles.length === 0) return null
    
    // Mapear roles de Symfony a roles simples del frontend
    const roleMap = {
      'ROLE_ADMIN': 'admin',
      'ROLE_PRESIDENTE_TRIBUNAL': 'presidente', 
      'ROLE_PROFESOR': 'profesor',
      'ROLE_ESTUDIANTE': 'estudiante'
    }
    
    // Devolver el rol más específico (orden de jerarquía)
    const hierarchy = ['ROLE_ADMIN', 'ROLE_PRESIDENTE_TRIBUNAL', 'ROLE_PROFESOR', 'ROLE_ESTUDIANTE']
    
    for (const role of hierarchy) {
      if (user.roles.includes(role)) {
        return roleMap[role]
      }
    }
    
    return 'estudiante' // rol por defecto
  }

  const value = {
    user,
    login,
    logout,
    hasRole,
    isAuthenticated,
    getUserRole,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}