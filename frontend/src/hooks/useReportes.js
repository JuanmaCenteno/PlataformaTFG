import { useState } from 'react'

export const useReportes = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Generar reporte de TFGs
  const generarReporteTFGs = async (filtros = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Datos simulados de TFGs
      const tfgsCompletos = [
        {
          id: 1,
          titulo: "Sistema de Gestión de TFGs con React y Symfony",
          estudiante: "Juan Pérez García",
          tutor: "Dr. María García López",
          tribunal: "Tribunal A - Desarrollo Web",
          estado: "Aprobado",
          fechaInicio: "2024-09-15T00:00:00Z",
          fechaDefensa: "2025-01-20T10:00:00Z",
          calificacion: 8.5,
          departamento: "Ingeniería de Software",
          modalidad: "Presencial",
          duracionDefensa: 45,
          observaciones: "Excelente presentación y desarrollo técnico"
        },
        {
          id: 2,
          titulo: "Aplicación Móvil para Gestión de Entregas",
          estudiante: "María Silva Rodríguez",
          tutor: "Dr. Pedro Ruiz",
          tribunal: "Tribunal B - Desarrollo Móvil", 
          estado: "En desarrollo",
          fechaInicio: "2024-10-01T00:00:00Z",
          fechaDefensa: "2025-02-15T11:30:00Z",
          calificacion: null,
          departamento: "Desarrollo Móvil",
          modalidad: "Online",
          duracionDefensa: null,
          observaciones: "En fase de desarrollo del backend"
        },
        {
          id: 3,
          titulo: "Sistema de Recomendación basado en IA",
          estudiante: "Carlos Ruiz Fernández",
          tutor: "Dra. Isabel Moreno",
          tribunal: "Tribunal C - Inteligencia Artificial",
          estado: "Aprobado",
          fechaInicio: "2024-09-10T00:00:00Z",
          fechaDefensa: "2025-01-18T09:00:00Z",
          calificacion: 9.2,
          departamento: "Análisis de Datos",
          modalidad: "Presencial",
          duracionDefensa: 50,
          observaciones: "Trabajo innovador con excelentes resultados"
        },
        {
          id: 4,
          titulo: "Plataforma E-commerce con Microservicios",
          estudiante: "Ana López Martín",
          tutor: "Dr. Carlos López",
          tribunal: null,
          estado: "En revisión",
          fechaInicio: "2024-11-01T00:00:00Z",
          fechaDefensa: null,
          calificacion: null,
          departamento: "Ingeniería de Software",
          modalidad: "Presencial",
          duracionDefensa: null,
          observaciones: "Pendiente de asignación de tribunal"
        },
        {
          id: 5,
          titulo: "Análisis de Sentimientos en Redes Sociales",
          estudiante: "Luis Fernández Díaz",
          tutor: "Dra. Isabel Moreno",
          tribunal: "Tribunal D - Machine Learning",
          estado: "Suspenso",
          fechaInicio: "2024-08-15T00:00:00Z",
          fechaDefensa: "2024-12-20T14:00:00Z",
          calificacion: 4.2,
          departamento: "Análisis de Datos",
          modalidad: "Presencial",
          duracionDefensa: 40,
          observaciones: "Requiere mejoras en la metodología aplicada"
        }
      ]

      // Aplicar filtros
      let tfgsFiltrados = tfgsCompletos

      if (filtros.estado && filtros.estado !== 'todos') {
        tfgsFiltrados = tfgsFiltrados.filter(tfg => tfg.estado.toLowerCase() === filtros.estado.toLowerCase())
      }

      if (filtros.tutor && filtros.tutor !== 'todos') {
        tfgsFiltrados = tfgsFiltrados.filter(tfg => tfg.tutor.includes(filtros.tutor))
      }

      if (filtros.departamento && filtros.departamento !== 'todos') {
        tfgsFiltrados = tfgsFiltrados.filter(tfg => tfg.departamento === filtros.departamento)
      }

      if (filtros.fechaInicio) {
        tfgsFiltrados = tfgsFiltrados.filter(tfg => 
          new Date(tfg.fechaInicio) >= new Date(filtros.fechaInicio)
        )
      }

      if (filtros.fechaFin) {
        tfgsFiltrados = tfgsFiltrados.filter(tfg => 
          tfg.fechaDefensa && new Date(tfg.fechaDefensa) <= new Date(filtros.fechaFin)
        )
      }

      // Generar estadísticas
      const estadisticas = {
        total: tfgsFiltrados.length,
        porEstado: {
          aprobado: tfgsFiltrados.filter(t => t.estado === 'Aprobado').length,
          enDesarrollo: tfgsFiltrados.filter(t => t.estado === 'En desarrollo').length,
          enRevision: tfgsFiltrados.filter(t => t.estado === 'En revisión').length,
          suspenso: tfgsFiltrados.filter(t => t.estado === 'Suspenso').length
        },
        promedioCalificacion: tfgsFiltrados
          .filter(t => t.calificacion)
          .reduce((acc, t, _, arr) => acc + t.calificacion / arr.length, 0)
          .toFixed(2),
        duracionPromedioDefensa: tfgsFiltrados
          .filter(t => t.duracionDefensa)
          .reduce((acc, t, _, arr) => acc + t.duracionDefensa / arr.length, 0)
          .toFixed(0),
        porDepartamento: tfgsFiltrados.reduce((acc, tfg) => {
          acc[tfg.departamento] = (acc[tfg.departamento] || 0) + 1
          return acc
        }, {}),
        porModalidad: {
          presencial: tfgsFiltrados.filter(t => t.modalidad === 'Presencial').length,
          online: tfgsFiltrados.filter(t => t.modalidad === 'Online').length
        }
      }

      return { 
        success: true, 
        data: {
          tfgs: tfgsFiltrados,
          estadisticas,
          fechaGeneracion: new Date().toISOString()
        }
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al generar reporte de TFGs'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Generar reporte de usuarios y actividad
  const generarReporteUsuarios = async (filtros = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Datos simulados de usuarios con actividad
      const usuariosCompletos = [
        {
          id: 1,
          nombre: "Dr. María García",
          email: "maria.garcia@uni.edu",
          rol: "profesor",
          departamento: "Ingeniería de Software",
          estado: "activo",
          fechaRegistro: "2024-01-15T10:00:00Z",
          ultimoAcceso: "2025-02-04T14:30:00Z",
          sesionesUltimoMes: 28,
          tfgsSupervisionados: 12,
          tribunalesParticipados: 8,
          horasActividad: 145.5
        },
        {
          id: 2,
          nombre: "Carlos López Estudiante",
          email: "carlos.lopez@estudiante.edu",
          rol: "estudiante",
          curso: "4º Ingeniería Informática",
          estado: "activo",
          fechaRegistro: "2024-09-01T08:00:00Z",
          ultimoAcceso: "2025-02-04T16:45:00Z",
          sesionesUltimoMes: 45,
          tfgAsignado: "Sistema de Gestión de TFGs",
          progresoTFG: 85,
          horasActividad: 89.2
        },
        {
          id: 3,
          nombre: "Admin Sistema",
          email: "admin@uni.edu",
          rol: "admin",
          departamento: "Administración de Sistemas",
          estado: "activo",
          fechaRegistro: "2023-01-01T00:00:00Z",
          ultimoAcceso: "2025-02-04T18:00:00Z",
          sesionesUltimoMes: 62,
          operacionesRealizadas: 234,
          usuariosGestionados: 45,
          horasActividad: 178.7
        }
      ]

      // Aplicar filtros
      let usuariosFiltrados = usuariosCompletos

      if (filtros.rol && filtros.rol !== 'todos') {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.rol === filtros.rol)
      }

      if (filtros.estado && filtros.estado !== 'todos') {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.estado === filtros.estado)
      }

      if (filtros.departamento && filtros.departamento !== 'todos') {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.departamento === filtros.departamento)
      }

      // Generar estadísticas de actividad
      const estadisticas = {
        totalUsuarios: usuariosFiltrados.length,
        usuariosActivos: usuariosFiltrados.filter(u => u.estado === 'activo').length,
        promedioSesiones: (usuariosFiltrados.reduce((acc, u) => acc + u.sesionesUltimoMes, 0) / usuariosFiltrados.length).toFixed(1),
        promedioHorasActividad: (usuariosFiltrados.reduce((acc, u) => acc + u.horasActividad, 0) / usuariosFiltrados.length).toFixed(1),
        porRol: usuariosFiltrados.reduce((acc, u) => {
          acc[u.rol] = (acc[u.rol] || 0) + 1
          return acc
        }, {}),
        actividadPorDepartamento: usuariosFiltrados.reduce((acc, u) => {
          if (u.departamento) {
            acc[u.departamento] = (acc[u.departamento] || 0) + u.horasActividad
          }
          return acc
        }, {}),
        usuariosMasActivos: usuariosFiltrados
          .sort((a, b) => b.horasActividad - a.horasActividad)
          .slice(0, 5)
          .map(u => ({ nombre: u.nombre, horas: u.horasActividad, rol: u.rol }))
      }

      return { 
        success: true, 
        data: {
          usuarios: usuariosFiltrados,
          estadisticas,
          fechaGeneracion: new Date().toISOString()
        }
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al generar reporte de usuarios'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Generar reporte de tribunales y defensas
  const generarReporteTribunales = async (filtros = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 900))
      
      // Datos simulados de tribunales
      const tribunalesCompletos = [
        {
          id: 1,
          nombre: "Tribunal A - Desarrollo Web",
          presidente: "Dr. María García",
          vocales: ["Dr. Carlos López", "Dra. Ana Martín"],
          fechaCreacion: "2024-12-01T00:00:00Z",
          estado: "Activo",
          defensasRealizadas: 5,
          defensasPendientes: 2,
          promedioCalificaciones: 8.2,
          duracionPromedioDefensas: 47,
          departamento: "Ingeniería de Software"
        },
        {
          id: 2,
          nombre: "Tribunal B - Desarrollo Móvil",
          presidente: "Dr. Pedro Ruiz",
          vocales: ["Dra. Isabel Moreno", "Dr. Luis Fernández"],
          fechaCreacion: "2024-11-15T00:00:00Z",
          estado: "Activo",
          defensasRealizadas: 3,
          defensasPendientes: 1,
          promedioCalificaciones: 7.8,
          duracionPromedioDefensas: 52,
          departamento: "Desarrollo Móvil"
        },
        {
          id: 3,
          nombre: "Tribunal C - Inteligencia Artificial",
          presidente: "Dra. Isabel Moreno",
          vocales: ["Dr. María García", "Dr. Pedro Ruiz"],
          fechaCreacion: "2024-10-20T00:00:00Z",
          estado: "Completado",
          defensasRealizadas: 4,
          defensasPendientes: 0,
          promedioCalificaciones: 8.7,
          duracionPromedioDefensas: 55,
          departamento: "Análisis de Datos"
        }
      ]

      // Aplicar filtros
      let tribunalesFiltrados = tribunalesCompletos

      if (filtros.estado && filtros.estado !== 'todos') {
        tribunalesFiltrados = tribunalesFiltrados.filter(t => t.estado.toLowerCase() === filtros.estado.toLowerCase())
      }

      if (filtros.presidente && filtros.presidente !== 'todos') {
        tribunalesFiltrados = tribunalesFiltrados.filter(t => t.presidente.includes(filtros.presidente))
      }

      if (filtros.departamento && filtros.departamento !== 'todos') {
        tribunalesFiltrados = tribunalesFiltrados.filter(t => t.departamento === filtros.departamento)
      }

      // Generar estadísticas
      const estadisticas = {
        totalTribunales: tribunalesFiltrados.length,
        tribunalesActivos: tribunalesFiltrados.filter(t => t.estado === 'Activo').length,
        totalDefensasRealizadas: tribunalesFiltrados.reduce((acc, t) => acc + t.defensasRealizadas, 0),
        totalDefensasPendientes: tribunalesFiltrados.reduce((acc, t) => acc + t.defensasPendientes, 0),
        promedioGeneralCalificaciones: (tribunalesFiltrados.reduce((acc, t) => acc + t.promedioCalificaciones, 0) / tribunalesFiltrados.length).toFixed(2),
        duracionPromedioGeneral: (tribunalesFiltrados.reduce((acc, t) => acc + t.duracionPromedioDefensas, 0) / tribunalesFiltrados.length).toFixed(0),
        porDepartamento: tribunalesFiltrados.reduce((acc, t) => {
          acc[t.departamento] = (acc[t.departamento] || 0) + 1
          return acc
        }, {}),
        presidentesMasActivos: tribunalesFiltrados
          .reduce((acc, t) => {
            acc[t.presidente] = (acc[t.presidente] || 0) + t.defensasRealizadas
            return acc
          }, {}),
        rendimientoPorTribunal: tribunalesFiltrados.map(t => ({
          nombre: t.nombre,
          defensas: t.defensasRealizadas,
          promedio: t.promedioCalificaciones,
          eficiencia: ((t.defensasRealizadas / (t.defensasRealizadas + t.defensasPendientes)) * 100).toFixed(1)
        }))
      }

      return { 
        success: true, 
        data: {
          tribunales: tribunalesFiltrados,
          estadisticas,
          fechaGeneracion: new Date().toISOString()
        }
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al generar reporte de tribunales'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Exportar reporte a PDF (simulado)
  const exportarAPDF = async (tipoReporte, datos, configuracion = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simular generación de PDF
      const nombreArchivo = `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.pdf`
      const urlDescarga = `/reportes/${nombreArchivo}`
      
      // En un caso real, aquí se generaría el PDF con una librería como jsPDF
      
      return { 
        success: true, 
        data: {
          archivo: nombreArchivo,
          url: urlDescarga,
          tamaño: '2.4 MB',
          paginas: Math.ceil(datos.length / 20)
        },
        message: 'PDF generado correctamente' 
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al exportar PDF'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Exportar reporte a Excel (simulado)
  const exportarAExcel = async (tipoReporte, datos, configuracion = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simular generación de Excel
      const nombreArchivo = `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.xlsx`
      const urlDescarga = `/reportes/${nombreArchivo}`
      
      // En un caso real, aquí se usaría una librería como xlsx o exceljs
      
      return { 
        success: true, 
        data: {
          archivo: nombreArchivo,
          url: urlDescarga,
          tamaño: '1.8 MB',
          hojas: configuracion.incluirEstadisticas ? 2 : 1
        },
        message: 'Excel generado correctamente' 
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al exportar Excel'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Generar reporte personalizado
  const generarReportePersonalizado = async (configuracion) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1800))
      
      // Validar configuración
      if (!configuracion.tiposReporte || configuracion.tiposReporte.length === 0) {
        throw new Error('Debe seleccionar al menos un tipo de reporte')
      }

      const reportesGenerados = []
      
      // Generar cada tipo de reporte solicitado
      for (const tipo of configuracion.tiposReporte) {
        let resultado
        switch (tipo) {
          case 'tfgs':
            resultado = await generarReporteTFGs(configuracion.filtros?.tfgs || {})
            break
          case 'usuarios':
            resultado = await generarReporteUsuarios(configuracion.filtros?.usuarios || {})
            break
          case 'tribunales':
            resultado = await generarReporteTribunales(configuracion.filtros?.tribunales || {})
            break
          default:
            continue
        }
        
        if (resultado.success) {
          reportesGenerados.push({
            tipo,
            datos: resultado.data,
            generadoEn: new Date().toISOString()
          })
        }
      }

      return { 
        success: true, 
        data: {
          reportes: reportesGenerados,
          configuracion,
          fechaGeneracion: new Date().toISOString()
        },
        message: `${reportesGenerados.length} reporte(s) generado(s) correctamente`
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Error al generar reporte personalizado'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    // Reportes específicos
    generarReporteTFGs,
    generarReporteUsuarios,
    generarReporteTribunales,
    // Exportación
    exportarAPDF,
    exportarAExcel,
    // Reportes personalizados
    generarReportePersonalizado,
    // Utilidades
    clearError: () => setError(null)
  }
}