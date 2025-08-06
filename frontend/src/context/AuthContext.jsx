import { createContext, useContext, useState, useEffect } from 'react'

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

  // Usuarios de prueba (después vendrá de Symfony)
  const usersDatabase = [
    {
      id: 1,
      email: 'estudiante@uni.es',
      password: '123456',
      nombre: 'Juan Pérez',
      role: 'estudiante'
    },
    {
      id: 2,
      email: 'profesor@uni.es',
      password: '123456',
      nombre: 'Dr. María García',
      role: 'profesor'
    },
    {
      id: 3,
      email: 'admin@uni.es',
      password: '123456',
      nombre: 'Carlos Admin',
      role: 'admin'
    }
  ]

  // Verificar si hay usuario guardado al cargar la app
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  // Función de login
  const login = async (email, password) => {
    try {
      // Simular llamada a API (después será axios a Symfony)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay

      const foundUser = usersDatabase.find(
        u => u.email === email && u.password === password
      )

      if (!foundUser) {
        throw new Error('Credenciales incorrectas')
      }

      // Quitar password del objeto usuario
      const { password: _, ...userWithoutPassword } = foundUser
      
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
      
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Función de logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  // Verificar si usuario tiene un rol específico
  const hasRole = (requiredRole) => {
    return user?.role === requiredRole
  }

  // Verificar si usuario está autenticado
  const isAuthenticated = () => {
    return !!user
  }

  const value = {
    user,
    login,
    logout,
    hasRole,
    isAuthenticated,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}