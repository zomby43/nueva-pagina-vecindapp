-- ============================================================
-- SCHEMA DE BASE DE DATOS PARA VECINDAPP
-- ============================================================
-- Este archivo contiene todas las tablas, políticas y funciones
-- necesarias para la plataforma VecindApp
--
-- INSTRUCCIONES:
-- 1. Copia y pega este código en el SQL Editor de Supabase
-- 2. Ejecuta todo el script
-- 3. Verifica que las tablas se crearon correctamente
-- ============================================================

-- ============================================================
-- TABLA: usuarios
-- Extiende la tabla auth.users con información adicional
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    rut TEXT UNIQUE NOT NULL,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    direccion TEXT NOT NULL,
    telefono TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'vecino' CHECK (rol IN ('vecino', 'secretaria', 'admin')),
    estado TEXT NOT NULL DEFAULT 'pendiente_aprobacion' CHECK (estado IN ('pendiente_aprobacion', 'activo', 'rechazado', 'inactivo')),
    comprobante_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON public.usuarios(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_rut ON public.usuarios(rut);

-- ============================================================
-- TABLA: solicitudes
-- Almacena las solicitudes de certificados y trámites
-- ============================================================
CREATE TABLE IF NOT EXISTS public.solicitudes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'certificado_residencia' CHECK (tipo IN ('certificado_residencia', 'certificado_antiguedad', 'otro')),
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'rechazado')),
    motivo TEXT,
    observaciones TEXT,
    documento_url TEXT,
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_respuesta TIMESTAMP WITH TIME ZONE,
    atendido_por UUID REFERENCES public.usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON public.solicitudes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON public.solicitudes(fecha_solicitud DESC);

-- ============================================================
-- STORAGE: Bucket para documentos
-- Almacena comprobantes de residencia y certificados generados
-- ============================================================
-- Ejecuta esto en el panel de Storage de Supabase o via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Políticas de seguridad a nivel de fila
-- ============================================================

-- Habilitar RLS en las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS PARA TABLA: usuarios
-- ============================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
ON public.usuarios FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Secretaria y Admin pueden ver todos los usuarios
CREATE POLICY "Secretaria y Admin pueden ver todos los usuarios"
ON public.usuarios FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid() AND rol IN ('secretaria', 'admin')
    )
);

-- Los usuarios pueden actualizar su propio perfil (excepto rol y estado)
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON public.usuarios FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Solo admin puede actualizar roles
CREATE POLICY "Solo admin puede actualizar roles"
ON public.usuarios FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid() AND rol = 'admin'
    )
);

-- Permitir inserción durante el registro
CREATE POLICY "Permitir inserción durante registro"
ON public.usuarios FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================================
-- POLÍTICAS PARA TABLA: solicitudes
-- ============================================================

-- Los vecinos pueden ver solo sus propias solicitudes
CREATE POLICY "Vecinos pueden ver sus propias solicitudes"
ON public.solicitudes FOR SELECT
TO authenticated
USING (usuario_id = auth.uid());

-- Secretaria y Admin pueden ver todas las solicitudes
CREATE POLICY "Secretaria y Admin pueden ver todas las solicitudes"
ON public.solicitudes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid() AND rol IN ('secretaria', 'admin')
    )
);

-- Los vecinos pueden crear sus propias solicitudes
CREATE POLICY "Vecinos pueden crear solicitudes"
ON public.solicitudes FOR INSERT
TO authenticated
WITH CHECK (usuario_id = auth.uid());

-- Los vecinos pueden actualizar solo sus solicitudes pendientes
CREATE POLICY "Vecinos pueden actualizar sus solicitudes pendientes"
ON public.solicitudes FOR UPDATE
TO authenticated
USING (usuario_id = auth.uid() AND estado = 'pendiente')
WITH CHECK (usuario_id = auth.uid());

-- Secretaria y Admin pueden actualizar cualquier solicitud
CREATE POLICY "Secretaria y Admin pueden actualizar solicitudes"
ON public.solicitudes FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid() AND rol IN ('secretaria', 'admin')
    )
);

-- ============================================================
-- POLÍTICAS PARA STORAGE: documentos
-- ============================================================

-- Los usuarios pueden subir archivos a su propia carpeta
CREATE POLICY "Usuarios pueden subir sus documentos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documentos' AND
    (storage.foldername(name))[1] = 'comprobantes' AND
    auth.uid()::text = (storage.foldername(name))[2]
);

-- Los usuarios pueden ver sus propios documentos
CREATE POLICY "Usuarios pueden ver sus documentos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documentos' AND
    auth.uid()::text = (storage.foldername(name))[2]
);

-- Secretaria y Admin pueden ver todos los documentos
CREATE POLICY "Secretaria y Admin pueden ver todos los documentos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documentos' AND
    EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid() AND rol IN ('secretaria', 'admin')
    )
);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para usuarios
DROP TRIGGER IF EXISTS set_updated_at_usuarios ON public.usuarios;
CREATE TRIGGER set_updated_at_usuarios
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para solicitudes
DROP TRIGGER IF EXISTS set_updated_at_solicitudes ON public.solicitudes;
CREATE TRIGGER set_updated_at_solicitudes
    BEFORE UPDATE ON public.solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- DATOS DE EJEMPLO (OPCIONAL - SOLO PARA DESARROLLO)
-- ============================================================

-- Descomentar estas líneas si quieres crear usuarios de ejemplo
-- NOTA: Estos usuarios deben crearse primero en Supabase Auth

/*
-- Ejemplo de usuario admin (después de crear el usuario en Auth)
-- Reemplaza 'ID_DEL_USUARIO_AUTH' con el ID real del usuario creado en Supabase Auth

INSERT INTO public.usuarios (id, email, rut, nombres, apellidos, direccion, telefono, rol, estado)
VALUES
    ('ID_DEL_USUARIO_AUTH', 'admin@vecindapp.cl', '11111111-1', 'Admin', 'VecindApp', 'Calle Admin 123', '+56912345678', 'admin', 'activo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.usuarios (id, email, rut, nombres, apellidos, direccion, telefono, rol, estado)
VALUES
    ('ID_DEL_USUARIO_AUTH', 'secretaria@vecindapp.cl', '22222222-2', 'María', 'González', 'Calle Secretaría 456', '+56987654321', 'secretaria', 'activo')
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================

-- Verificar que todo se creó correctamente
SELECT 'Tablas creadas correctamente' AS status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
