# Guía de Configuración - VecindApp

Esta guía te ayudará a configurar el sistema de autenticación con Supabase y los roles de usuario (vecino, secretaria, admin).

## 📋 Requisitos Previos

- Cuenta en [Supabase](https://supabase.com)
- Node.js instalado
- Git instalado

## 🚀 Pasos de Configuración

### 1️⃣ Crear Proyecto en Supabase

1. Ve a https://supabase.com/dashboard
2. Haz clic en "New Project"
3. Completa los datos:
   - **Name**: VecindApp (o el nombre que prefieras)
   - **Database Password**: Elige una contraseña segura (guárdala!)
   - **Region**: Selecciona la más cercana (South America - São Paulo)
4. Haz clic en "Create new project"
5. Espera a que el proyecto se inicialice (puede tomar 1-2 minutos)

### 2️⃣ Ejecutar el Schema de Base de Datos

1. En el dashboard de Supabase, ve a **SQL Editor** (icono de rayos ⚡ en la barra lateral)
2. Haz clic en "New query"
3. Abre el archivo `supabase-schema.sql` de este proyecto
4. **Copia TODO el contenido** del archivo
5. **Pega** el contenido en el editor SQL de Supabase
6. Haz clic en **"Run"** (o presiona Ctrl+Enter)
7. Deberías ver un mensaje de éxito: "Success. No rows returned"

### 3️⃣ Verificar que las Tablas se Crearon

1. Ve a **Table Editor** en Supabase
2. Deberías ver dos tablas:
   - ✅ `usuarios`
   - ✅ `solicitudes`
3. Ve a **Storage** en Supabase
4. Deberías ver un bucket:
   - ✅ `documentos`

### 4️⃣ Configurar Variables de Entorno

1. En el dashboard de Supabase, ve a **Settings** > **API**
2. Copia los siguientes valores:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public** key (en la sección "Project API keys")

3. En tu proyecto local, abre el archivo `.env.local`

4. Reemplaza los valores con tus credenciales reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU-ANON-KEY-AQUI
```

5. **Guarda el archivo**

### 5️⃣ Reiniciar el Servidor de Desarrollo

Si el servidor ya está corriendo, detenlo (Ctrl+C) y vuélvelo a iniciar:

```bash
npm run dev
```

## 🧪 Probar la Configuración

### Crear Usuario de Prueba

1. Ve a http://localhost:3000/register
2. Completa el formulario de registro
3. Sube un archivo como comprobante de residencia
4. Haz clic en "Crear Cuenta"
5. Si todo está bien, verás un mensaje de éxito

### Verificar Usuario en Supabase

1. Ve a **Authentication** > **Users** en Supabase
2. Deberías ver el usuario que acabas de crear
3. Ve a **Table Editor** > **usuarios**
4. Deberías ver el perfil del usuario con:
   - `rol: vecino`
   - `estado: pendiente_aprobacion`

### Aprobar Usuario Manualmente (Para Testing)

Para probar el login, necesitas aprobar el usuario:

1. Ve a **Table Editor** > **usuarios** en Supabase
2. Encuentra tu usuario
3. Haz clic en el registro para editarlo
4. Cambia `estado` de `pendiente_aprobacion` a `activo`
5. Guarda los cambios

### Probar Login

1. Ve a http://localhost:3000/login
2. Ingresa el email y contraseña que usaste al registrarte
3. Si todo está bien, serás redirigido al dashboard de vecino

## 👤 Crear Usuarios con Diferentes Roles

### Opción 1: Desde la UI (Recomendado)

1. Crea un usuario desde `/register`
2. En Supabase, edita la tabla `usuarios`
3. Cambia el `rol` y `estado`:
   - Para **Secretaria**: `rol: secretaria`, `estado: activo`
   - Para **Admin**: `rol: admin`, `estado: activo`

### Opción 2: Desde SQL

```sql
-- Primero crea el usuario en Authentication (desde la UI de Supabase Auth)
-- Luego actualiza su rol en la tabla usuarios

-- Hacer a un usuario Secretaria
UPDATE usuarios
SET rol = 'secretaria', estado = 'activo'
WHERE email = 'secretaria@ejemplo.cl';

-- Hacer a un usuario Admin
UPDATE usuarios
SET rol = 'admin', estado = 'activo'
WHERE email = 'admin@ejemplo.cl';
```

## 📁 Estructura de Archivos Creados

```
nueva-pagina-vecindapp/
├── .env.local                    ← Tus credenciales de Supabase
├── .env.example                  ← Template de variables de entorno
├── supabase-schema.sql           ← Schema de base de datos
├── middleware.js                 ← Protección de rutas
├── contexts/
│   └── AuthContext.jsx           ← Estado global de autenticación
├── hooks/
│   └── useAuth.js                ← Hook personalizado de auth
├── lib/supabase/
│   ├── client.js                 ← Cliente Supabase (navegador)
│   ├── server.js                 ← Cliente Supabase (servidor)
│   └── middleware.js             ← Cliente Supabase (middleware)
├── app/
│   ├── (auth)/
│   │   ├── login/page.js         ← Login actualizado
│   │   └── register/page.js      ← Registro actualizado
│   ├── (vecino)/                 ← Rutas de vecinos
│   │   ├── dashboard/
│   │   ├── solicitudes/
│   │   ├── perfil/
│   │   └── mapa/
│   ├── (secretaria)/             ← Rutas de secretaría (nuevo)
│   │   └── layout.js
│   ├── admin/                    ← Rutas de admin
│   └── pendiente-aprobacion/     ← Página de espera
└── components/layout/
    ├── Header.jsx                ← Header con info de usuario
    ├── Sidebar.jsx               ← Sidebar de vecinos
    ├── SecretariaSidebar.jsx     ← Sidebar de secretaría (nuevo)
    └── AdminSidebar.jsx          ← Sidebar de admin
```

## 🔐 Sistema de Roles

| Rol | Acceso | Estado Requerido |
|-----|--------|------------------|
| **Vecino** | `/dashboard`, `/solicitudes`, `/perfil`, `/mapa` | `activo` |
| **Secretaria** | Todo lo de vecino + `/secretaria/*` | `activo` |
| **Admin** | Acceso total a todo el sistema | `activo` |

## ❓ Problemas Comunes

### Error: "Invalid API key"
**Solución:** Verifica que `.env.local` tenga las credenciales correctas de Supabase

### Error: "Failed to upload comprobante"
**Solución:**
1. Verifica que el bucket 'documentos' exista en Storage
2. Verifica que las políticas RLS estén configuradas (deberían estar si ejecutaste el schema)

### Usuario queda en "Pendiente de Aprobación"
**Solución:** Cambia manualmente el `estado` a `activo` en la tabla `usuarios`

### El login no funciona
**Solución:**
1. Verifica que el usuario exista en Authentication > Users
2. Verifica que el perfil exista en la tabla `usuarios`
3. Verifica que el `estado` sea `activo`

### Middleware redirige en loop
**Solución:** Asegúrate de que después del registro se creó el perfil en la tabla `usuarios`

## 📞 Próximos Pasos

Ahora que tienes el sistema de autenticación funcionando, puedes:

1. ✅ Crear las páginas de Secretaría (`/secretaria/*`)
2. ✅ Implementar la funcionalidad de aprobar usuarios
3. ✅ Crear formularios para gestionar solicitudes
4. ✅ Implementar generación de certificados
5. ✅ Agregar notificaciones por email

Todo listo!
