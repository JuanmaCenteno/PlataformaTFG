// src/pages/estudiante/Notificaciones.jsx
import { useState } from "react"
import { Link } from "react-router-dom"
import { useNotificaciones } from "../../context/NotificacionesContext"

function Notificaciones() {
	const {
		notificaciones,
		noLeidas,
		marcarComoLeida,
		marcarTodasComoLeidas,
		eliminarNotificacion,
	} = useNotificaciones()
	const [filtro, setFiltro] = useState("todas") // todas, noLeidas, comentarios, estados

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

	const getTipoColor = (tipo) => {
		switch (tipo) {
			case "comentario":
				return "bg-blue-100 text-blue-800"
			case "estado":
				return "bg-yellow-100 text-yellow-800"
			case "defensa":
				return "bg-green-100 text-green-800"
			case "aprobacion":
				return "bg-green-100 text-green-800"
			default:
				return "bg-gray-100 text-gray-800"
		}
	}

	const formatearFecha = (fecha) => {
		const hoy = new Date()
		const ayer = new Date(hoy)
		ayer.setDate(ayer.getDate() - 1)

		if (fecha.toDateString() === hoy.toDateString()) {
			return `Hoy a las ${fecha.toLocaleTimeString("es-ES", {
				hour: "2-digit",
				minute: "2-digit",
			})}`
		} else if (fecha.toDateString() === ayer.toDateString()) {
			return `Ayer a las ${fecha.toLocaleTimeString("es-ES", {
				hour: "2-digit",
				minute: "2-digit",
			})}`
		} else {
			return fecha.toLocaleDateString("es-ES", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			})
		}
	}

	const notificacionesFiltradas = notificaciones.filter((notif) => {
		switch (filtro) {
			case "noLeidas":
				return !notif.leida
			case "comentarios":
				return notif.tipo === "comentario"
			case "estados":
				return (
					notif.tipo === "estado" ||
					notif.tipo === "defensa" ||
					notif.tipo === "aprobacion"
				)
			default:
				return true
		}
	})

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">
					Notificaciones
				</h1>
				<p className="text-gray-600 mt-2">
					Mantente al día con las actualizaciones de tus TFGs
				</p>
			</div>

			{/* Estadísticas rápidas */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white shadow rounded-lg p-6">
					<div className="text-center">
						<div className="text-2xl font-bold text-blue-600">
							{notificaciones.length}
						</div>
						<div className="text-sm text-gray-500">Total</div>
					</div>
				</div>
				<div className="bg-white shadow rounded-lg p-6">
					<div className="text-center">
						<div className="text-2xl font-bold text-red-600">
							{noLeidas}
						</div>
						<div className="text-sm text-gray-500">No leídas</div>
					</div>
				</div>
				<div className="bg-white shadow rounded-lg p-6">
					<div className="text-center">
						<div className="text-2xl font-bold text-green-600">
							{
								notificaciones.filter(
									(n) => n.tipo === "comentario"
								).length
							}
						</div>
						<div className="text-sm text-gray-500">Comentarios</div>
					</div>
				</div>
				<div className="bg-white shadow rounded-lg p-6">
					<div className="text-center">
						<div className="text-2xl font-bold text-purple-600">
							{
								notificaciones.filter(
									(n) =>
										n.tipo === "estado" ||
										n.tipo === "defensa"
								).length
							}
						</div>
						<div className="text-sm text-gray-500">Estados</div>
					</div>
				</div>
			</div>

			{/* Filtros y acciones */}
			<div className="bg-white shadow rounded-lg p-6 mb-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
					<div className="flex space-x-2">
						{[
							{
								key: "todas",
								label: "Todas",
								count: notificaciones.length,
							},
							{
								key: "noLeidas",
								label: "No leídas",
								count: noLeidas,
							},
							{
								key: "comentarios",
								label: "Comentarios",
								count: notificaciones.filter(
									(n) => n.tipo === "comentario"
								).length,
							},
							{
								key: "estados",
								label: "Estados",
								count: notificaciones.filter(
									(n) =>
										n.tipo === "estado" ||
										n.tipo === "defensa"
								).length,
							},
						].map((opcion) => (
							<button
								key={opcion.key}
								onClick={() => setFiltro(opcion.key)}
								className={`px-3 py-2 rounded-md text-sm font-medium ${
									filtro === opcion.key
										? "bg-blue-100 text-blue-700"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								{opcion.label}
								{opcion.count > 0 && (
									<span
										className={`ml-2 px-2 py-1 rounded-full text-xs ${
											filtro === opcion.key
												? "bg-blue-200 text-blue-800"
												: "bg-gray-200 text-gray-600"
										}`}
									>
										{opcion.count}
									</span>
								)}
							</button>
						))}
					</div>

					{noLeidas > 0 && (
						<button
							onClick={marcarTodasComoLeidas}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
						>
							Marcar todas como leídas
						</button>
					)}
				</div>
			</div>

			{/* Lista de notificaciones */}
			<div className="bg-white shadow rounded-lg">
				{notificacionesFiltradas.length === 0 ? (
					<div className="p-12 text-center">
						<div className="text-6xl mb-4">🔔</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{filtro === "noLeidas"
								? "No tienes notificaciones sin leer"
								: "No hay notificaciones"}
						</h3>
						<p className="text-gray-500">
							{filtro === "noLeidas"
								? "¡Excelente! Estás al día con todas las actualizaciones"
								: "Las notificaciones aparecerán aquí cuando haya actualizaciones en tus TFGs"}
						</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{notificacionesFiltradas.map((notificacion) => (
							<div
								key={notificacion.id}
								className={`p-6 hover:bg-gray-50 ${
									!notificacion.leida
										? "bg-blue-50 border-l-4 border-blue-400"
										: ""
								}`}
							>
								<div className="flex items-start space-x-4">
									{/* Icono y indicador de no leída */}
									<div className="flex-shrink-0 relative">
										<div
											className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
												!notificacion.leida
													? "bg-blue-100"
													: "bg-gray-100"
											}`}
										>
											{getIconoTipo(notificacion.tipo)}
										</div>
										{!notificacion.leida && (
											<div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
										)}
									</div>

									{/* Contenido */}
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-1">
													<h3
														className={`text-sm font-medium ${
															!notificacion.leida
																? "text-gray-900"
																: "text-gray-700"
														}`}
													>
														{notificacion.titulo}
													</h3>
													<span
														className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(
															notificacion.tipo
														)}`}
													>
														{notificacion.tipo}
													</span>
												</div>
												<p className="text-sm text-gray-600 mb-2">
													{notificacion.mensaje}
												</p>
												<p className="text-xs text-gray-500">
													{formatearFecha(
														notificacion.fecha
													)}
												</p>
											</div>

											{/* Acciones */}
											<div className="flex items-center space-x-2 ml-4">
												<Link
													to={notificacion.enlace}
													className="text-blue-600 hover:text-blue-800 text-sm font-medium"
													onClick={() =>
														!notificacion.leida &&
														marcarComoLeida(
															notificacion.id
														)
													}
												>
													Ver
												</Link>
												{!notificacion.leida && (
													<button
														onClick={() =>
															marcarComoLeida(
																notificacion.id
															)
														}
														className="text-gray-600 hover:text-gray-800 text-sm"
													>
														Marcar como leída
													</button>
												)}
												<button
													onClick={() =>
														eliminarNotificacion(
															notificacion.id
														)
													}
													className="text-red-600 hover:text-red-800 text-sm"
												>
													Eliminar
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Configuración de notificaciones */}
			<div className="mt-8 bg-white shadow rounded-lg p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Configuración de Notificaciones
				</h2>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">
								Comentarios del tutor
							</h3>
							<p className="text-sm text-gray-500">
								Recibir notificaciones cuando tu tutor añada
								comentarios
							</p>
						</div>
						<button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
							<span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
						</button>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">
								Cambios de estado
							</h3>
							<p className="text-sm text-gray-500">
								Notificar cuando el estado de tu TFG cambie
							</p>
						</div>
						<button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
							<span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
						</button>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">
								Recordatorios de defensa
							</h3>
							<p className="text-sm text-gray-500">
								Recibir recordatorios sobre fechas de defensa
							</p>
						</div>
						<button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
							<span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Notificaciones
