import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTFGs } from '../../hooks/useTFGs'
import { useNotificaciones } from '../../context/NotificacionesContext'

function MisTFGs() {
	const location = useLocation()
	const [showMessage, setShowMessage] = useState(false)
	const [message, setMessage] = useState("")
	const { obtenerMisTFGs, loading } = useTFGs()
	const { mostrarNotificacion } = useNotificaciones()
	const [tfgs, setTfgs] = useState([])

	// Mostrar mensaje de éxito si viene de subida
	useEffect(() => {
		if (location.state?.message) {
			setMessage(location.state.message)
			setShowMessage(true)
			setTimeout(() => setShowMessage(false), 5000)
		}
	}, [location.state])

	// Cargar TFGs del usuario desde la API
	useEffect(() => {
		const cargarTFGs = async () => {
			try {
				const resultado = await obtenerMisTFGs()
				if (resultado.success) {
					setTfgs(resultado.data || [])
				} else {
					mostrarNotificacion(resultado.error || 'Error al cargar TFGs', 'error')
					setTfgs([])
				}
			} catch (error) {
				console.error('Error cargando TFGs:', error)
				mostrarNotificacion('Error al cargar TFGs', 'error')
				setTfgs([])
			}
		}

		cargarTFGs()
	}, [])

	const getEstadoColor = (estado) => {
		switch (estado) {
			case "aprobado":
				return "bg-green-100 text-green-800 border-green-200"
			case "revision":
				return "bg-yellow-100 text-yellow-800 border-yellow-200"
			case "rechazado":
				return "bg-red-100 text-red-800 border-red-200"
			case "borrador":
				return "bg-gray-100 text-gray-800 border-gray-200"
			case "defendido":
				return "bg-blue-100 text-blue-800 border-blue-200"
			default:
				return "bg-gray-100 text-gray-800 border-gray-200"
		}
	}

	const getEstadoIcon = (estado) => {
		switch (estado) {
			case "aprobado":
				return "✅"
			case "revision":
				return "⏳"
			case "rechazado":
				return "❌"
			case "borrador":
				return "📝"
			case "defendido":
				return "🎯"
			default:
				return "📄"
		}
	}

	const getEstadoLabel = (estado) => {
		switch (estado) {
			case "aprobado":
				return "Aprobado"
			case "revision":
				return "En revisión"
			case "rechazado":
				return "Rechazado"
			case "borrador":
				return "Borrador"
			case "defendido":
				return "Defendido"
			default:
				return estado
		}
	}

	if (loading) {
		return (
			<div className="max-w-6xl mx-auto">
				<div className="flex justify-center items-center h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">Cargando tus TFGs...</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-6xl mx-auto">
			{/* Mensaje de éxito */}
			{showMessage && (
				<div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<span className="text-green-400 text-lg">✅</span>
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-green-800">
								{message}
							</p>
						</div>
						<div className="ml-auto pl-3">
							<button
								onClick={() => setShowMessage(false)}
								className="text-green-400 hover:text-green-600"
							>
								✕
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Mi TFG
					</h1>
					<p className="text-gray-600 mt-2">
						Gestiona tu Trabajo de Fin de Grado
					</p>
				</div>
				<Link
					to="/estudiante/subir-tfg"
					className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
				>
					<span>📎</span>
					<span>Subir Mi TFG</span>
				</Link>
			</div>

			{/* Lista de TFGs */}
			{tfgs.length === 0 ? (
				<div className="bg-white shadow rounded-lg p-12 text-center">
					<div className="text-6xl mb-4">📚</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No tienes tu TFG subido
					</h3>
					<p className="text-gray-500 mb-6">
						Sube tu Trabajo de Fin de Grado para comenzar el
						proceso de revisión
					</p>
					<Link
						to="/estudiante/subir-tfg"
						className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
					>
						Subir mi TFG
					</Link>
				</div>
			) : (
				<div className="space-y-6">
					{tfgs.map((tfg) => (
						<div
							key={tfg.id}
							className="bg-white shadow rounded-lg overflow-hidden"
						>
							<div className="p-6">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center space-x-3 mb-2">
											<h3 className="text-xl font-semibold text-gray-900">
												{tfg.titulo}
											</h3>
											<span
												className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getEstadoColor(
													tfg.estado
												)}`}
											>
												<span className="mr-1">
													{getEstadoIcon(tfg.estado)}
												</span>
												{getEstadoLabel(tfg.estado)}
											</span>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
											<div>
												<span className="font-medium">
													Tutor:
												</span>{" "}
												{tfg.tutor?.nombreCompleto || 'No asignado'}
											</div>
											<div>
												<span className="font-medium">
													Palabras clave:
												</span>{" "}
												{tfg.palabrasClave && Array.isArray(tfg.palabrasClave) ?
													tfg.palabrasClave.join(', ') :
													'No especificadas'
												}
											</div>
											<div>
												<span className="font-medium">
													Creado:
												</span>{" "}
												{tfg.createdAt ?
													new Date(tfg.createdAt).toLocaleDateString("es-ES") :
													'No disponible'
												}
											</div>
										</div>

										{/* Información del resumen si existe */}
										{tfg.resumen && (
											<div className="mb-4">
												<p className="text-sm text-gray-600 line-clamp-2">
													<span className="font-medium">Resumen:</span> {tfg.resumen}
												</p>
											</div>
										)}

										{/* Información adicional según estado */}
										{tfg.comentarios && tfg.comentarios > 0 && (
											<div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
												<div className="flex items-center">
													<span className="text-blue-400 mr-2">
														💬
													</span>
													<p className="text-sm text-blue-800">
														Tienes{" "}
														<strong>
															{tfg.comentarios}{" "}
															comentarios nuevos
														</strong>{" "}
														de tu tutor
													</p>
												</div>
											</div>
										)}

										{tfg.calificacion && (
											<div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
												<div className="flex items-center">
													<span className="text-green-400 mr-2">
														🏆
													</span>
													<p className="text-sm text-green-800">
														<strong>
															Calificación:
														</strong>{" "}
														{tfg.calificacion}
													</p>
												</div>
											</div>
										)}
									</div>

									{/* Acciones */}
									<div className="flex flex-col space-y-2 ml-6">
										<Link
											to={`/estudiante/tfg/${tfg.id}`}
											className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 text-center"
										>
											Ver Detalles
										</Link>
										{tfg.estado === "borrador" && (
											<button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
												Editar
											</button>
										)}
										{tfg.comentarios > 0 && (
											<Link
												to={`/estudiante/tfg/${tfg.id}`}
												className="bg-orange-100 text-orange-700 px-4 py-2 rounded-md text-sm hover:bg-orange-200 text-center"
											>
												Ver Comentarios
											</Link>
										)}
									</div>
								</div>
							</div>

							{/* Progress bar para TFGs en proceso */}
							{tfg.estado !== "borrador" &&
								tfg.estado !== "defendido" && (
									<div className="px-6 pb-4">
										<div className="flex justify-between text-sm text-gray-600 mb-2">
											<span>Progreso del TFG</span>
											<span>
												{tfg.estado === "revision"
													? "60%"
													: tfg.estado === "aprobado"
													? "90%"
													: "30%"}
											</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className={`h-2 rounded-full ${
													tfg.estado === "revision"
														? "bg-yellow-500"
														: tfg.estado ===
														  "aprobado"
														? "bg-green-500"
														: "bg-red-500"
												}`}
												style={{
													width:
														tfg.estado ===
														"revision"
															? "60%"
															: tfg.estado ===
															  "aprobado"
															? "90%"
															: "30%",
												}}
											></div>
										</div>
										<div className="flex justify-between text-xs text-gray-500 mt-1">
											<span>Subido</span>
											<span>En revisión</span>
											<span>Aprobado</span>
											<span>Defensa</span>
										</div>
									</div>
								)}
						</div>
					))}
				</div>
			)}

			{/* Resumen estadístico */}
			{tfgs.length > 0 && (
				<div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="bg-white shadow rounded-lg p-6 text-center">
						<div className="text-2xl font-bold text-blue-600">
							{tfgs.length}
						</div>
						<div className="text-sm text-gray-500">
							Versiones
						</div>
					</div>
					<div className="bg-white shadow rounded-lg p-6 text-center">
						<div className="text-2xl font-bold text-yellow-600">
							{
								tfgs.filter((t) => t.estado === "revision")
									.length
							}
						</div>
						<div className="text-sm text-gray-500">En Revisión</div>
					</div>
					<div className="bg-white shadow rounded-lg p-6 text-center">
						<div className="text-2xl font-bold text-green-600">
							{tfgs.filter((t) => t.estado === "aprobado").length}
						</div>
						<div className="text-sm text-gray-500">Aprobado</div>
					</div>
					<div className="bg-white shadow rounded-lg p-6 text-center">
						<div className="text-2xl font-bold text-gray-600">
							{tfgs.filter((t) => t.estado === "borrador").length}
						</div>
						<div className="text-sm text-gray-500">Borradores</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default MisTFGs
