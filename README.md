# VecindApp - Plataforma de Gestión Vecinal

<div align="center">

**Sistema completo de gestión comunitaria para juntas de vecinos**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=flat&logo=supabase)](https://supabase.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=flat&logo=bootstrap)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-Academic-blue.svg)](LICENSE)

</div>

---

## 📋 Descripción

VecindApp es una plataforma web integral diseñada para modernizar la gestión de juntas de vecinos en Chile. Facilita la comunicación entre vecinos y la administración, permitiendo solicitar certificados, participar en actividades, reservar espacios comunitarios, visualizar noticias, postular proyectos, y mucho más.

### ✨ Características Principales

- **🔐 Autenticación segura** con roles diferenciados (Vecino, Secretaría, Admin)
- **📄 Gestión de certificados** de residencia y antigüedad con generación automática de PDFs
- **📰 Sistema de noticias** con editor WYSIWYG, imágenes y reacciones
- **🎯 Actividades comunitarias** con sistema de inscripciones y control de cupos
- **🏗️ Proyectos vecinales** con postulaciones, documentos adjuntos y seguimiento
- **🏠 Reservas de espacios** comunes con calendario y gestión de bloques horarios
- **📢 Sistema de avisos** con prioridades y fechas de vigencia
- **🗺️ Mapa interactivo** con clustering de marcadores y geocodificación
- **📧 Notificaciones multi-canal** por email, Telegram y WhatsApp
- **🤖 Bot de Telegram** con comandos interactivos y notificaciones push
- **💬 Bot de WhatsApp** con Cloud API para avisos y noticias instantáneas
- **👥 Gestión de directiva** con contactos y cargos
- **📊 Panel administrativo** completo con logs, reportes y estadísticas
- **🤖 Chatbot de ayuda** con IA integrada (OpenAI GPT-4o-mini)
- **🛡️ Protección anti-spam** con Cloudflare Turnstile
- **📱 Diseño responsive** adaptado a todos los dispositivos
- **🎨 Interfaz moderna** con Bootstrap Icons y paleta de colores profesional

---

## 🚀 Tecnologías

| Categoría | Tecnología | Versión | Uso |
|-----------|-----------|---------|-----|
| **Framework** | Next.js | 14.2.3 | App Router + Server/Client Components |
| **Lenguaje** | JavaScript | ES6+ | Full-stack development |
| **Base de Datos** | Supabase (PostgreSQL) | Latest | Auth + Storage + Database + RLS |
| **Autenticación** | Supabase Auth | 2.75+ | Sistema de roles y permisos |
| **UI Framework** | Bootstrap | 5.3.8 | Responsive design + Components |
| **Iconos** | Bootstrap Icons | 1.11+ | Iconografía consistente |
| **Mapas** | Leaflet + React Leaflet | 1.9.4 / 4.2+ | Mapas interactivos |
| **Clustering** | react-leaflet-cluster | 2.1+ | Agrupación de marcadores |
| **Editor** | Quill (react-quill) | 2.0+ | Editor WYSIWYG para noticias |
| **PDF** | jsPDF + AutoTable | 3.0+ | Generación de certificados |
| **Emails** | SendGrid | 8.1+ | Notificaciones por correo |
| **Telegram** | node-telegram-bot-api | 0.66+ | Bot de notificaciones Telegram |
| **WhatsApp** | Meta Cloud API | Latest | Bot de notificaciones WhatsApp |
| **IA** | OpenAI API | 4.0+ | Chatbot de ayuda con GPT-4o-mini |
| **Seguridad** | Cloudflare Turnstile | Latest | Protección anti-bots en registro |
| **Geocoding** | Nominatim OSM | - | Obtención de coordenadas |
| **Imágenes** | browser-image-compression | 2.0+ | Optimización automática |

---

## 📁 Estructura del Proyecto

```
nueva-pagina-vecindapp/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (auth)/                   # Rutas de autenticación públicas
│   │   ├── login/                   # Inicio de sesión
│   │   └── register/                # Registro con CAPTCHA
│   ├── 📁 (vecino)/                 # Rutas protegidas para vecinos
│   │   ├── dashboard/               # Panel principal con estadísticas
│   │   ├── solicitudes/             # Gestionar certificados
│   │   │   └── nueva/               # Nueva solicitud
│   │   ├── perfil/                  # Editar perfil y foto
│   │   ├── mapa/                    # Mapa interactivo de la comunidad
│   │   ├── noticias/                # Ver noticias publicadas
│   │   │   └── [id]/                # Detalle de noticia
│   │   ├── avisos/                  # Tablón de avisos
│   │   ├── actividades/             # Actividades comunitarias
│   │   │   ├── [id]/                # Detalle e inscripción
│   │   │   └── mis-inscripciones/   # Mis inscripciones
│   │   ├── proyectos/               # Proyectos vecinales
│   │   │   ├── [id]/                # Detalle de proyecto
│   │   │   ├── postular/            # Postular proyecto
│   │   │   └── mis-postulaciones/   # Mis postulaciones
│   │   └── reservas/                # Reservar espacios
│   │       └── mis-reservas/        # Mis reservas
│   ├── 📁 secretaria/               # Panel de secretaría
│   │   ├── dashboard/               # Dashboard con métricas
│   │   ├── vecinos/                 # Gestionar vecinos
│   │   │   └── aprobaciones/        # Aprobar registros pendientes
│   │   ├── solicitudes/             # Gestionar solicitudes
│   │   ├── certificados/            # Emitir certificados manualmente
│   │   ├── noticias/                # Publicar y editar noticias
│   │   │   ├── nueva/               # Crear noticia
│   │   │   └── editar/[id]/         # Editar noticia
│   │   ├── avisos/                  # Gestionar avisos
│   │   │   ├── nuevo/               # Crear aviso
│   │   │   └── editar/[id]/         # Editar aviso
│   │   ├── actividades/             # Gestionar actividades
│   │   │   ├── nueva/               # Crear actividad
│   │   │   ├── editar/[id]/         # Editar actividad
│   │   │   └── inscripciones/[id]/  # Gestionar inscripciones
│   │   ├── proyectos/               # Gestionar proyectos
│   │   │   ├── [id]/                # Detalle y gestión
│   │   │   └── pendientes/          # Proyectos pendientes
│   │   ├── reservas/                # Administrar reservas
│   │   │   └── pendientes/          # Reservas pendientes
│   │   ├── espacios/                # Administrar espacios
│   │   ├── directiva/               # Gestionar directiva
│   │   └── configuracion/           # Configuración de la organización
│   ├── 📁 admin/                    # Panel de administración
│   │   ├── dashboard/               # Dashboard global
│   │   ├── usuarios/                # Gestión de usuarios
│   │   │   └── [id]/                # Editar usuario
│   │   ├── solicitudes/             # Todas las solicitudes
│   │   │   └── [id]/                # Gestionar solicitud
│   │   ├── roles/                   # Gestión de roles y permisos
│   │   ├── logs/                    # Logs de actividad del sistema
│   │   ├── reportes/                # Generación de reportes
│   │   └── configuracion/           # Configuración global del sistema
│   ├── 📁 api/                      # API Routes
│   │   ├── auth/                    # Endpoints de autenticación
│   │   ├── certificados/            # Generación de certificados PDF
│   │   ├── emails/                  # Envío de correos
│   │   ├── telegram/                # Webhook y endpoints del bot Telegram
│   │   │   ├── webhook/             # Recepción de mensajes Telegram
│   │   │   ├── init/                # Inicialización bot (desarrollo)
│   │   │   └── reset/               # Reset y reconfiguración
│   │   ├── whatsapp/                # Webhook y endpoints del bot WhatsApp
│   │   │   ├── webhook/             # Recepción de mensajes WhatsApp
│   │   │   ├── noticias/            # Envío de noticias
│   │   │   └── avisos/              # Envío de avisos
│   │   ├── chat/                    # Chatbot con OpenAI
│   │   ├── noticias/publicar/       # Publicación y notificaciones
│   │   ├── avisos/publicar/         # Publicación y notificaciones
│   │   └── verify-turnstile/        # Validación de CAPTCHA
│   ├── pendiente-aprobacion/        # Página de espera post-registro
│   ├── layout.js                    # Layout raíz con AuthProvider
│   ├── page.js                      # Landing page pública
│   └── globals.css                  # Estilos globales (3600+ líneas)
├── 📁 components/                   # Componentes reutilizables
│   ├── layout/                      # Headers, Sidebars (Vecino, Secretaría, Admin)
│   ├── maps/                        # MapContainer, VecinoMarker, MapaGeneral
│   ├── noticias/                    # NoticiaCard, ReaccionButton
│   ├── secretaria/                  # VecinosPageClient
│   └── chatbot/                     # ChatbotButton, ChatWindow
├── 📁 contexts/                     # Context API de React
│   └── AuthContext.jsx              # Estado global de autenticación
├── 📁 hooks/                        # Custom Hooks
│   ├── useAuth.js                   # Hook de autenticación
│   └── useSoftLogout.js             # Logout suave (mantiene CSS)
├── 📁 lib/                          # Utilidades y helpers
│   ├── supabase/                    # Clientes de Supabase
│   │   ├── client.js                # Cliente browser
│   │   ├── server.js                # Cliente server
│   │   ├── middleware.js            # Cliente middleware
│   │   └── admin.js                 # Cliente admin
│   ├── emails/                      # Sistema de correos
│   │   ├── sendEmail.js             # Funciones de envío multi-canal
│   │   └── templates.js             # Plantillas HTML responsive
│   ├── telegram/                    # Bot de Telegram
│   │   ├── client.js                # Cliente y API con fetch
│   │   ├── handlers.js              # Manejadores de comandos
│   │   ├── notifications.js         # Envío de notificaciones
│   │   └── commands.js              # Registro de comandos (dev)
│   ├── whatsapp/                    # Bot de WhatsApp
│   │   ├── client.js                # Cliente Cloud API
│   │   └── notifications.js         # Envío de notificaciones
│   ├── notifications/               # Sistema unificado
│   │   └── preferences.js           # Gestión de preferencias
│   ├── pdf/                         # Generación de PDFs
│   │   └── generarCertificado.js    # Certificados con marca de agua
│   ├── storage/                     # Gestión de archivos
│   │   ├── uploadImage.js           # Subida de imágenes
│   │   └── deleteFile.js            # Eliminación de archivos
│   ├── logs/                        # Sistema de logs
│   │   ├── createLog.js             # Creación de logs
│   │   └── getLogs.js               # Consulta de logs
│   ├── geocoding/                   # Geocodificación
│   │   └── getCoordinates.js        # Nominatim OSM
│   └── forceLogout.js               # Logout de emergencia
├── 📁 public/                       # Archivos estáticos
│   ├── vencinapp.svg                # Logo de la aplicación
│   └── vecindapp-icon.png           # Favicon
├── 📄 middleware.js                 # Middleware de Next.js (protección de rutas)
├── 📄 next.config.js                # Configuración de Next.js
├── 📄 jsconfig.json                 # Alias de importación (@/)
├── 📄 package.json                  # Dependencias del proyecto
├── 📄 supabase-schema.sql           # Schema completo de la BD
├── 📄 .env.local                    # Variables de entorno (local)
├── 📄 .env.example                  # Ejemplo de variables de entorno
├── 📄 README.md                     # Este archivo
├── 📄 SETUP-ENV.md                  # Guía de configuración de entorno
├── 📄 NOTIFICACIONES-EMAIL.md       # Configuración de correos
├── 📄 TELEGRAM-SETUP.md             # Configuración bot Telegram
├── 📄 TELEGRAM-PRODUCTION.md        # Deploy Telegram en producción
├── 📄 TELEGRAM-VERCEL-DEBUG.md      # Debug Telegram en Vercel
├── 📄 WHATSAPP-SETUP.md             # Configuración bot WhatsApp
├── 📄 TURNSTILE-SETUP.md            # Configuración de CAPTCHA
└── 📄 INSTRUCCIONES-*.md            # Guías de funcionalidades específicas
```

---

## 📋 Requisitos Previos

- **Node.js** 18.x o superior
- **npm** o **yarn**
- Cuenta en [Supabase](https://supabase.com) (Plan gratuito disponible)
- Cuenta en [SendGrid](https://sendgrid.com) (Opcional - para emails)
- Cuenta en [Cloudflare](https://cloudflare.com) (Opcional - para Turnstile)
- Cuenta en [OpenAI](https://platform.openai.com) (Opcional - para chatbot IA)
- Bot de [Telegram](https://t.me/botfather) (Opcional - para notificaciones Telegram)
- Cuenta en [Meta for Developers](https://developers.facebook.com) (Opcional - para WhatsApp Business)

---

## ⚡ Instalación Rápida

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

Crea un archivo `.env.local` en la raíz del proyecto (puedes copiar `.env.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# SendGrid (Opcional - para envío de correos)
SENDGRID_API_KEY=SG.tu-api-key
SENDGRID_FROM_EMAIL=noreply@tu-dominio.com
EMAIL_SERVICE_ENABLED=false  # true para activar envío real

# OpenAI (Opcional - para chatbot IA)
OPENAI_API_KEY=sk-tu-api-key
OPENAI_CHAT_MODEL=gpt-4o-mini

# Cloudflare Turnstile (Opcional - para CAPTCHA)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=tu-site-key
TURNSTILE_SECRET_KEY=tu-secret-key

# Telegram Bot (Opcional - para notificaciones)
TELEGRAM_BOT_TOKEN=tu-bot-token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=tu_bot_username

# WhatsApp Business (Opcional - para notificaciones)
WHATSAPP_ACCESS_TOKEN=tu-access-token
WHATSAPP_PHONE_NUMBER_ID=tu-phone-id
WHATSAPP_VERIFY_TOKEN=tu-verify-token
WHATSAPP_API_VERSION=v18.0
NEXT_PUBLIC_WHATSAPP_NUMBER=+56912345678

# URL del sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configurar Base de Datos en Supabase

1. Ve a tu [dashboard de Supabase](https://supabase.com/dashboard)
2. Crea un nuevo proyecto
3. Abre el **SQL Editor**
4. Copia y pega el contenido del archivo `supabase-schema.sql`
5. Ejecuta el script completo
6. Verifica que se crearon todas las tablas y buckets de storage

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📚 Configuración Detallada

Para guías paso a paso completas, consulta:

- **[SETUP-ENV.md](./SETUP-ENV.md)** - Configuración completa de variables de entorno
- **[NOTIFICACIONES-EMAIL.md](./NOTIFICACIONES-EMAIL.md)** - Sistema de correos con SendGrid
- **[TELEGRAM-SETUP.md](./TELEGRAM-SETUP.md)** - Configuración del bot de Telegram
- **[TELEGRAM-PRODUCTION.md](./TELEGRAM-PRODUCTION.md)** - Deploy de Telegram en Vercel
- **[TELEGRAM-VERCEL-DEBUG.md](./TELEGRAM-VERCEL-DEBUG.md)** - Troubleshooting Telegram en producción
- **[WHATSAPP-SETUP.md](./WHATSAPP-SETUP.md)** - Configuración del bot de WhatsApp
- **[TURNSTILE-SETUP.md](./TURNSTILE-SETUP.md)** - Protección anti-spam con Cloudflare
- **[INSTRUCCIONES-MAPA-VECINOS.md](./INSTRUCCIONES-MAPA-VECINOS.md)** - Configuración del mapa
- **[INSTRUCCIONES-STORAGE-NOTICIAS.md](./INSTRUCCIONES-STORAGE-NOTICIAS.md)** - Storage de imágenes

---

## 👥 Sistema de Roles y Permisos

### 🏘️ Vecino

**Acceso:** Dashboard, Solicitudes, Perfil, Mapa, Noticias, Actividades, Proyectos, Reservas, Avisos

**Permisos:**
- ✅ Ver y editar su propio perfil
- ✅ Subir y cambiar foto de perfil
- ✅ Crear solicitudes de certificados
- ✅ Ver estado de sus solicitudes
- ✅ Descargar certificados aprobados (PDF)
- ✅ Ver noticias publicadas y reaccionar (👍 ❤️ 👏 🎉 😮 😢 😡)
- ✅ Ver avisos activos
- ✅ Inscribirse en actividades comunitarias
- ✅ Ver sus inscripciones
- ✅ Postular a proyectos vecinales
- ✅ Subir documentos adjuntos a proyectos
- ✅ Ver estado de sus postulaciones
- ✅ Reservar espacios comunitarios
- ✅ Ver sus reservas
- ✅ Ver mapa de la comunidad con su ubicación
- ✅ Usar chatbot de ayuda con IA
- ❌ No puede gestionar otros usuarios
- ❌ No puede aprobar solicitudes/reservas/proyectos
- ❌ No puede publicar noticias/avisos

### 📋 Secretaría

**Acceso:** Todo lo de Vecino + Panel de Secretaría completo

**Permisos adicionales:**
- ✅ Aprobar/rechazar registros de nuevos vecinos
- ✅ Ver lista completa de vecinos con filtros
- ✅ Ver detalles completos de vecinos
- ✅ Gestionar solicitudes de certificados (aprobar/rechazar)
- ✅ Emitir certificados manualmente
- ✅ Crear, editar y eliminar noticias
- ✅ Subir imágenes a noticias (con optimización automática)
- ✅ Editor WYSIWYG para contenido HTML
- ✅ Crear, editar y eliminar avisos
- ✅ Configurar prioridad y vigencia de avisos
- ✅ Crear y gestionar actividades comunitarias
- ✅ Gestionar inscripciones a actividades
- ✅ Control de cupos disponibles
- ✅ Gestionar proyectos vecinales y postulaciones
- ✅ Aprobar/rechazar proyectos
- ✅ Cambiar estados de proyectos
- ✅ Aprobar/rechazar reservas de espacios
- ✅ Gestionar espacios disponibles
- ✅ Configurar bloques horarios
- ✅ Gestionar información de la directiva
- ✅ Configurar datos de la organización
- ⚠️ Sesión con timeout de 10 minutos de inactividad
- ❌ No puede gestionar roles de usuarios
- ❌ No puede acceder a logs del sistema

### 🛡️ Administrador

**Acceso:** Acceso total + Panel de Administración avanzado

**Permisos adicionales:**
- ✅ Todo lo de Secretaría
- ✅ Gestión completa de usuarios
- ✅ Cambiar roles de usuarios (vecino/secretaria/admin)
- ✅ Cambiar estados de usuarios
- ✅ Ver y filtrar logs de actividad del sistema
- ✅ Generar reportes y estadísticas globales
- ✅ Ver matriz de permisos por rol
- ✅ Modificar configuración global del sistema
- ✅ Acceso a todas las funcionalidades

---

## 🎯 Funcionalidades Implementadas

### 🔐 Autenticación y Seguridad

- [x] Registro con validación de RUT chileno (formato y dígito verificador)
- [x] Validación de formato de email
- [x] Subida de comprobante de residencia obligatoria
- [x] Protección CAPTCHA con Cloudflare Turnstile
- [x] Login con email y contraseña
- [x] Middleware de protección de rutas por rol
- [x] Estados de usuario (pendiente_aprobacion, activo, rechazado, inactivo)
- [x] Página de espera para usuarios pendientes
- [x] Timeout automático de sesión para secretaría (10 min)
- [x] Logout suave (mantiene CSS cargado)
- [x] Headers anti-cache para seguridad
- [x] Row Level Security (RLS) completo en Supabase
- [x] Políticas de acceso granulares por tabla

### 📄 Gestión de Solicitudes y Certificados

- [x] Crear solicitudes de certificados
- [x] Tipos: Certificado de Residencia, Certificado de Antigüedad
- [x] Estados: Pendiente, En Proceso, Completado, Rechazado
- [x] Seguimiento en tiempo real
- [x] Generación automática de PDFs con jsPDF
- [x] Marca de agua y formato profesional
- [x] Descarga directa de certificados aprobados
- [x] Sistema de observaciones
- [x] Notificación por email al aprobar/rechazar
- [x] Historial completo con fechas
- [x] Filtros por estado y tipo
- [x] Estadísticas por estado

### 📰 Sistema de Noticias

- [x] Publicación con editor WYSIWYG (Quill)
- [x] Formatos de texto: negrita, cursiva, listas, títulos, enlaces
- [x] Subida y gestión de imágenes
- [x] Optimización automática de imágenes (browser-image-compression)
- [x] Storage en Supabase con políticas de acceso
- [x] Sistema de reacciones (7 tipos: 👍 ❤️ 👏 🎉 😮 😢 😡)
- [x] Contador de reacciones en tiempo real
- [x] Vista detallada con HTML renderizado
- [x] Vista previa de cards con extracto
- [x] Gestión completa desde secretaría (crear/editar/eliminar)
- [x] Filtros por fecha
- [x] Estadísticas de publicaciones

### 📢 Sistema de Avisos

- [x] Publicación de avisos importantes
- [x] Niveles de prioridad (normal, importante, urgente)
- [x] Fechas de vigencia (desde/hasta)
- [x] Activación/desactivación
- [x] Subida de imágenes
- [x] Gestión completa desde secretaría
- [x] Filtrado por estado (activos/todos)
- [x] Ordenamiento por prioridad y fecha

### 🎯 Actividades Comunitarias

- [x] Creación con fecha, hora y lugar
- [x] Control de cupos disponibles
- [x] Sistema de inscripciones
- [x] Validación de cupos llenos
- [x] Gestión de inscripciones desde secretaría
- [x] Lista de inscritos con datos de contacto
- [x] Historial de actividades
- [x] Mi historial de inscripciones (vecino)
- [x] Estados: Próximas, En curso, Finalizadas
- [x] Cancelación de inscripción

### 🏗️ Proyectos Vecinales

- [x] Publicación de proyectos con presupuesto
- [x] Sistema de postulaciones
- [x] Subida de documentos adjuntos (PDF, imágenes, Word)
- [x] Múltiples archivos por proyecto
- [x] Estados: Pendiente, Aprobado, Rechazado, En Ejecución, Completado
- [x] Gestión desde secretaría (aprobar/rechazar/cambiar estado)
- [x] Vista detallada con todos los documentos
- [x] Listado de postulaciones del vecino
- [x] Notificaciones por email
- [x] Estadísticas por estado
- [x] Filtros avanzados

### 🏠 Reservas de Espacios

- [x] Reserva de espacios comunitarios
- [x] Bloques horarios (Mañana, Tarde, Noche, Día Completo)
- [x] Gestión de espacios disponibles
- [x] Control de disponibilidad por fecha
- [x] Estados: Pendiente, Aprobada, Rechazada, Cancelada, Completada
- [x] Aprobación/rechazo desde secretaría
- [x] Motivo de rechazo
- [x] Mis reservas (vecino)
- [x] Notificaciones por email
- [x] Estadísticas completas
- [x] Administración de espacios

### 🗺️ Mapa Interactivo

- [x] Mapa con Leaflet y OpenStreetMap
- [x] Marcadores de vecinos con coordenadas
- [x] Clustering de marcadores cercanos (react-leaflet-cluster)
- [x] Colores por cantidad (pequeño/mediano/grande)
- [x] Spiderfy al hacer zoom máximo
- [x] Geocodificación automática de direcciones
- [x] Popup con información del vecino
- [x] Estadísticas de vecinos en el mapa
- [x] Lista de vecinos sin coordenadas
- [x] Mapa de comunidad para vecinos con datos reales
- [x] Lugares de interés cercanos
- [x] Integración con configuración de la organización

### 📧 Sistema de Notificaciones Multi-Canal

#### Email (SendGrid)
- [x] Integración completa con SendGrid
- [x] 13 tipos de notificaciones diferentes
- [x] Plantillas HTML responsive profesionales
- [x] Notificación de aprobación/rechazo de registro
- [x] Notificación de aprobación/rechazo de solicitudes
- [x] Notificación de aprobación/rechazo de reservas
- [x] Notificación de nuevas noticias y avisos
- [x] Modo desarrollo (logs en consola)
- [x] Modo producción (envío real vía SendGrid)
- [x] Gestión de errores y reintentos

#### Bot de Telegram
- [x] Integración con node-telegram-bot-api
- [x] Modo polling para desarrollo (local)
- [x] Modo webhook para producción (Vercel)
- [x] Comandos interactivos:
  - `/start` - Mensaje de bienvenida
  - `/ayuda` - Lista de comandos disponibles
  - `/vincular [RUT]` - Vincular cuenta de usuario
  - `/perfil` - Ver información personal
  - `/noticias` - Ver últimas 2 noticias
  - `/avisos` - Ver avisos activos
  - `/desvincular` - Desactivar notificaciones
- [x] Notificaciones push automáticas:
  - Nuevas noticias publicadas
  - Nuevos avisos importantes
  - Aprobación de reservas
- [x] Sistema de preferencias de notificación
- [x] Componente TelegramConnect para vincular
- [x] Manejo de errores y timeouts
- [x] Optimizado para funciones serverless

#### Bot de WhatsApp (Cloud API)
- [x] Integración con Meta Cloud API (WhatsApp Business)
- [x] Webhook para recibir mensajes
- [x] Comandos de texto:
  - `VINCULAR [RUT]` - Vincular cuenta
  - `NOTICIAS` - Ver últimas noticias
  - `AVISOS` - Ver avisos activos
  - `PERFIL` - Ver información personal
  - `AYUDA` - Lista de comandos
  - `DESVINCULAR` - Desactivar notificaciones
- [x] Notificaciones push automáticas
- [x] Mensajes formateados con Markdown
- [x] Sistema de preferencias combinadas (email+telegram+whatsapp)
- [x] Validación de números de WhatsApp
- [x] Gestión de opt-in/opt-out

#### Sistema Unificado
- [x] Gestión centralizada de preferencias
- [x] Soporte multi-canal (email, telegram, whatsapp, o combinaciones)
- [x] Envío paralelo a canales configurados
- [x] Estadísticas de envío por canal
- [x] Rate limiting para evitar bloqueos

### 🤖 Chatbot con IA

- [x] Integración con OpenAI GPT-4o-mini
- [x] Botón flotante en todas las páginas
- [x] Ventana de chat con historial
- [x] Restricciones por rol (vecino solo pregunta sobre funciones de vecino)
- [x] Conocimiento completo de la plataforma
- [x] Guías paso a paso para cada función
- [x] Respuestas contextualizadas
- [x] Rechazo de preguntas fuera de alcance
- [x] Interfaz moderna y responsive

### 👥 Gestión de Directiva

- [x] CRUD completo de contactos de directiva
- [x] Cargos personalizables
- [x] Datos de contacto (email, teléfono)
- [x] Orden de visualización
- [x] Activar/desactivar contactos
- [x] Vista pública en landing page

### 📊 Panel Administrativo

- [x] Dashboard con métricas globales
- [x] Estadísticas de usuarios, solicitudes, proyectos, reservas
- [x] Gestión completa de usuarios
- [x] Edición de roles y estados
- [x] Sistema de logs de actividad
- [x] Filtros avanzados en logs (acción, entidad, fecha, búsqueda)
- [x] Paginación de logs
- [x] Estadísticas de logs
- [x] Generación de reportes
- [x] Configuración global del sistema
- [x] Visualización de actividad en tiempo real
- [x] Matriz de permisos por rol

### 👤 Gestión de Perfil

- [x] Edición de datos personales
- [x] Cambio de contraseña
- [x] Subida y cambio de foto de perfil
- [x] Optimización automática de imágenes
- [x] Preview de foto antes de guardar
- [x] Historial de actividad del usuario

### 🎨 Diseño y UX

- [x] Interfaz moderna con Bootstrap 5
- [x] Diseño 100% responsive
- [x] Bootstrap Icons en toda la aplicación (consistencia visual)
- [x] Paleta de colores profesional
- [x] Animaciones suaves
- [x] Estados de carga consistentes
- [x] Mensajes de error claros
- [x] Feedback visual en todas las acciones
- [x] Sidebar diferenciado por rol (Vecino, Secretaría, Admin)
- [x] Headers con información del usuario
- [x] Breadcrumbs y navegación clara

---

## 🗄️ Base de Datos

### Tablas Principales

#### `usuarios`
- **id** (UUID, PK) - Referencia a auth.users
- **email** (TEXT, UNIQUE)
- **rut** (TEXT, UNIQUE)
- **nombres**, **apellidos** (TEXT)
- **direccion**, **telefono** (TEXT)
- **latitude**, **longitude** (DOUBLE PRECISION) - Coordenadas
- **rol** (vecino | secretaria | admin)
- **estado** (pendiente_aprobacion | activo | rechazado | inactivo)
- **comprobante_url** (TEXT)
- **foto_url** (TEXT)
- **telegram_chat_id** (TEXT) - ID de chat de Telegram
- **whatsapp_phone** (TEXT) - Número de WhatsApp
- **whatsapp_opt_in** (BOOLEAN) - Consentimiento WhatsApp
- **preferencia_notificacion** (TEXT) - Canal preferido (email, telegram, whatsapp, combinaciones)
- **created_at**, **updated_at** (TIMESTAMP)

#### `solicitudes`
- **id** (UUID, PK)
- **usuario_id** (UUID, FK)
- **tipo** (certificado_residencia | certificado_antiguedad)
- **estado** (pendiente | en_proceso | completado | rechazado)
- **motivo**, **observaciones** (TEXT)
- **documento_url** (TEXT)
- **fecha_solicitud**, **fecha_respuesta** (TIMESTAMP)
- **atendido_por** (UUID, FK)

#### `noticias`
- **id** (UUID, PK)
- **titulo**, **contenido** (TEXT)
- **imagen_url** (TEXT)
- **autor_id** (UUID, FK)
- **created_at**, **updated_at** (TIMESTAMP)

#### `noticias_reacciones`
- **id** (UUID, PK)
- **noticia_id**, **usuario_id** (UUID, FK)
- **tipo_reaccion** (me_gusta | me_encanta | me_divierte | me_asombra | me_entristece | me_enoja | me_importa)
- **created_at** (TIMESTAMP)

#### `avisos`
- **id** (UUID, PK)
- **titulo**, **descripcion** (TEXT)
- **prioridad** (normal | importante | urgente)
- **fecha_inicio**, **fecha_fin** (DATE)
- **activo** (BOOLEAN)
- **imagen_url** (TEXT)
- **autor_id** (UUID, FK)

#### `actividades`
- **id** (UUID, PK)
- **titulo**, **descripcion** (TEXT)
- **fecha**, **hora**, **lugar** (TEXT)
- **cupos_disponibles**, **cupos_totales** (INTEGER)
- **imagen_url** (TEXT)
- **creador_id** (UUID, FK)
- **created_at**, **updated_at** (TIMESTAMP)

#### `proyectos`
- **id** (UUID, PK)
- **titulo**, **descripcion** (TEXT)
- **presupuesto** (DECIMAL)
- **num_beneficiarios** (INTEGER)
- **estado** (pendiente | aprobado | rechazado | en_ejecucion | completado)
- **creador_id**, **aprobador_id** (UUID, FK)
- **created_at**, **updated_at** (TIMESTAMP)

#### `proyectos_adjuntos`
- **id** (UUID, PK)
- **proyecto_id** (UUID, FK)
- **nombre_archivo**, **url**, **tipo** (TEXT)
- **tamano** (BIGINT)

#### `reservas`
- **id** (UUID, PK)
- **espacio_id**, **solicitante_id** (UUID, FK)
- **fecha_reserva** (DATE)
- **bloque_horario** (manana | tarde | noche | dia_completo)
- **estado** (pendiente | aprobada | rechazada | cancelada | completada)
- **motivo**, **motivo_rechazo** (TEXT)
- **num_asistentes** (INTEGER)
- **aprobador_id** (UUID, FK)

#### `directiva_contactos`
- **id** (UUID, PK)
- **cargo**, **nombre_completo** (TEXT)
- **email**, **telefono** (TEXT)
- **orden** (INTEGER)
- **activo** (BOOLEAN)

#### `configuracion_organizacion`
- **id** (UUID, PK)
- **numero_unidad_vecinal** (INTEGER)
- **nombre_organizacion**, **comuna**, **region** (TEXT)
- **direccion**, **telefono**, **email** (TEXT)
- **nombre_presidente**, **cargo_presidente** (TEXT)
- **rut_organizacion** (TEXT)
- **fecha_constitucion** (DATE)

#### `logs_actividad`
- **id** (UUID, PK)
- **usuario_id** (UUID, FK)
- **accion** (login | logout | crear | editar | eliminar | cambiar_rol | cambiar_estado)
- **entidad** (sistema | usuario | solicitud | noticia | proyecto | reserva | actividad)
- **entidad_id** (UUID)
- **detalles** (JSONB)
- **created_at** (TIMESTAMP)

### Storage Buckets

- **documentos**
  - `/comprobantes/{user_id}/` - Comprobantes de residencia
  - `/certificados/{user_id}/` - Certificados generados
  - `/fotos-perfil/{user_id}/` - Fotos de perfil

- **noticias**
  - `/{noticia_id}/` - Imágenes de noticias

- **avisos**
  - `/{aviso_id}/` - Imágenes de avisos

- **actividades**
  - `/{actividad_id}/` - Imágenes de actividades

- **proyectos-adjuntos**
  - `/{proyecto_id}/` - Documentos adjuntos de proyectos

### Row Level Security (RLS)

- ✅ Políticas habilitadas en todas las tablas
- ✅ Vecinos solo ven sus propios datos
- ✅ Secretaría y Admin ven todos los datos
- ✅ Políticas granulares por operación (SELECT, INSERT, UPDATE, DELETE)
- ✅ Validación de roles en políticas
- ✅ Protección de datos sensibles

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo en http://localhost:3000

# Producción
npm run build        # Build optimizado para producción
npm start            # Servidor de producción

# Utilidades
npm install          # Instalar dependencias
```

---

## 🎨 Paleta de Colores

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

## 🚀 Deployment

### Variables de Entorno en Producción

```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
EMAIL_SERVICE_ENABLED=true
TELEGRAM_BOT_TOKEN=...
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_API_VERSION=v18.0
NEXT_PUBLIC_WHATSAPP_NUMBER=+56...
OPENAI_API_KEY=...
OPENAI_CHAT_MODEL=gpt-4o-mini
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

### Plataformas Recomendadas

- **Vercel** - Deploy automático desde Git (recomendado para Next.js)
- **Netlify** - Alternativa con CI/CD integrado
- **Railway** - Deploy con bases de datos incluidas
- **DigitalOcean App Platform** - Más control sobre infraestructura

---

## 🐛 Troubleshooting

Ver documentación completa en el archivo original. Problemas comunes cubiertos:
- Errores de API key
- Problemas de subida de archivos
- Usuarios pendientes de aprobación
- Loops de redirección
- Envío de correos
- Timeout de sesión

---

## 🤝 Contribución

Proyecto académico. Para contribuir:
1. Fork del proyecto
2. Crear rama (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit (`git commit -m 'Add: descripción'`)
4. Push (`git push origin feature/NuevaFuncionalidad`)
5. Pull Request

---

## 📄 Licencia

Proyecto de uso académico y educativo.

---

## 👨‍💻 Autor

Proyecto desarrollado como parte del proyecto Capstone semestral.

---

**Última actualización:** Noviembre 2024 - v2.0 (Sistema de notificaciones multi-canal)
