# VecindApp - Plataforma Vecinal

Plataforma web para la gestión de certificados de residencia y trámites vecinales, desarrollada con Next.js 14 (App Router).

## Descripción

VecindApp es una aplicación web moderna que permite a los residentes solicitar certificados de residencia, hacer seguimiento de sus solicitudes, y a los administradores gestionar usuarios y trámites de forma eficiente.

## Tecnologías

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** JavaScript
- **Estilos:** CSS + Bootstrap 5
- **Diseño:** Responsive Design

## Características

### Para Usuarios
- ✅ Registro con validación de datos
- ✅ Login seguro
- ✅ Dashboard personalizado con estadísticas
- ✅ Creación y seguimiento de solicitudes
- ✅ Gestión de perfil
- ✅ Visualización de historial de trámites

### Para Administradores
- ✅ Panel de administración completo
- ✅ Gestión de usuarios (ver, editar, activar/desactivar)
- ✅ Gestión de solicitudes (aprobar, rechazar, actualizar estado)
- ✅ Dashboard con métricas globales
- ✅ Visualización de estadísticas y reportes

### Páginas Públicas
- ✅ Landing page con mapa interactivo
- ✅ Información de contacto
- ✅ Formularios de registro y login

## Arquitectura Actual del Proyecto

```
nueva-pagina-vecindapp/
├── app/
│   ├── (auth)/              # Páginas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── admin/               # Panel de administración
│   │   ├── dashboard/
│   │   ├── solicitudes/
│   │   └── usuarios/
│   ├── dashboard/           # Dashboard de usuario
│   ├── solicitudes/         # Gestión de solicitudes (usuario)
│   ├── perfil/              # Perfil de usuario
│   ├── layout.js            # Layout principal
│   ├── page.js              # Landing page
│   └── globals.css          # Estilos globales
├── components/
│   └── layout/              # Componentes de layout
│       ├── Header.jsx
│       ├── Sidebar.jsx
│       ├── AdminSidebar.jsx
│       └── UserLayout.js
├── lib/                     # Utilidades y helpers (próximamente)
├── public/                  # Archivos estáticos
│   └── vencinapp.svg        # Logo de la aplicación
└── jsconfig.json            # Configuración de alias de importación
```

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd nueva-pagina-vecindapp
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## Rutas Principales

### Públicas
- `/` - Landing page
- `/login` - Iniciar sesión
- `/register` - Registro de usuarios

### Usuario
- `/dashboard` - Dashboard del usuario
- `/solicitudes` - Lista de solicitudes
- `/solicitudes/nueva` - Nueva solicitud
- `/solicitudes/[id]` - Detalle de solicitud
- `/perfil` - Perfil del usuario

### Admin
- `/admin/dashboard` - Dashboard administrativo
- `/admin/solicitudes` - Gestionar solicitudes
- `/admin/solicitudes/[id]` - Detalle de solicitud (admin)
- `/admin/usuarios` - Gestionar usuarios
- `/admin/usuarios/[id]` - Detalle de usuario

## Paleta de Colores

El proyecto utiliza una paleta de colores personalizada inspirada en diseño moderno:

```css
--bg: #d8e7eb        /* Fondo principal - Mist Blue */
--panel: #f4f8f9     /* Paneles/Cards - Soft Panel */
--muted: #bfd3d9     /* Bordes - Muted Slate */
--text: #154765      /* Texto principal - Deep Navy */
--sub: #439fa4       /* Subtítulos - Teal Highlight */
--accent: #439fa4    /* Accent primario - Teal */
--accent-2: #154765  /* Accent secundario - Navy */
--ok: #34d399        /* Éxito - Green */
--warn: #fbbf24      /* Advertencia - Yellow */
--err: #fb7185       /* Error - Red */
```

## Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm start        # Inicia el servidor de producción
```

## 📝 Estado Actual

### Completado
- Estructura de carpetas y routing con App Router
- Diseño responsive con Bootstrap 5
- Formularios de login y registro
- Dashboard de usuario y administrador
- Gestión de solicitudes (UI)
- Gestión de usuarios (UI)
- Sistema de navegación con sidebars
- Layouts diferenciados por rol

### Pendiente (Próximas Fases)
- Configuración de base de datos (Prisma + PostgreSQL)
- Sistema de autenticación (NextAuth.js)
- Middleware de protección de rutas
- API Routes para CRUD
- Integración con backend
- Sistema de notificaciones
- Subida de archivos
- Generación de certificados PDF

## 👥 Roles del Sistema

### Usuario Regular
- Ver sus propias solicitudes
- Crear nuevas solicitudes
- Actualizar perfil
- Ver historial de trámites

### Administrador
- Gestionar todos los usuarios
- Aprobar/rechazar solicitudes
- Ver estadísticas globales
- Actualizar estados de solicitudes
- Generar reportes

## Notas Importantes

- **Datos Mock:** Actualmente la aplicación usa datos hardcodeados (mock data) en cada página para demostración
- **Sin Autenticación:** Las rutas son accesibles sin login (se implementará en fase 2)
- **Sin Base de Datos:** Los formularios registran datos en consola (integración pendiente)

## Contribución

Proyecto desarrollado como parte del proyecto Capstone semestral.

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📜 Licencia

Este proyecto es de uso académico.

---

**Última actualización:** Octubre 2025
