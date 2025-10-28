'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
    setError('');
  };

  const handleFileUpload = (file) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo se aceptan: PNG, JPEG, JPG o PDF');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande. Tamaño máximo: 5MB');
      return;
    }

    setFormData(prev => ({ ...prev, archivo: file }));
    setError('');
  };

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
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombres: formData.nombres,
            apellidos: formData.apellidos,
          }
        }
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // 2. Subir comprobante
      const fileExt = formData.archivo.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `comprobantes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, formData.archivo);

      if (uploadError) throw uploadError;

      // 3. Crear perfil en tabla usuarios
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert({
          id: userId,
          email: formData.email,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          rut: formData.rut,
          direccion: formData.direccion,
          telefono: formData.telefono || '',
          comprobante_url: filePath,
          rol: 'vecino',
          estado: 'pendiente_aprobacion',
        });

      if (profileError) throw profileError;

      // 4. Mostrar éxito
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      console.error('Error en registro:', err);
      setError(err.message || 'Error al crear la cuenta. Por favor intenta nuevamente.');
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="col-md-6">
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
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-3 mt-3">
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
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="telefono" className="form-label">Teléfono</label>
            <input
              type="tel"
              className="form-control"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+56 9 1234 5678"
              disabled={loading}
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
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
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
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-3 mt-3">
            <label className="form-label">Comprobante de Domicilio *</label>
            <div
              className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="archivo"
                name="archivo"
                onChange={handleFileInputChange}
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                style={{ display: 'none' }}
                disabled={loading}
              />
              <label htmlFor="archivo" style={{ cursor: 'pointer', margin: 0 }}>
                <div className="upload-icon">📄</div>
                {formData.archivo ? (
                  <>
                    <p className="upload-text">Archivo seleccionado:</p>
                    <p className="file-name">{formData.archivo.name}</p>
                  </>
                ) : (
                  <>
                    <p className="upload-text">Arrastra tu comprobante aquí o haz click para seleccionar</p>
                    <p className="upload-hint">PNG, JPG o PDF - Máximo 5MB</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        )}

        <div className="auth-divider">
          <span>o</span>
        </div>

        <div className="auth-redirect">
          <p>¿Ya tienes cuenta? <Link href="/login" className="text-decoration-none">Inicia sesión aquí</Link></p>
        </div>

        <div className="auth-back">
          <Link href="/" className="text-decoration-none">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
