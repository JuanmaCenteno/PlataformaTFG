import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

function DetalleTFG() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [tfg, setTfg] = useState(null)
	const [loading, setLoading] = useState(true)
	const [activeTab, setActiveTab] = useState("detalles")

	// Simular carga de datos del TFG
	useEffect(() => {
		const cargarTFG = async () => {
			setLoading(true)

			// Simular llamada a API
			await new Promise((resolve) => setTimeout(resolve, 1000))

			// Datos simulados del TFG específico
			const tfgData = {
				id: parseInt(id),
				titulo: "Sistema de Gestión de TFGs con React y Symfony",
				resumen:
					"Este trabajo presenta el desarrollo de una plataforma web completa para la gestión de Trabajos de Fin de Grado en instituciones educativas. La solución implementa un frontend moderno usando React con TypeScript y un backend robusto desarrollado en Symfony, permitiendo a estudiantes, profesores y administradores gestionar eficientemente todo el proceso académico desde la propuesta inicial hasta la defensa final.",
				palabrasClave:
					"React, Symfony, TFG, Sistema de gestión, Educación",
				area: "Desarrollo Web",
				tipoTFG: "Desarrollo de Software",
				idioma: "Español",
				estado: "En revisión",
				fechaSubida: "2025-01-15T10:30:00Z",
				fechaUltimaActualizacion: "2025-01-20T14:45:00Z",
				tutor: {
					nombre: "Dr. María García",
					email: "maria.garcia@universidad.edu",
					departamento: "Ingeniería Informática",
				},
				archivo: {
					nombre: "tfg_juan_perez_v2.pdf",
					tamaño: "2.5 MB",
					fechaSubida: "2025-01-20T14:45:00Z",
				},
				comentarios: [
					{
						id: 1,
						autor: "Dr. María García",
						fecha: "2025-01-20T14:45:00Z",
						tipo: "revision",
						mensaje:
							"El trabajo presenta una buena estructura general. Sin embargo, es necesario ampliar la sección de metodología y añadir más detalles sobre las pruebas realizadas.",
						estado: "pendiente",
					},
					{
						id: 2,
						autor: "Dr. María García",
						fecha: "2025-01-18T09:15:00Z",
						tipo: "aprobacion",
						mensaje:
							"La propuesta inicial está bien fundamentada. Puedes proceder con el desarrollo completo del sistema.",
						estado: "resuelto",
					},
				],
				historial: [
					{
						id: 1,
						fecha: "2025-01-20T14:45:00Z",
						accion: "Comentario añadido",
						descripcion:
							"Dr. María García añadió comentarios de revisión",
						tipo: "comentario",
					},
					{
						id: 2,
						fecha: "2025-01-20T14:40:00Z",
						accion: "Archivo actualizado",
						descripcion: "Subida nueva versión del documento (v2)",
						tipo: "archivo",
					},
					{
						id: 3,
						fecha: "2025-01-18T09:15:00Z",
						accion: "Estado cambiado",
						descripcion:
							"Estado cambiado de 'Borrador' a 'En revisión'",
						tipo: "estado",
					},
					{
						id: 4,
						fecha: "2025-01-15T10:30:00Z",
						accion: "TFG creado",
						descripcion:
							"Trabajo de Fin de Grado subido inicialmente",
						tipo: "creacion",
					},
				],
				progreso: {
					actual: 60,
					etapas: [
						{
							nombre: "Propuesta",
							completada: true,
							fecha: "2025-01-15",
						},
						{
							nombre: "En revisión",
							completada: true,
							fecha: "2025-01-18",
						},
						{
							nombre: "Aprobación",
							completada: false,
							fecha: null,
						},
						{ nombre: "Defensa", completada: false, fecha: null },
					],
				},
			}

			setTfg(tfgData)
			setLoading(false)
		}

		cargarTFG()
	}, [id])

	const getEstadoColor = (estado) => {
		switch (estado) {
			case "Aprobado":
				return "bg-green-100 text-green-800 border-green-200"
			case "En revisión":
				return "bg-yellow-100 text-yellow-800 border-yellow-200"
			case "Rechazado":
				return "bg-red-100 text-red-800 border-red-200"
			case "Borrador":
				return "bg-gray-100 text-gray-800 border-gray-200"
			default:
				return "bg-gray-100 text-gray-800 border-gray-200"
		}
	}

	const getTipoComentarioColor = (tipo) => {
		switch (tipo) {
			case "aprobacion":
				return "bg-green-50 border-green-200"
			case "revision":
				return "bg-yellow-50 border-yellow-200"
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
								Tutor: <strong>{tfg.tutor.nombre}</strong>
							</span>
							<span>•</span>
							<span>
								Área: <strong>{tfg.area}</strong>
							</span>
							<span>•</span>
							<span>
								Subido:{" "}
								{new Date(tfg.fechaSubida).toLocaleDateString(
									"es-ES"
								)}
							</span>
						</div>
					</div>

					<div className="ml-6">
						<span
							className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border ${getEstadoColor(
								tfg.estado
							)}`}
						>
							{tfg.estado}
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
						<span>{tfg.progreso.actual}%</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-3">
						<div
							className="bg-blue-600 h-3 rounded-full transition-all duration-300"
							style={{ width: `${tfg.progreso.actual}%` }}
						></div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{tfg.progreso.etapas.map((etapa, index) => (
						<div key={index} className="text-center">
							<div
								className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
									etapa.completada
										? "bg-green-100 text-green-800"
										: "bg-gray-100 text-gray-600"
								}`}
							>
								{etapa.completada ? "✓" : index + 1}
							</div>
							<p className="text-sm font-medium text-gray-900 mt-2">
								{etapa.nombre}
							</p>
							{etapa.fecha && (
								<p className="text-xs text-gray-500">
									{new Date(etapa.fecha).toLocaleDateString(
										"es-ES"
									)}
								</p>
							)}
						</div>
					))}
				</div>
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
								badge: tfg.comentarios.filter(
									(c) => c.estado === "pendiente"
								).length,
							},
							{ id: "historial", name: "Historial", icon: "📝" },
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
											Tipo de TFG
										</dt>
										<dd className="text-sm text-gray-900">
											{tfg.tipoTFG}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Idioma
										</dt>
										<dd className="text-sm text-gray-900">
											{tfg.idioma}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Departamento
										</dt>
										<dd className="text-sm text-gray-900">
											{tfg.tutor.departamento}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Última actualización
										</dt>
										<dd className="text-sm text-gray-900">
											{new Date(
												tfg.fechaUltimaActualizacion
											).toLocaleDateString("es-ES")}{" "}
											a las{" "}
											{new Date(
												tfg.fechaUltimaActualizacion
											).toLocaleTimeString("es-ES", {
												hour: "2-digit",
												minute: "2-digit",
											})}
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
									{tfg.palabrasClave
										.split(", ")
										.map((palabra, index) => (
											<span
												key={index}
												className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
											>
												{palabra}
											</span>
										))}
								</div>
							</div>

							<div>
								<h3 className="text-lg font-medium text-gray-900 mb-3">
									Tutor Asignado
								</h3>
								<div className="bg-gray-50 rounded-lg p-4">
									<div className="flex items-center space-x-3">
										<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
											{tfg.tutor.nombre
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</div>
										<div>
											<p className="text-sm font-medium text-gray-900">
												{tfg.tutor.nombre}
											</p>
											<p className="text-sm text-gray-500">
												{tfg.tutor.email}
											</p>
											<p className="text-sm text-gray-500">
												{tfg.tutor.departamento}
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
									Comentarios del Tutor (
									{tfg.comentarios.length})
								</h3>
								{tfg.comentarios.filter(
									(c) => c.estado === "pendiente"
								).length > 0 && (
									<span className="text-sm text-orange-600 font-medium">
										{
											tfg.comentarios.filter(
												(c) => c.estado === "pendiente"
											).length
										}{" "}
										comentarios pendientes
									</span>
								)}
							</div>

							{tfg.comentarios.length === 0 ? (
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
									{tfg.comentarios.map((comentario) => (
										<div
											key={comentario.id}
											className={`border rounded-lg p-4 ${getTipoComentarioColor(
												comentario.tipo
											)}`}
										>
											<div className="flex justify-between items-start mb-3">
												<div className="flex items-center space-x-2">
													<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
														{comentario.autor
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</div>
													<div>
														<p className="text-sm font-medium text-gray-900">
															{comentario.autor}
														</p>
														<p className="text-xs text-gray-500">
															{new Date(
																comentario.fecha
															).toLocaleDateString(
																"es-ES"
															)}{" "}
															a las{" "}
															{new Date(
																comentario.fecha
															).toLocaleTimeString(
																"es-ES",
																{
																	hour: "2-digit",
																	minute: "2-digit",
																}
															)}
														</p>
													</div>
												</div>
												<div className="flex items-center space-x-2">
													<span
														className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
															comentario.tipo ===
															"aprobacion"
																? "bg-green-100 text-green-800"
																: comentario.tipo ===
																  "revision"
																? "bg-yellow-100 text-yellow-800"
																: "bg-red-100 text-red-800"
														}`}
													>
														{comentario.tipo}
													</span>
													{comentario.estado ===
														"pendiente" && (
														<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
															Nuevo
														</span>
													)}
												</div>
											</div>
											<p className="text-sm text-gray-700">
												{comentario.mensaje}
											</p>

											{comentario.estado ===
												"pendiente" && (
												<div className="mt-3 pt-3 border-t border-gray-200">
													<button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
														Marcar como leído
													</button>
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* Tab: Historial */}
					{activeTab === "historial" && (
						<div className="space-y-6">
							<h3 className="text-lg font-medium text-gray-900">
								Historial de Cambios
							</h3>

							<div className="flow-root">
								<ul className="-mb-8">
									{tfg.historial.map((evento, eventoIdx) => (
										<li key={evento.id}>
											<div className="relative pb-8">
												{eventoIdx !==
												tfg.historial.length - 1 ? (
													<span
														className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
														aria-hidden="true"
													/>
												) : null}
												<div className="relative flex space-x-3">
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">
														{getIconoHistorial(
															evento.tipo
														)}
													</div>
													<div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
														<div>
															<p className="text-sm font-medium text-gray-900">
																{evento.accion}
															</p>
															<p className="text-sm text-gray-500">
																{
																	evento.descripcion
																}
															</p>
														</div>
														<div className="whitespace-nowrap text-right text-sm text-gray-500">
															<time
																dateTime={
																	evento.fecha
																}
															>
																{new Date(
																	evento.fecha
																).toLocaleDateString(
																	"es-ES"
																)}
															</time>
															<br />
															<time
																dateTime={
																	evento.fecha
																}
															>
																{new Date(
																	evento.fecha
																).toLocaleTimeString(
																	"es-ES",
																	{
																		hour: "2-digit",
																		minute: "2-digit",
																	}
																)}
															</time>
														</div>
													</div>
												</div>
											</div>
										</li>
									))}
								</ul>
							</div>
						</div>
					)}

					{/* Tab: Archivo */}
					{activeTab === "archivo" && (
						<div className="space-y-6">
							<h3 className="text-lg font-medium text-gray-900">
								Documento del TFG
							</h3>

							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
								<div className="text-center">
									<div className="text-4xl mb-4">📄</div>
									<h4 className="text-lg font-medium text-gray-900 mb-2">
										{tfg.archivo.nombre}
									</h4>
									<p className="text-sm text-gray-500 mb-4">
										Tamaño: {tfg.archivo.tamaño} • Subido:{" "}
										{new Date(
											tfg.archivo.fechaSubida
										).toLocaleDateString("es-ES")}
									</p>

									<div className="flex justify-center space-x-3">
										<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
											<span>👁️</span>
											<span>Previsualizar</span>
										</button>
										<button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2">
											<span>⬇️</span>
											<span>Descargar</span>
										</button>
									</div>

									{tfg.estado === "Borrador" && (
										<div className="mt-4 pt-4 border-t border-gray-200">
											<button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 mx-auto">
												<span>📎</span>
												<span>Subir Nueva Versión</span>
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default DetalleTFG
