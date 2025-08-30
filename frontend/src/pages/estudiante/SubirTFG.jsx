import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTFGs } from '../../hooks/useTFGs'

function SubirTFG() {
  const navigate = useNavigate()
  const { subirTFG, loading: tfgLoading, error: tfgError } = useTFGs()
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    resumen: '',
    palabrasClave: '',
    area: '',
    tipoTFG: '',
    idioma: 'español',
    archivo: null
  })
  
  // Estado de la UI
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState({})
  const [dragActive, setDragActive] = useState(false)

  // Opciones para los selects
  const areas = [
    'Desarrollo Web',
    'Inteligencia Artificial',
    'Seguridad Informática',
    'Bases de Datos',
    'Sistemas Distribuidos',
    'Desarrollo Móvil',
    'Redes de Computadores',
    'Ingeniería de Software'
  ]

  const tiposTFG = [
    'Desarrollo de Software',
    'Investigación',
    'Análisis y Diseño',
    'Implementación de Sistema',
    'Estudio Comparativo',
    'Propuesta de Mejora'
  ]

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validar archivo PDF
  const validateFile = (file) => {
    if (!file) return 'Debe seleccionar un archivo PDF'
    if (file.type !== 'application/pdf') return 'El archivo debe ser un PDF'
    if (file.size > 50 * 1024 * 1024) return 'El archivo no puede superar los 50MB'
    return null
  }

  // Manejar subida de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  // Manejar drag and drop
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFile(file)
    }
  }

  const handleFile = (file) => {
    const fileError = validateFile(file)
    if (fileError) {
      setErrors(prev => ({ ...prev, archivo: fileError }))
      return
    }

    setFormData(prev => ({ ...prev, archivo: file }))
    setErrors(prev => ({ ...prev, archivo: '' }))
  }

  // Validar formulario completo
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.titulo.trim()) newErrors.titulo = 'El título es obligatorio'
    if (!formData.resumen.trim()) newErrors.resumen = 'El resumen es obligatorio'
    if (formData.resumen.length < 100) newErrors.resumen = 'El resumen debe tener al menos 100 caracteres'
    if (!formData.palabrasClave.trim()) newErrors.palabrasClave = 'Las palabras clave son obligatorias'
    if (!formData.area) newErrors.area = 'Debe seleccionar un área'
    if (!formData.tipoTFG) newErrors.tipoTFG = 'Debe seleccionar el tipo de TFG'
    if (!formData.archivo) newErrors.archivo = 'Debe subir el archivo PDF'
    
    return newErrors
  }

  // Función para manejar el progress de subida
  const handleUploadProgress = (progressEvent) => {
    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
    setUploadProgress(progress)
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setUploadProgress(0)
    setErrors({})

    try {
      // Preparar datos para envío (convertir palabras clave a array)
      const datosEnvio = {
        ...formData,
        palabrasClave: formData.palabrasClave.split(',').map(p => p.trim()),
        // Campos adicionales que podría necesitar el backend
        tutorId: 1, // TODO: obtener del contexto de usuario
        cotutorId: null
      }

      // Usar hook real para subir TFG con progress tracking
      const resultado = await subirTFG(datosEnvio, handleUploadProgress)
      
      if (resultado.success) {
        // Redirigir a mis TFGs con mensaje de éxito
        navigate('/estudiante/mis-tfgs', { 
          state: { message: resultado.message || 'TFG subido correctamente' }
        })
      } else {
        setErrors({ general: resultado.error || 'Error al subir el TFG' })
      }
      
    } catch (err) {
      console.error('Error al subir TFG:', err)
      setErrors({ general: 'Error inesperado al subir el TFG. Inténtalo de nuevo.' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subir Trabajo de Fin de Grado</h1>
        <p className="text-gray-600 mt-2">
          Completa todos los campos y sube tu TFG en formato PDF
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error general */}
        {(errors.general || tfgError) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{errors.general || tfgError}</p>
          </div>
        )}

        {/* Información básica */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Información Básica</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del TFG *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.titulo ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Sistema de Gestión de TFGs con React y Symfony"
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
              )}
            </div>

            {/* Área y Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área de Conocimiento *
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.area ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona un área</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                {errors.area && (
                  <p className="mt-1 text-sm text-red-600">{errors.area}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de TFG *
                </label>
                <select
                  name="tipoTFG"
                  value={formData.tipoTFG}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tipoTFG ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona el tipo</option>
                  {tiposTFG.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
                {errors.tipoTFG && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipoTFG}</p>
                )}
              </div>
            </div>

            {/* Resumen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resumen *
              </label>
              <textarea
                name="resumen"
                value={formData.resumen}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.resumen ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe tu TFG de forma clara y concisa (mínimo 100 caracteres)"
              />
              <div className="flex justify-between mt-1">
                {errors.resumen ? (
                  <p className="text-sm text-red-600">{errors.resumen}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Mínimo 100 caracteres
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  {formData.resumen.length}/1000
                </p>
              </div>
            </div>

            {/* Palabras clave */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palabras Clave *
              </label>
              <input
                type="text"
                name="palabrasClave"
                value={formData.palabrasClave}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.palabrasClave ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="React, Symfony, TFG, Sistema de gestión (separadas por comas)"
              />
              {errors.palabrasClave && (
                <p className="mt-1 text-sm text-red-600">{errors.palabrasClave}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Separa las palabras clave con comas
              </p>
            </div>

            {/* Idioma */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma del TFG
              </label>
              <select
                name="idioma"
                value={formData.idioma}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="español">Español</option>
                <option value="inglés">Inglés</option>
                <option value="catalán">Catalán</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subida de archivo */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Documento TFG</h2>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : errors.archivo 
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {formData.archivo ? (
              <div className="space-y-4">
                <div className="text-green-600 text-4xl">📄</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.archivo.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, archivo: null }))
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Eliminar archivo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-gray-400 text-4xl">📎</div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Arrastra tu archivo PDF aquí
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    o haz clic para seleccionar
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Seleccionar archivo
                </label>
              </div>
            )}
          </div>
          
          {errors.archivo && (
            <p className="mt-2 text-sm text-red-600">{errors.archivo}</p>
          )}
          
          <p className="mt-2 text-sm text-gray-500">
            Formatos aceptados: PDF. Tamaño máximo: 50MB
          </p>

          {/* Progress bar */}
          {tfgLoading && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Subiendo archivo...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/estudiante/mis-tfgs')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          
          <div className="space-x-3">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Guardar Borrador
            </button>
            <button
              type="submit"
              disabled={tfgLoading}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                tfgLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {tfgLoading ? 'Subiendo...' : 'Subir TFG'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SubirTFG