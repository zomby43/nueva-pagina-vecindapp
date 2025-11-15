# VecindApp - Plataforma de Gestión Vecinal

<div align="center">

**Sistema completo de gestión comunitaria para juntas de vecinos**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=flat&logo=supabase)](https://supabase.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=flat&logo=bootstrap)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-Academic-blue.svg)](LICENSE)

</div>

---

## Descripción

VecindApp es una plataforma web integral diseñada para modernizar la gestión de juntas de vecinos. Facilita la comunicación entre vecinos y la administración, permitiendo solicitar certificados, participar en actividades, reservar espacios comunitarios, y mucho más.

### Características Principales

- **Autenticación segura** con roles diferenciados (Vecino, Secretaria, Admin)
- **Gestión de certificados** de residencia y antigüedad con generación automática de PDFs
- **Sistema de noticias** con reacciones e interacción social
- **Actividades comunitarias** con sistema de inscripciones
- **Proyectos vecinales** con postulaciones y seguimiento
- **Reservas de espacios** comunes (quincho, salón de eventos, etc.)
- **Mapa interactivo** de la comunidad
- **Notificaciones por email** automatizadas
- **Panel administrativo** completo con logs y reportes
- **Diseño responsive** adaptado a todos los dispositivos

---

## Tecnologías

| Categoría | Tecnología | Versión | Uso |
|-----------|-----------|---------|-----|
| **Framework** | Next.js | 14.2.3 | App Router + Server Components |
| **Lenguaje** | JavaScript | ES6+ | Client & Server |
| **Base de Datos** | Supabase (PostgreSQL) | - | Auth + Storage + Database |
| **Autenticación** | Supabase Auth | 2.75+ | Sistema de roles y permisos |
| **Estilos** | Bootstrap | 5.3.8 | UI Framework responsive |
| **Mapas** | Leaflet | 1.9.4 | Mapas interactivos |
| **PDF** | jsPDF + AutoTable | 3.0+ | Generación de certificados |
| **Emails** | SendGrid | 8.1+ | Notificaciones automatizadas |
| **Seguridad** | Cloudflare Turnstile | - | Protección anti-bots |
| **Imágenes** | browser-image-compression | 2.0+ | Optimización de imágenes |

---

## Estructura del Proyecto

```
nueva-pagina-vecindapp/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (auth)/                   # Rutas de autenticación
│   │   ├── login/                   # Inicio de sesión
│   │   └── register/                # Registro de usuarios
│   ├── 📁 (vecino)/                 # Rutas protegidas para vecinos
│   │   ├── dashboard/               # Panel principal del vecino
│   │   ├── solicitudes/             # Solicitar certificados
│   │   ├── perfil/                  # Gestionar perfil
│   │   ├── mapa/                    # Mapa de la comunidad
│   │   ├── noticias/                # Ver noticias
│   │   ├── actividades/             # Actividades comunitarias
│   │   ├── proyectos/               # Proyectos vecinales
│   │   ├── reservas/                # Reservar espacios
│   │   └── avisos/                  # Tablón de avisos
│   ├── 📁 secretaria/               # Panel de secretaría
│   │   ├── dashboard/               # Estadísticas y resumen
│   │   ├── vecinos/                 # Gestionar vecinos
│   │   │   └── aprobaciones/        # Aprobar registros
│   │   ├── solicitudes/             # Gestionar solicitudes
│   │   ├── certificados/            # Emitir certificados
│   │   ├── noticias/                # Publicar noticias
│   │   ├── actividades/             # Crear actividades
│   │   ├── proyectos/               # Gestionar proyectos
│   │   ├── reservas/                # Administrar reservas
│   │   ├── avisos/                  # Publicar avisos
│   │   ├── directiva/               # Gestionar directiva
│   │   ├── espacios/                # Gestionar espacios comunitarios
│   │   └── configuracion/           # Configuración de secretaría
│   ├── 📁 admin/                    # Panel de administración
│   │   ├── dashboard/               # Dashboard con métricas
│   │   ├── usuarios/                # Gestión de usuarios
│   │   ├── solicitudes/             # Todas las solicitudes
│   │   ├── roles/                   # Gestión de roles
│   │   ├── logs/                    # Logs del sistema
│   │   ├── reportes/                # Generación de reportes
│   │   └── configuracion/           # Configuración global
│   ├── 📁 api/                      # API Routes
│   │   ├── auth/                    # Endpoints de autenticación
│   │   ├── certificados/            # Generación de certificados
│   │   ├── emails/                  # Envío de correos
│   │   └── verify-turnstile/        # Validación CAPTCHA
│   ├── pendiente-aprobacion/        # Página de espera post-registro
│   ├── layout.js                    # Layout principal
│   ├── page.js                      # Landing page pública
│   └── globals.css                  # Estilos globales
├── 📁 components/                   # Componentes reutilizables
│   ├── layout/                      # Headers, Sidebars, Footers
│   ├── common/                      # Componentes comunes
│   ├── maps/                        # Componentes de mapas
│   ├── noticias/                    # Componentes de noticias
│   ├── proyectos/                   # Componentes de proyectos
│   └── ui/                          # Componentes de UI
├── 📁 contexts/                     # Context API de React
│   └── AuthContext.jsx              # Estado global de autenticación
├── 📁 hooks/                        # Custom Hooks
│   └── useAuth.js                   # Hook de autenticación
├── 📁 lib/                          # Utilidades y helpers
│   ├── supabase/                    # Clientes de Supabase
│   │   ├── client.js                # Cliente browser
│   │   ├── server.js                # Cliente server
│   │   ├── middleware.js            # Cliente middleware
│   │   └── admin.js                 # Cliente admin
│   ├── emails/                      # Sistema de correos
│   │   ├── sendEmail.js             # Funciones de envío
│   │   └── templates.js             # Plantillas HTML
│   ├── pdf/                         # Generación de PDFs
│   │   └── generarCertificado.js    # Certificados
│   ├── storage/                     # Gestión de archivos
│   ├── logs/                        # Sistema de logs
│   └── geocoding/                   # Geocodificación
├── 📁 public/                       # Archivos estáticos
│   └── vencinapp.svg                # Logo de la aplicación
├── 📄 middleware.js                 # Middleware de Next.js (rutas protegidas)
├── 📄 next.config.js                # Configuración de Next.js
├── 📄 jsconfig.json                 # Alias de importación (@/)
├── 📄 package.json                  # Dependencias del proyecto
├── 📄 supabase-schema.sql           # Schema de la base de datos
├── 📄 .env.local                    # Variables de entorno (local)
├── 📄 README.md                     # Este archivo
├── 📄 SETUP.md                      # Guía de configuración
├── 📄 EMAILS.md                     # Configuración de correos
└── 📄 SENDGRID_SETUP.md             # Configuración de SendGrid
```

---

## Requisitos Previos

- **Node.js** 18.x o superior
- **npm** o **yarn**
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Cuenta en [SendGrid](https://sendgrid.com) (opcional, para emails)
- Cuenta en [Cloudflare](https://cloudflare.com) (opcional, para Turnstile)

---

## Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd nueva-pagina-vecindapp
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# SendGrid (Opcional - para envío de correos)
SENDGRID_API_KEY=SG.tu-api-key
SENDGRID_FROM_EMAIL=noreply@tu-dominio.com
EMAIL_SERVICE_ENABLED=false  # true para activar envío real

# Cloudflare Turnstile (Opcional - para CAPTCHA)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=tu-site-key
TURNSTILE_SECRET_KEY=tu-secret-key

# Para desarrollo, puedes usar las claves de prueba:
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
# TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

# URL del sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Service Role Key (solo para backend - MANTENER PRIVADA)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 4. Configurar Base de Datos en Supabase

1. Ve a tu [dashboard de Supabase](https://supabase.com/dashboard)
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo `supabase-schema.sql`
4. Ejecuta el script
5. Verifica que se crearon las tablas: `usuarios`, `solicitudes`, y el bucket `documentos`

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Configuración Detallada

Para una guía paso a paso completa, consulta:

- **[SETUP.md](./SETUP.md)** - Configuración de Supabase y autenticación
- **[EMAILS.md](./EMAILS.md)** - Configuración del sistema de correos
- **[SENDGRID_SETUP.md](./SENDGRID_SETUP.md)** - Guía rápida de SendGrid

---

## Sistema de Roles y Permisos

### Vecino

**Acceso:** Dashboard, Solicitudes, Perfil, Mapa, Noticias, Actividades, Proyectos, Reservas, Avisos

**Permisos:**
- ✅ Ver y editar su propio perfil
- ✅ Crear solicitudes de certificados
- ✅ Ver estado de sus solicitudes
- ✅ Descargar certificados aprobados
- ✅ Ver noticias y reaccionar
- ✅ Inscribirse en actividades
- ✅ Postular a proyectos
- ✅ Reservar espacios comunitarios
- ✅ Ver avisos
- ❌ No puede gestionar otros usuarios
- ❌ No puede aprobar solicitudes

### Secretaria

**Acceso:** Todo lo de Vecino + Panel de Secretaría

**Permisos adicionales:**
- ✅ Aprobar/rechazar registros de nuevos vecinos
- ✅ Gestionar solicitudes de certificados
- ✅ Emitir certificados manualmente
- ✅ Crear y editar noticias
- ✅ Crear y gestionar actividades
- ✅ Gestionar inscripciones a actividades
- ✅ Gestionar proyectos y postulaciones
- ✅ Aprobar/rechazar reservas
- ✅ Publicar avisos
- ✅ Gestionar información de la directiva
- ✅ Gestionar espacios comunitarios (quincho, salón, etc.)
- ✅ Configuración de secretaría
- ⚠️ Sesión con timeout de 10 minutos de inactividad

### Administrador

**Acceso:** Acceso total a todo el sistema + Panel de Administración

**Permisos adicionales:**
- ✅ Todo lo de Secretaria
- ✅ Gestionar roles de usuarios
- ✅ Ver logs del sistema
- ✅ Generar reportes
- ✅ Modificar configuración global
- ✅ Gestionar todos los aspectos del sistema

---

## Funcionalidades Implementadas

### Autenticación y Seguridad

- [x] Registro con validación de RUT chileno
- [x] Validación de formato de email
- [x] Subida de comprobante de residencia (obligatorio)
- [x] Protección CAPTCHA con Cloudflare Turnstile
- [x] Login con email y contraseña
- [x] Middleware de protección de rutas por rol
- [x] Estados de usuario (pendiente, activo, rechazado, inactivo)
- [x] Página de espera para usuarios pendientes
- [x] Timeout automático de sesión para secretaría (10 min)
- [x] Headers anti-cache para seguridad
- [x] Row Level Security (RLS) en Supabase

### Gestión de Solicitudes

- [x] Crear solicitudes de certificados
- [x] Tipos: Certificado de Residencia, Certificado de Antigüedad
- [x] Estados: Pendiente, En Proceso, Completado, Rechazado
- [x] Seguimiento de solicitudes en tiempo real
- [x] Generación automática de PDFs
- [x] Descarga de certificados aprobados
- [x] Sistema de observaciones
- [x] Historial completo de solicitudes

### Sistema de Noticias

- [x] Publicación de noticias con imágenes
- [x] Editor de texto enriquecido V2 (Quill) con inserción de imágenes en el contenido
- [x] Sistema de reacciones (Me gusta, Me encanta, etc.)
- [x] Contador de reacciones en tiempo real
- [x] Vista detallada de noticias
- [x] Notificación por email al publicar noticias
- [x] Gestión completa desde panel de secretaría

### Actividades Comunitarias

- [x] Creación de actividades con fechas y cupos
- [x] Sistema de inscripciones
- [x] Control de cupos disponibles
- [x] Gestión de inscripciones desde secretaría
- [x] Historial de actividades
- [x] Listado de mis inscripciones (vecino)

### Proyectos Vecinales

- [x] Publicación de proyectos
- [x] Sistema de postulaciones
- [x] Subida de documentos adjuntos
- [x] Estados: Pendiente, Aprobado, Rechazado
- [x] Gestión de postulaciones desde secretaría
- [x] Visualización de proyectos activos

### Reservas de Espacios

- [x] Reserva de espacios comunitarios
- [x] Calendario de disponibilidad
- [x] Estados: Pendiente, Confirmado, Rechazado
- [x] Gestión de reservas desde secretaría
- [x] Generación de comprobante de reserva
- [x] Mis reservas (vecino)

### Sistema de Correos

- [x] Integración con SendGrid
- [x] Plantillas HTML responsive
- [x] Notificación de aprobación de registro
- [x] Notificación de aprobación de solicitud
- [x] Notificación de rechazo
- [x] Modo desarrollo (logs en consola)
- [x] Modo producción (envío real)

### Panel Administrativo

- [x] Dashboard con métricas globales
- [x] Contadores en tiempo real (solicitudes, vecinos activos, etc.)
- [x] Gestión completa de usuarios
- [x] Edición de roles y estados
- [x] Sistema de logs del sistema
- [x] Generación de reportes
- [x] Configuración global de la aplicación
- [x] Visualización de actividad del sistema

### Mapa Interactivo

- [x] Mapa de la comunidad con Leaflet
- [x] Marcadores interactivos
- [x] Información de ubicación

### Gestión de Perfil

- [x] Edición de datos personales
- [x] Cambio de contraseña
- [x] Actualización de foto de perfil
- [x] Historial de actividad

### Avisos

- [x] Publicación de avisos importantes con imágenes
- [x] Listado de avisos activos
- [x] Notificación por email al publicar avisos
- [x] Gestión desde secretaría

### Optimizaciones y UX

- [x] Diseño 100% responsive (móvil, tablet, desktop)
- [x] Botón "Scroll to Top" para navegación rápida
- [x] Optimización de CSS y variables personalizadas
- [x] Compresión automática de imágenes subidas
- [x] Headers anti-cache para seguridad
- [x] Visualización de comprobantes con URLs firmadas (signed URLs)
- [x] Landing page optimizada
- [x] Solución de problemas de caché en navegadores

---

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo en http://localhost:3000

# Producción
npm run build        # Construye la aplicación optimizada para producción
npm start            # Inicia el servidor de producción

# Utilidades
npm install          # Instala todas las dependencias
```

---

## Paleta de Colores

El diseño utiliza una paleta moderna y profesional:

```css
--bg: #d8e7eb           /* Fondo principal - Mist Blue */
--panel: #f4f8f9        /* Paneles/Cards - Soft Panel */
--muted: #bfd3d9        /* Bordes y elementos deshabilitados */
--text: #154765         /* Texto principal - Deep Navy */
--sub: #439fa4          /* Subtítulos - Teal Highlight */
--accent: #439fa4       /* Color de acento primario */
--accent-2: #154765     /* Color de acento secundario */
--ok: #34d399           /* Estado exitoso - Green */
--warn: #fbbf24         /* Advertencia - Yellow */
--err: #fb7185          /* Error - Red */
```

---

## Base de Datos

### Tablas Principales

#### `usuarios`
- **id** (UUID, PK) - Referencia a auth.users
- **email** (TEXT, UNIQUE)
- **rut** (TEXT, UNIQUE)
- **nombres** (TEXT)
- **apellidos** (TEXT)
- **direccion** (TEXT)
- **telefono** (TEXT)
- **rol** (vecino | secretaria | admin)
- **estado** (pendiente_aprobacion | activo | rechazado | inactivo)
- **comprobante_url** (TEXT) - URL del comprobante en Storage
- **created_at, updated_at** (TIMESTAMP)

#### `solicitudes`
- **id** (UUID, PK)
- **usuario_id** (UUID, FK → usuarios.id)
- **tipo** (certificado_residencia | certificado_antiguedad | otro)
- **estado** (pendiente | en_proceso | completado | rechazado)
- **motivo** (TEXT)
- **observaciones** (TEXT)
- **documento_url** (TEXT) - URL del certificado generado
- **fecha_solicitud, fecha_respuesta** (TIMESTAMP)
- **atendido_por** (UUID, FK → usuarios.id)
- **created_at, updated_at** (TIMESTAMP)

### Storage

- **Bucket: `documentos`**
  - `/comprobantes/{user_id}/` - Comprobantes de residencia
  - `/certificados/{user_id}/` - Certificados generados

### Row Level Security (RLS)

- Los vecinos solo pueden ver sus propios datos
- Secretaria y Admin pueden ver todos los datos
- Las políticas están definidas en `supabase-schema.sql`

---

## API Routes

### Autenticación

- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/session` - Obtener sesión actual

### Certificados

- `POST /api/certificados/emitir` - Generar certificado PDF

### Emails

- `POST /api/emails/send` - Enviar email individual
- `POST /api/emails/send-bulk` - Envío masivo

### Seguridad

- `POST /api/verify-turnstile` - Validar CAPTCHA

---

## Deployment

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de entorno en tu plataforma de hosting:

```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
EMAIL_SERVICE_ENABLED=true
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

### Plataformas Recomendadas

- **Vercel** - Deploy automático desde Git (recomendado para Next.js)
- **Netlify** - Alternativa con CI/CD
- **Railway** - Deploy con PostgreSQL incluido
- **DigitalOcean App Platform** - Deploy con más control

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

---

## Troubleshooting

### Problemas Comunes

**Error: "Invalid API key"**
- Verifica que `.env.local` tenga las credenciales correctas de Supabase
- Reinicia el servidor después de modificar `.env.local`

**Error: "Failed to upload comprobante"**
- Verifica que el bucket 'documentos' exista en Supabase Storage
- Verifica que las políticas RLS estén configuradas correctamente

**Usuario queda en "Pendiente de Aprobación"**
- Es el comportamiento esperado. Un admin/secretaria debe aprobar manualmente desde el panel
- Para testing: actualiza manualmente el campo `estado` a `activo` en la tabla `usuarios`

**Middleware redirige en loop**
- Asegúrate de que el perfil del usuario exista en la tabla `usuarios`
- Verifica que el `rol` y `estado` sean válidos

**Los correos no se envían**
- Verifica que `EMAIL_SERVICE_ENABLED=true` en `.env.local`
- Revisa la consola del servidor para ver errores
- Si está en `false`, los correos solo se muestran en la consola (modo desarrollo)

**Sesión de secretaria expira muy rápido**
- El timeout es de 10 minutos de inactividad (configurable en `middleware.js`)
- Cualquier interacción con la página reinicia el contador

---

## Contribución

Este proyecto es parte de un proyecto académico. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Add: descripción del cambio'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

### Convenciones de Commits

- `Add:` - Nueva funcionalidad
- `Update:` - Actualización de funcionalidad existente
- `Fix:` - Corrección de bugs
- `Refactor:` - Refactorización de código
- `Docs:` - Cambios en documentación
- `Style:` - Cambios de estilo (formato, CSS)

---

## Licencia

Este proyecto es de uso académico y educativo.

---

## Autor

Proyecto desarrollado como parte del proyecto Capstone semestral.

---

## Soporte

Para problemas o preguntas:

1. Revisa la documentación en `/SETUP.md`, `/EMAILS.md`
2. Revisa los logs del servidor en la consola
3. Verifica la configuración de Supabase
4. Consulta la [documentación de Next.js](https://nextjs.org/docs)
5. Consulta la [documentación de Supabase](https://supabase.com/docs)

---

**Última actualización:** Noviembre 2025

## Changelog Reciente

### Últimas Funcionalidades Agregadas

- ✅ Cloudflare Turnstile CAPTCHA en registro
- ✅ Gestión de directivas en secretaría
- ✅ Contador de solicitudes y vecinos en tiempo real
- ✅ Editor de noticias V2 con soporte para insertar imágenes dentro del contenido
- ✅ Sistema de reacciones (me gusta/no me gusta) en noticias
- ✅ Notificaciones por email en noticias y avisos
- ✅ Botón de scroll to top
- ✅ Optimización de CSS y mejoras de responsividad
- ✅ Visualización mejorada de comprobantes con signed URLs
- ✅ Separación de botones Ver/Descargar para comprobantes
- ✅ Secciones de administrador (logs, reportes, roles, configuración)
- ✅ Gestión de espacios comunitarios

---

**Proyecto VecindApp** - Modernizando la gestión comunitaria
