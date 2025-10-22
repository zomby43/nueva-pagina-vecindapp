'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    email: '',
    direccion: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    archivo: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const router = useRouter();
  const { signUp, uploadComprobante } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
    setError(''); // Limpiar error al escribir
  };

  // Función para manejar la subida de archivos
  const handleFileUpload = (file) => {
    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo se aceptan: PNG, JPEG, JPG o PDF');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande. Tamaño máximo: 5MB');
      return;
    }

    setFormData(prev => ({ ...prev, archivo: file }));
    setError('');
  };

  // Función para manejar el drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (!formData.archivo) {
      setError('Debes subir un comprobante de residencia');
      setLoading(false);
      return;
    }

    try {
      // 1. Crear usuario en Supabase
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        rut: formData.rut,
        direccion: formData.direccion,
        telefono: formData.telefono,
      });

      if (!result.success) {
        setError(result.error || 'Error al crear la cuenta');
        setLoading(false);
        return;
      }

      // 2. Subir comprobante de residencia
      if (formData.archivo && result.data?.user?.id) {
        const uploadResult = await uploadComprobante(result.data.user.id, formData.archivo);
        if (!uploadResult.success) {
          console.error('Error subiendo comprobante:', uploadResult.error);
          // No bloqueamos el registro por esto, pero lo registramos
        }
      }

      // 3. Mostrar mensaje de éxito
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      setError('Error inesperado. Por favor intenta nuevamente.');
      console.error('Error en registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2 className="auth-title">Crear Cuenta</h2>
        <p className="auth-subtitle">Regístrate en VecindApp</p>

        {success ? (
          <div className="alert alert-success" role="alert">
            <h4 className="alert-heading">¡Registro exitoso!</h4>
            <p>Tu cuenta ha sido creada correctamente.</p>
            <p className="mb-0">Tu registro está pendiente de aprobación por la Secretaría. Te notificaremos cuando sea aprobado.</p>
            <p className="mt-2"><small>Redirigiendo al login en 3 segundos...</small></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="nombres" className="form-label">Nombres *</label>
              <input
                type="text"
                className="form-control"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="apellidos" className="form-label">Apellidos *</label>
              <input
                type="text"
                className="form-control"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <label htmlFor="rut" className="form-label">RUT *</label>
              <input
                type="text"
                className="form-control"
                id="rut"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="12.345.678-9"
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="telefono" className="form-label">Teléfono *</label>
              <input
                type="tel"
                className="form-control"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                required
              />
            </div>
          </div>

          <div className="mb-3 mt-3">
            <label htmlFor="email" className="form-label">Email *</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="direccion" className="form-label">Dirección *</label>
            <input
              type="text"
              className="form-control"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Calle, número, departamento"
              required
            />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="password" className="form-label">Contraseña *</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="col-md-6">
              <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña *</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-control ${
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                      ? 'is-invalid'
                      : ''
                  }`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength="6"
                  placeholder="Repite tu contraseña"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {formData.confirmPassword &&
               formData.password !== formData.confirmPassword && (
                <div className="invalid-feedback d-block">
                  Las contraseñas no coinciden
                </div>
              )}
            </div>
          </div>

          <div className="mb-3 mt-3">
            <label className="form-label">
              Comprobante de Residencia *
            </label>
            <small className="d-block text-muted mb-3">
              Sube una cuenta de agua, luz, teléfono o documento que acredite tu domicilio
            </small>
            
            {/* Área de subida de archivos */}
            <div 
              className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${formData.archivo ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? '#439fa4' : formData.archivo ? '#34d399' : '#bfd3d9'}`,
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: dragActive ? '#f0f9ff' : formData.archivo ? '#f0fdf4' : '#f8f9fa',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('archivo').click()}
            >
              {formData.archivo ? (
                <div>
                  <div style={{ fontSize: '3rem', color: '#34d399', marginBottom: '0.5rem' }}>✓</div>
                  <h5 style={{ color: '#154765', marginBottom: '0.5rem' }}>Archivo seleccionado</h5>
                  <p style={{ color: '#439fa4', margin: '0' }}>
                    📄 {formData.archivo.name}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                    {(formData.archivo.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, archivo: null }));
                    }}
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', color: '#439fa4', marginBottom: '0.5rem' }}>📎</div>
                  <h5 style={{ color: '#154765', marginBottom: '0.5rem' }}>Subir archivo...</h5>
                  <p style={{ color: '#439fa4', margin: '0' }}>
                    Haz clic aquí o arrastra tu archivo
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary mt-3"
                    style={{ pointerEvents: 'none' }}
                  >
                    📁 Seleccionar archivo
                  </button>
                </div>
              )}
              
              {/* Input file oculto */}
              <input
                type="file"
                id="archivo"
                name="archivo"
                onChange={handleFileInputChange}
                accept=".pdf,.jpg,.jpeg,.png"
                required
                style={{ display: 'none' }}
              />
            </div>
            
            {/* Información de archivos permitidos */}
            <div className="mt-2" style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  📋 <strong>Formatos:</strong> PNG, JPEG, JPG, PDF
                </span>
                <span>
                  📏 <strong>Tamaño máximo:</strong> 5MB
                </span>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        )}

        {!success && (
          <>
            <div className="auth-divider">
              <span>o</span>
            </div>

            <div className="auth-redirect">
              <p>¿Ya tienes cuenta? <Link href="/login" className="text-decoration-none">Inicia sesión aquí</Link></p>
            </div>

            <div className="auth-back">
              <Link href="/" className="text-decoration-none">← Volver al inicio</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
