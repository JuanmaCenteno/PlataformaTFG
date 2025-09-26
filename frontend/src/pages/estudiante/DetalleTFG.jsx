import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTFGs } from '../../hooks/useTFGs'
import { useNotificaciones } from '../../context/NotificacionesContext'

function DetalleTFG() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [tfg, setTfg] = useState(null)
	const [activeTab, setActiveTab] = useState("detalles")
	const [comentarios, setComentarios] = useState([])
	const [nuevoComentario, setNuevoComentario] = useState('')
	const [tipoComentario, setTipoComentario] = useState('feedback')
	const [enviandoComentario, setEnviandoComentario] = useState(false)
	const { obtenerTFG, obtenerComentarios, añadirComentario, descargarTFG, loading } = useTFGs()
	const { mostrarNotificacion } = useNotificaciones()

	// Cargar datos del TFG desde la API
	useEffect(() => {
		const cargarDatos = async () => {
			try {
				// Cargar TFG
				const resultadoTFG = await obtenerTFG(id)
				if (resultadoTFG.success) {
					setTfg(resultadoTFG.data)

					// Cargar comentarios
					const resultadoComentarios = await obtenerComentarios(id)
					if (resultadoComentarios.success) {
						setComentarios(resultadoComentarios.data || [])
					}
				} else {
					mostrarNotificacion(resultadoTFG.error || 'Error al cargar TFG', 'error')
				}
			} catch (error) {
				console.error('Error cargando datos:', error)
				mostrarNotificacion('Error al cargar los datos del TFG', 'error')
			}
		}

		if (id) {
			cargarDatos()
		}
	}, [id])

	// Función para manejar descarga de archivo
	const handleDescargar = async () => {
		try {
			const resultado = await descargarTFG(tfg.id, tfg.archivoOriginalName)
			if (!resultado.success) {
				mostrarNotificacion(resultado.error || 'Error al descargar el archivo', 'error')
			}
		} catch (error) {
			console.error('Error descargando archivo:', error)
			mostrarNotificacion('Error al descargar el archivo', 'error')
		}
	}

	// Función para enviar comentarios
	const handleEnviarComentario = async () => {
		if (!nuevoComentario.trim()) return

		setEnviandoComentario(true)

		try {
			const resultado = await añadirComentario(id, nuevoComentario, tipoComentario)
			if (resultado.success) {
				mostrarNotificacion('Comentario enviado correctamente', 'success')
				setNuevoComentario('')
				setTipoComentario('feedback')

				// Recargar comentarios
				const resultadoComentarios = await obtenerComentarios(id)
				if (resultadoComentarios.success) {
					setComentarios(resultadoComentarios.data || [])
				}
			} else {
				mostrarNotificacion(resultado.error || 'Error al enviar comentario', 'error')
			}
		} catch (error) {
			console.error('Error enviando comentario:', error)
			mostrarNotificacion('Error al enviar comentario', 'error')
		} finally {
			setEnviandoComentario(false)
		}
	}

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

	const getEstadoLabel = (estado) => {
		switch (estado) {
			case "aprobado":
				return "Aprobado para defensa"
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

	const getTipoComentarioColor = (tipo) => {
		switch (tipo) {
			case "aprobacion":
				return "bg-green-50 border-green-200"
			case "revision":
				return "bg-yellow-50 border-yellow-200"
			case "feedback":
				return "bg-blue-50 border-blue-200"
			case "rechazo":
				return "bg-red-50 border-red-200"
			default:
				return "bg-gray-50 border-gray-200"
		}
	}

	const getIconoHistorial = (tipo) => {
		switch (tipo) {
			case "comentario":
				return "💬"
			case "archivo":
				return "📎"
			case "estado":
				return "🔄"
			case "creacion":
				return "✨"
			default:
				return "📌"
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">
						Cargando detalles del TFG...
					</p>
				</div>
			</div>
		)
	}

	if (!tfg) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900">
						TFG no encontrado
					</h1>
					<p className="text-gray-600 mt-2">
						El trabajo solicitado no existe
					</p>
					<button
						onClick={() => navigate("/estudiante/mis-tfgs")}
						className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
					>
						Volver a Mis TFGs
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-6xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<button
					onClick={() => navigate("/estudiante/mis-tfgs")}
					className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
				>
					← Volver a Mis TFGs
				</button>

				<div className="flex justify-between items-start">
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							{tfg.titulo}
						</h1>
						<div className="flex items-center space-x-4 text-sm text-gray-600">
							<span>
								Tutor: <strong>{tfg.tutor?.nombreCompleto || 'No asignado'}</strong>
							</span>
							<span>•</span>
							<span>
								Subido:{" "}
								{tfg.createdAt ?
									new Date(tfg.createdAt).toLocaleDateString("es-ES") :
									'No disponible'
								}
							</span>
						</div>
					</div>

					<div className="ml-6">
						<span
							className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border ${getEstadoColor(
								tfg.estado
							)}`}
						>
							{getEstadoLabel(tfg.estado)}
						</span>
					</div>
				</div>
			</div>

			{/* Progress Bar */}
			<div className="bg-white shadow rounded-lg p-6 mb-8">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Progreso del TFG
				</h2>

				<div className="mb-4">
					<div className="flex justify-between text-sm text-gray-600 mb-2">
						<span>Progreso general</span>
						<span>{
							tfg.estado === "borrador" ? "25%" :
							tfg.estado === "revision" ? "50%" :
							tfg.estado === "aprobado" ? "75%" :
							tfg.estado === "defendido" ? "100%" :
							"0%"
						}</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-3">
						<div
							className="bg-blue-600 h-3 rounded-full transition-all duration-300"
							style={{
								width: tfg.estado === "borrador" ? "25%" :
									   tfg.estado === "revision" ? "50%" :
									   tfg.estado === "aprobado" ? "75%" :
									   tfg.estado === "defendido" ? "100%" :
									   "0%"
							}}
						></div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{[
						{ nombre: "Propuesta", key: "borrador" },
						{ nombre: "En revisión", key: "revision" },
						{ nombre: "Aprobación para defensa", key: "aprobado" },
						{ nombre: "Defensa", key: "defendido" }
					].map((etapa, index) => {
						const completada =
							(etapa.key === "borrador" && ["revision", "aprobado", "defendido"].includes(tfg.estado)) ||
							(etapa.key === "revision" && ["aprobado", "defendido"].includes(tfg.estado)) ||
							(etapa.key === "aprobado" && tfg.estado === "defendido") ||
							(etapa.key === "defendido" && tfg.estado === "defendido")

						return (
							<div key={index} className="text-center">
								<div
									className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
										completada || tfg.estado === etapa.key
											? "bg-green-100 text-green-800"
											: "bg-gray-100 text-gray-600"
									}`}
								>
									{completada ? "✓" : index + 1}
								</div>
								<p className="text-sm font-medium text-gray-900 mt-2">
									{etapa.nombre}
								</p>
								{tfg.estado === etapa.key && (
									<p className="text-xs text-gray-500">
										Actual
									</p>
								)}
							</div>
						)
					})}
				</div>

				{/* Calificación final */}
				{tfg.estado === 'defendido' && tfg.calificacion && (
					<div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
						<div className="flex items-center justify-center">
							<span className="text-green-400 text-2xl mr-3">🏆</span>
							<div className="text-center">
								<h3 className="text-lg font-semibold text-green-900 mb-1">
									¡Felicitaciones! TFG Defendido
								</h3>
								<p className="text-sm text-green-700 mb-2">
									Has completado exitosamente tu Trabajo de Fin de Grado
								</p>
								<div className="text-3xl font-bold text-green-800">
									{tfg.calificacion}/10
								</div>
								<p className="text-xs text-green-600 mt-1">Calificación final</p>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Tabs */}
			<div className="bg-white shadow rounded-lg">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8 px-6">
						{[
							{ id: "detalles", name: "Detalles", icon: "📋" },
							{
								id: "comentarios",
								name: "Comentarios",
								icon: "💬",
								badge: comentarios.length,
							},
							{ id: "archivo", name: "Archivo", icon: "📎" },
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
									activeTab === tab.id
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								<span>{tab.icon}</span>
								<span>{tab.name}</span>
								{tab.badge > 0 && (
									<span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
										{tab.badge}
									</span>
								)}
							</button>
						))}
					</nav>
				</div>

				<div className="p-6">
					{/* Tab: Detalles */}
					{activeTab === "detalles" && (
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-medium text-gray-900 mb-3">
									Información General
								</h3>
								<dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Estado
										</dt>
										<dd className="text-sm text-gray-900">
											{getEstadoLabel(tfg.estado)}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Progreso
										</dt>
										<dd className="text-sm text-gray-900">
											{tfg.progreso || 0}%
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Archivo subido
										</dt>
										<dd className="text-sm text-gray-900">
											{tfg.archivoOriginalName || 'No disponible'}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Última actualización
										</dt>
										<dd className="text-sm text-gray-900">
											{tfg.updatedAt ?
												new Date(tfg.updatedAt).toLocaleDateString("es-ES") + " a las " +
												new Date(tfg.updatedAt).toLocaleTimeString("es-ES", {
													hour: "2-digit",
													minute: "2-digit",
												}) :
												'No disponible'
											}
										</dd>
									</div>
								</dl>
							</div>

							<div>
								<h3 className="text-lg font-medium text-gray-900 mb-3">
									Resumen
								</h3>
								<p className="text-sm text-gray-700 leading-relaxed">
									{tfg.resumen}
								</p>
							</div>

							<div>
								<h3 className="text-lg font-medium text-gray-900 mb-3">
									Palabras Clave
								</h3>
								<div className="flex flex-wrap gap-2">
									{tfg.palabrasClave && Array.isArray(tfg.palabrasClave) && tfg.palabrasClave.length > 0 ?
										tfg.palabrasClave.map((palabra, index) => (
											<span
												key={index}
												className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
											>
												{palabra.trim()}
											</span>
										))
										: <span className="text-gray-500 text-sm">No especificadas</span>
									}
								</div>
							</div>

							<div>
								<h3 className="text-lg font-medium text-gray-900 mb-3">
									Tutor Asignado
								</h3>
								<div className="bg-gray-50 rounded-lg p-4">
									<div className="flex items-center space-x-3">
										<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
											{tfg.tutor?.iniciales || 'NA'}
										</div>
										<div>
											<p className="text-sm font-medium text-gray-900">
												{tfg.tutor?.nombreCompleto || 'No asignado'}
											</p>
											<p className="text-sm text-gray-500">
												{tfg.tutor?.email || 'No disponible'}
											</p>
											<p className="text-sm text-gray-500">
												{tfg.tutor?.rolPrincipal || 'Profesor'}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Tab: Comentarios */}
					{activeTab === "comentarios" && (
						<div className="space-y-6">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium text-gray-900">
									Historial de Comentarios ({comentarios.length})
								</h3>
							</div>

							{/* Formulario para añadir comentario */}
							<div className="bg-gray-50 rounded-lg p-6">
								<h4 className="text-md font-medium text-gray-900 mb-4">Añadir Comentario</h4>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Tipo de comentario
										</label>
										<select
											value={tipoComentario}
											onChange={(e) => setTipoComentario(e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="feedback">Consulta General</option>
											<option value="revision">Solicitar Revisión</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Comentario
										</label>
										<textarea
											value={nuevoComentario}
											onChange={(e) => setNuevoComentario(e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows={4}
											placeholder="Escribe tu consulta o comentario para tu tutor..."
										/>
									</div>
									<div className="flex justify-end">
										<button
											onClick={handleEnviarComentario}
											disabled={!nuevoComentario.trim() || enviandoComentario}
											className={`px-6 py-2 rounded-md text-white font-medium ${
												enviandoComentario || !nuevoComentario.trim()
													? 'bg-gray-400 cursor-not-allowed'
													: 'bg-blue-600 hover:bg-blue-700'
											}`}
										>
											{enviandoComentario ? 'Enviando...' : 'Enviar Comentario'}
										</button>
									</div>
								</div>
							</div>

							{comentarios.length === 0 ? (
								<div className="text-center py-12">
									<div className="text-4xl mb-4">💬</div>
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Sin comentarios
									</h3>
									<p className="text-gray-500">
										Aún no hay comentarios de tu tutor
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{comentarios.map((comentario) => (
										<div
											key={comentario.id}
											className={`border rounded-lg p-4 ${getTipoComentarioColor(
												comentario.tipo
											)}`}
										>
											<div className="flex justify-between items-start mb-3">
												<div className="flex items-center space-x-2">
													<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
														{comentario.autor?.nombreCompleto ?
															comentario.autor.nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() :
															'US'
														}
													</div>
													<div>
														<p className="text-sm font-medium text-gray-900">
															{comentario.autor?.nombreCompleto || comentario.autor?.nombre || 'Usuario'}
														</p>
														<p className="text-xs text-gray-500">
															{comentario.createdAt ? new Date(comentario.createdAt).toLocaleDateString('es-ES') : 'Fecha no disponible'} a las{' '}
															{comentario.createdAt ? new Date(comentario.createdAt).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}) : ''}
														</p>
													</div>
												</div>
												<div className="flex items-center space-x-2">
													<span
														className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
															comentario.tipo === 'aprobacion' ? 'bg-green-100 text-green-800' :
															comentario.tipo === 'revision' ? 'bg-yellow-100 text-yellow-800' :
															comentario.tipo === 'feedback' ? 'bg-blue-100 text-blue-800' :
															'bg-red-100 text-red-800'
														}`}
													>
														{comentario.tipo === 'aprobacion' ? 'Aprobación para defensa' :
														 comentario.tipo === 'revision' ? 'Revisión' :
														 comentario.tipo === 'feedback' ? 'Comentario' :
														 comentario.tipo}
													</span>
												</div>
											</div>
											<p className="text-sm text-gray-700">
												{comentario.comentario}
											</p>
										</div>
									))}
								</div>
							)}
						</div>
					)}


					{/* Tab: Archivo */}
					{activeTab === "archivo" && (
						<div className="space-y-6">
							<h3 className="text-lg font-medium text-gray-900">
								Documento del TFG
							</h3>

							{tfg.archivoOriginalName ? (
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
									<div className="text-center">
										<div className="text-4xl mb-4">📄</div>
										<h4 className="text-lg font-medium text-gray-900 mb-2">
											{tfg.archivoOriginalName}
										</h4>
										<p className="text-sm text-gray-500 mb-4">
											Subido: {new Date(tfg.createdAt).toLocaleDateString("es-ES")}
											{tfg.archivoInfo?.size_formatted && (
												<> • Tamaño: {tfg.archivoInfo.size_formatted}</>
											)}
										</p>

										<div className="flex justify-center space-x-3">
											<button
												onClick={handleDescargar}
												className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2"
											>
												<span>⬇️</span>
												<span>Descargar</span>
											</button>
										</div>

										{tfg.estado === "borrador" && (
											<div className="mt-4 pt-4 border-t border-gray-200">
												<button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 mx-auto">
													<span>📎</span>
													<span>Subir Nueva Versión</span>
												</button>
											</div>
										)}
									</div>
								</div>
							) : (
								<div className="text-center py-12">
									<div className="text-4xl mb-4">📎</div>
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Sin archivo
									</h3>
									<p className="text-gray-500">
										No se ha subido ningún documento para este TFG
									</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default DetalleTFG
