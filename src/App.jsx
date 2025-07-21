import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="bg-blue-500 text-white p-8">
      <h1 className="text-4xl font-bold">Plataforma TFG</h1>
      <p className="text-xl mt-4">Sistema de gestión de Trabajos de Fin de Grado</p>
    </div>
  )
}

export default App
