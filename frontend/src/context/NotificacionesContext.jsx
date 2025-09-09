import { createContext, useContext, useState, useEffect } from "react"

const NotificacionesContext = createContext()

export const useNotificaciones = () => {
	const context = useContext(NotificacionesContext)
	if (!context) {
		throw new Error(
			"useNotificaciones debe usarse dentro de NotificacionesProvider"
		)
	}
	return context
}

export const NotificacionesProvider = ({ children }) => {
	const [notificaciones, setNotificaciones] = useState([])
	const [noLeidas, setNoLeidas] = useState(0)
	const [toast, setToast] = useState(null)

	// Simular notificaciones iniciales
	useEffect(() => {
		const notificacionesIniciales = [
			{
				id: 1,
				tipo: "comentario",
				titulo: "Nuevo comentario en tu TFG",
				mensaje: "Dr. María García ha añadido comentarios a tu trabajo",
				fecha: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
				leida: false,
				enlace: "/estudiante/tfg/1",
			},
			{
				id: 2,
				tipo: "estado",
				titulo: "Estado del TFG actualizado",
				mensaje: 'Tu TFG ha cambiado a estado "En revisión"',
				fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
				leida: false,
				enlace: "/estudiante/tfg/1",
			},
			{
				id: 3,
				tipo: "defensa",
				titulo: "Fecha de defensa programada",
				mensaje: "Tu defensa ha sido programada para el 15 de febrero",
				fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
				leida: true,
				enlace: "/estudiante/defensa",
			},
		]

		setNotificaciones(notificacionesIniciales)
		setNoLeidas(notificacionesIniciales.filter((n) => !n.leida).length)
	}, [])

	// Simular llegada de nuevas notificaciones
	useEffect(() => {
		const interval = setInterval(() => {
			// 10% de probabilidad de recibir una notificación cada 30 segundos
			if (Math.random() < 0.1) {
				const nuevaNotificacion = {
					id: Date.now(),
					tipo: "comentario",
					titulo: "Nueva actividad en tu TFG",
					mensaje: "Hay actualizaciones en tu trabajo",
					fecha: new Date(),
					leida: false,
					enlace: "/estudiante/tfg/1",
				}

				setNotificaciones((prev) => [nuevaNotificacion, ...prev])
				setNoLeidas((prev) => prev + 1)
			}
		}, 30000) // 30 segundos

		return () => clearInterval(interval)
	}, [])

	const marcarComoLeida = (id) => {
		setNotificaciones((prev) =>
			prev.map((notif) =>
				notif.id === id ? { ...notif, leida: true } : notif
			)
		)
		setNoLeidas((prev) => Math.max(0, prev - 1))
	}

	const marcarTodasComoLeidas = () => {
		setNotificaciones((prev) =>
			prev.map((notif) => ({ ...notif, leida: true }))
		)
		setNoLeidas(0)
	}

	const eliminarNotificacion = (id) => {
		const notificacion = notificaciones.find((n) => n.id === id)
		setNotificaciones((prev) => prev.filter((n) => n.id !== id))
		if (notificacion && !notificacion.leida) {
			setNoLeidas((prev) => Math.max(0, prev - 1))
		}
	}

	const mostrarNotificacion = (mensaje, tipo = 'info', duracion = 3000) => {
		const nuevaToast = {
			id: Date.now(),
			mensaje,
			tipo, // 'success', 'error', 'warning', 'info'
			timestamp: Date.now()
		}
		
		setToast(nuevaToast)
		
		// Auto-dismiss después de la duración especificada
		setTimeout(() => {
			setToast(null)
		}, duracion)
	}

	const value = {
		notificaciones,
		noLeidas,
		marcarComoLeida,
		marcarTodasComoLeidas,
		eliminarNotificacion,
		mostrarNotificacion,
		toast
	}

	return (
		<NotificacionesContext.Provider value={value}>
			{children}
			{/* Toast notification */}
			{toast && (
				<div className="fixed top-4 right-4 z-50 max-w-sm">
					<div className={`px-4 py-3 rounded-lg shadow-lg border-l-4 ${
						toast.tipo === 'success' ? 'bg-green-100 border-green-500 text-green-800' :
						toast.tipo === 'error' ? 'bg-red-100 border-red-500 text-red-800' :
						toast.tipo === 'warning' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
						'bg-blue-100 border-blue-500 text-blue-800'
					}`}>
						<div className="flex items-center justify-between">
							<p className="font-medium">{toast.mensaje}</p>
							<button 
								onClick={() => setToast(null)}
								className="ml-3 text-lg font-bold opacity-70 hover:opacity-100"
							>
								×
							</button>
						</div>
					</div>
				</div>
			)}
		</NotificacionesContext.Provider>
	)
}
