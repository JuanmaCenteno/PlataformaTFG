import axios from 'axios'

// Configuración base de Axios
const API_BASE_URL = 'https://tfg-backend.ddev.site/api'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Interceptor para añadir token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }


    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejo de respuestas y refresh token
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Si el error es 401 y no hemos intentado refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          })

          const { token } = response.data
          localStorage.setItem('token', token)

          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Si el refresh falla, limpiar tokens y redirigir a login
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Servicios API organizados por módulos
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  logout: () => api.post('/auth/logout'),
}

export const tfgAPI = {
  getMisTFGs: () => api.get('/tfgs/mis-tfgs'),
  getTFGsAsignados: () => api.get('/tfgs/asignados'), // Para profesores
  getById: (id) => api.get(`/tfgs/${id}`),
  create: (formData) => api.post('/tfgs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/tfgs/${id}`, data),
  delete: (id) => api.delete(`/tfgs/${id}`),
  upload: (id, file, onProgress) => {
    const formData = new FormData()
    formData.append('archivo', file)
    
    return api.post(`/tfgs/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  download: (id) => api.get(`/tfgs/${id}/download`, {
    responseType: 'blob'
  }),
  updateEstado: (id, estado, comentario) => api.put(`/tfgs/${id}/estado`, {
    estado,
    comentario
  }),
  guardarBorrador: (data) => api.post('/tfgs/borrador', data),
  addComentario: (id, comentario, tipo) => api.post(`/tfgs/${id}/comentarios`, {
    comentario,
    tipo
  }),
  getComentarios: (id) => api.get(`/tfgs/${id}/comentarios`),
}

export const tribunalAPI = {
  getAll: () => api.get('/tribunales'),
  getById: (id) => api.get(`/tribunales/${id}`),
  create: (data) => api.post('/tribunales', data),
  update: (id, data) => api.put(`/tribunales/${id}`, data),
  delete: (id) => api.delete(`/tribunales/${id}`),
  getMiembros: (id) => api.get(`/tribunales/${id}/miembros`),
}

export const defensaAPI = {
  getCalendario: (fechaInicio, fechaFin) => api.get('/defensas/calendario', {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  }),
  getMiDefensa: () => api.get('/defensas/mi-defensa'),
  getPendientesCalificar: () => api.get('/defensas/pendientes-calificar'),
  getByTribunal: (tribunalId) => api.get(`/tribunales/${tribunalId}/defensas`),
  getById: (id) => api.get(`/defensas/${id}`),
  create: (data) => api.post('/defensas', data),
  update: (id, data) => api.put(`/defensas/${id}`, data),
  delete: (id) => api.delete(`/defensas/${id}`),
  changeEstado: (id, data) => api.put(`/defensas/${id}/estado`, data),
  calificar: (id, data) => api.post(`/defensas/${id}/calificaciones`, data),
  getCalificaciones: (id) => api.get(`/defensas/${id}/calificaciones`),
  generarActa: (id) => api.post(`/defensas/${id}/acta`),
  getActa: (id) => api.get(`/defensas/${id}/acta`, {
    responseType: 'blob'
  }),
  getInfoActa: (id) => api.get(`/defensas/${id}/acta/info`),
}

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getProfesores: () => api.get('/public/profesores'),
  getEstudiantes: () => api.get('/users/estudiantes'),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
}

export const notificacionAPI = {
  getAll: () => api.get('/notificaciones'),
  markAsRead: (id) => api.put(`/notificaciones/${id}/marcar-leida`),
  markAllAsRead: () => api.put('/notificaciones/marcar-todas-leidas'),
  delete: (id) => api.delete(`/notificaciones/${id}`),
}

export const reporteAPI = {
  getEstadisticas: () => api.get('/reportes/estadisticas'),
  getTFGsPorEstado: () => api.get('/reportes/tfgs-por-estado'),
  getTFGsPorArea: () => api.get('/reportes/tfgs-por-area'),
  exportPDF: (tipo) => api.get(`/reportes/export/pdf/${tipo}`),
  exportExcel: (tipo) => api.get(`/reportes/export/excel/${tipo}`),
  // Endpoints para datos detallados
  getTFGsDetallados: (filtros) => api.get('/tfgs', { params: filtros }),
  getUsuariosDetallados: (filtros) => api.get('/users', { params: filtros }),
  getTribunalesDetallados: (filtros) => api.get('/tribunales', { params: filtros }),
}

export const calificacionAPI = {
  create: (defensaId, data) => api.post(`/defensas/${defensaId}/calificaciones`, data),
  update: (id, data) => api.put(`/calificaciones/${id}`, data),
  get: (defensaId) => api.get(`/defensas/${defensaId}/calificaciones`),
}

// Export por defecto la instancia de axios configurada
export default api