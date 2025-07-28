import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { useNotificaciones } from "../context/NotificacionesContext"

function NotificacionesDropdown() {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef(null)
	const { notificaciones, noLeidas, marcarComoLeida, marcarTodasComoLeidas } =
		useNotificaciones()

	// Cerrar dropdown al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	const getIconoTipo = (tipo) => {
		switch (tipo) {
			case "comentario":
				return "💬"
			case "estado":
				return "🔄"
			case "defensa":
				return "🎯"
			case "aprobacion":
				return "✅"
			default:
				return "📌"
		}
	}

	const formatearTiempo = (fecha) => {
		const ahora = new Date()
		const diff = ahora - fecha
		const minutos = Math.floor(diff / (1000 * 60))
		const horas = Math.floor(diff / (1000 * 60 * 60))
		const dias = Math.floor(diff / (1000 * 60 * 60 * 24))

		if (minutos < 60) {
			return `Hace ${minutos} min`
		} else if (horas < 24) {
			return `Hace ${horas}h`
		} else {
			return `Hace ${dias}d`
		}
	}

	return (
		<div className="relative" ref={dropdownRef}>
			{/* Botón de notificaciones */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
			>
				<span className="text-xl">🔔</span>
				{noLeidas > 0 && (
					<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
						{noLeidas > 9 ? "9+" : noLeidas}
					</span>
				)}
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
					{/* Header */}
					<div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
						<h3 className="text-lg font-semibold text-gray-900">
							Notificaciones
						</h3>
						{noLeidas > 0 && (
							<button
								onClick={marcarTodasComoLeidas}
								className="text-sm text-blue-600 hover:text-blue-800"
							>
								Marcar todas como leídas
							</button>
						)}
					</div>

					{/* Lista de notificaciones */}
					<div className="max-h-96 overflow-y-auto">
						{notificaciones.length === 0 ? (
							<div className="px-4 py-8 text-center">
								<div className="text-4xl mb-2">🔔</div>
								<p className="text-gray-500">
									No tienes notificaciones
								</p>
							</div>
						) : (
							notificaciones.slice(0, 10).map((notificacion) => (
								<div
									key={notificacion.id}
									className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
										!notificacion.leida ? "bg-blue-50" : ""
									}`}
									onClick={() => {
										if (!notificacion.leida) {
											marcarComoLeida(notificacion.id)
										}
										setIsOpen(false)
									}}
								>
									<Link
										to={notificacion.enlace}
										className="block"
									>
										<div className="flex items-start space-x-3">
											<div className="flex-shrink-0 mt-1">
												<span className="text-lg">
													{getIconoTipo(
														notificacion.tipo
													)}
												</span>
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between">
													<p
														className={`text-sm font-medium ${
															!notificacion.leida
																? "text-gray-900"
																: "text-gray-700"
														}`}
													>
														{notificacion.titulo}
													</p>
													{!notificacion.leida && (
														<div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
													)}
												</div>
												<p className="text-sm text-gray-600 mt-1">
													{notificacion.mensaje}
												</p>
												<p className="text-xs text-gray-500 mt-1">
													{formatearTiempo(
														notificacion.fecha
													)}
												</p>
											</div>
										</div>
									</Link>
								</div>
							))
						)}
					</div>

					{/* Footer */}
					{notificaciones.length > 0 && (
						<div className="px-4 py-3 border-t border-gray-200">
							<Link
								to="/estudiante/notificaciones"
								className="block text-center text-sm text-blue-600 hover:text-blue-800"
								onClick={() => setIsOpen(false)}
							>
								Ver todas las notificaciones
							</Link>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default NotificacionesDropdown
