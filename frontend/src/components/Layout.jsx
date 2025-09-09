import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import NotificacionesDropdown from "./NotificacionesDropdown"

function Layout({ children }) {
	const location = useLocation()
	const navigate = useNavigate()
	const { user, logout, getUserRole } = useAuth()

	const userRole = getUserRole()

	const getNavigationItems = () => {
		const baseItems = [
			{ name: "Dashboard", href: "/dashboard", icon: "🏠" },
		]

		switch (userRole) {
			case "estudiante":
				return [
					...baseItems,
					{
						name: "Mi TFG",
						href: "/estudiante/mis-tfgs",
						icon: "📄",
					},
					{
						name: "Mi Defensa",
						href: "/estudiante/defensa",
						icon: "🎯",
					},
				]
			case "profesor":
				return [
					...baseItems,
					{
						name: "TFGs Asignados",
						href: "/profesor/tfgs-asignados",
						icon: "📚",
					},
					{
						name: "Tribunales",
						href: "/profesor/tribunales",
						icon: "⚖️",
					},
					{
						name: "Calendario",
						href: "/profesor/calendario",
						icon: "📅",
					},
				]
			case "admin":
				return [
					...baseItems,
					{ name: "Usuarios", href: "/admin/usuarios", icon: "👥" },
					{ name: "Reportes", href: "/admin/reportes", icon: "📊" },
				]
			default:
				return baseItems
		}
	}

	const navigationItems = getNavigationItems()

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<nav className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center">
							<Link
								to="/dashboard"
								className="text-xl font-semibold text-blue-600"
							>
								📚 Plataforma TFG
							</Link>
						</div>
						<div className="flex items-center space-x-4">
							<NotificacionesDropdown />
							<span className="text-sm text-gray-500">
								{userRole ? (
									userRole.charAt(0).toUpperCase() + userRole.slice(1)
								) : 'Usuario'}
								: {user?.nombre || user?.nombreCompleto || 'Usuario'}
							</span>
							<button
								onClick={() => {
									logout()
									navigate("/login")
								}}
								className="text-sm text-red-600 hover:text-red-800"
							>
								Salir
							</button>
						</div>
					</div>
				</div>
			</nav>

			<div className="flex">
				{/* Sidebar */}
				<div className="w-64 bg-white shadow-sm min-h-screen">
					<nav className="mt-5 px-2">
						<div className="space-y-1">
							{navigationItems.map((item) => {
								const isActive = location.pathname === item.href
								return (
									<Link
										key={item.name}
										to={item.href}
										className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${
							isActive
								? "bg-blue-100 text-blue-900"
								: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
						}
                    `}
									>
										<span className="mr-3 text-lg">
											{item.icon}
										</span>
										{item.name}
									</Link>
								)
							})}
						</div>
					</nav>
				</div>

				{/* Main content */}
				<div className="flex-1">
					<main className="py-6 px-4 sm:px-6 lg:px-8">
						{children}
					</main>
				</div>
			</div>
		</div>
	)
}

export default Layout
