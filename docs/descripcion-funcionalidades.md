# Descripción funcional del sistema VecindApp

## Panorama general
VecindApp es una plataforma web construida sobre Next.js que centraliza la gestión vecinal de certificados de residencia y la administración de usuarios de una junta de vecinos. El `RootLayout` aplica estilos globales, carga Bootstrap y envuelve toda la aplicación en un `AuthProvider` para compartir el estado de autenticación de Supabase entre páginas.【F:app/layout.js†L1-L30】 La página pública inicial funciona como una landing con hero, mapa informativo, listado de capacidades y llamados a la acción para iniciar sesión o registrarse.【F:app/page.js†L5-L80】

El contexto de autenticación (`AuthContext`) gestiona el ciclo de vida de las sesiones de Supabase, expone operaciones de inicio/cierre de sesión, registro y carga de comprobantes de residencia, y mantiene sincronizado el perfil del usuario en la tabla `usuarios`.【F:contexts/AuthContext.jsx†L9-L206】 Un middleware de Next.js protege las rutas según rol, redirige a usuarios no autenticados hacia el login, impide que perfiles en espera accedan a secciones protegidas y encamina a cada rol a su dashboard correspondiente.【F:middleware.js†L4-L89】

## Flujo público y autenticación
- **Landing pública:** muestra el logo institucional, el mensaje de bienvenida y botones para autenticarse o crear cuenta. También incorpora un mapa estático de unidades vecinales y tarjetas de beneficios destacados para nuevos usuarios.【F:app/page.js†L7-L78】
- **Inicio de sesión:** formulario con campos de email y contraseña, botón para alternar la visibilidad de la contraseña, enlace a recuperación (placeholder) y mensajes de error. Al autenticarse, el middleware decide el dashboard de destino según el rol.【F:app/(auth)/login/page.js†L49-L126】【F:middleware.js†L16-L73】
- **Registro de vecinos:** formulario extenso que solicita nombres, apellidos, RUT, teléfono, email, dirección, contraseña (con confirmación y validaciones) y comprobante de residencia adjunto. Tras crear la cuenta se sube el comprobante al storage y se notifica que el perfil queda "pendiente de aprobación" antes de redirigir al login.【F:app/(auth)/register/page.js†L9-L316】【F:contexts/AuthContext.jsx†L95-L190】
- **Estado pendiente de aprobación:** pantalla específica para cuentas recién creadas que aún no fueron habilitadas por Secretaría. Explica el proceso y ofrece cerrar sesión o volver al inicio mientras esperan la notificación de aprobación.【F:app/pendiente-aprobacion/page.js†L6-L48】【F:middleware.js†L27-L33】

## Navegación y layouts por rol
El encabezado principal identifica al usuario autenticado, muestra una insignia visual del rol (Vecino, Secretaría o Admin) y entrega acceso al cierre de sesión. Usuarios no autenticados ven botones para iniciar sesión o registrarse.【F:components/layout/Header.jsx†L6-L105】 Cada rol cuenta con un layout con sidebar y rutas destacadas:
- **Vecinos:** layout con `Header` y `Sidebar` específico para accesos directos a dashboard, solicitudes, creación de nuevas solicitudes, perfil y mapa comunitario.【F:app/(vecino)/layout.js†L1-L24】【F:components/layout/Sidebar.jsx†L6-L45】
- **Secretaría:** layout análogo con sidebar orientado a revisar solicitudes, gestionar vecinos, aprobar registros y emitir certificados.【F:app/secretaria/layout.js†L1-L15】【F:components/layout/SecretariaSidebar.jsx†L6-L72】
- **Administración:** layout que reutiliza el `Header` y ofrece una barra lateral con accesos a dashboard global, solicitudes, usuarios y un futuro módulo de reportes.【F:app/admin/layout.js†L1-L16】【F:components/layout/AdminSidebar.jsx†L6-L52】

## Funcionalidades para vecinos (rol `vecino`)
### Dashboard
- Muestra tarjetas de resumen con totales de solicitudes, estados en proceso, completadas y pendientes (valores de ejemplo).【F:app/(vecino)/dashboard/page.js†L5-L119】
- Lista de actividad reciente con cambios relevantes y tiempos relativos para que el vecino siga el avance de sus trámites.【F:app/(vecino)/dashboard/page.js†L122-L153】
- Accesos rápidos para crear una nueva solicitud, revisar el historial y editar el perfil.【F:app/(vecino)/dashboard/page.js†L155-L177】

### Gestión de solicitudes
- Página con métricas rápidas (totales por estado), tabla con historial de solicitudes (ID con padding, tipo, descripción, fecha formateada, estado con badges) y acciones para ver detalle o descargar certificados completados.【F:app/(vecino)/solicitudes/page.js†L57-L160】
- Información adicional contextual con los tipos de certificados disponibles y tiempos estimados de procesamiento para guiar expectativas.【F:app/(vecino)/solicitudes/page.js†L164-L186】

### Perfil personal
- Formulario poblado con los datos del perfil de Supabase, con modo lectura por defecto y botón para editar. Permite cambiar nombres, apellidos, teléfono y dirección, con mensajes de estado y spinner al guardar.【F:app/(vecino)/perfil/page.js†L7-L244】
- Panel lateral con el estado de la cuenta (pendiente, activo, rechazado, inactivo), rol asignado, fecha de registro formateada y acceso al comprobante de residencia si fue cargado. Incluye botones para acciones futuras como cambiar contraseña, descargar datos o eliminar la cuenta.【F:app/(vecino)/perfil/page.js†L246-L312】

### Mapa comunitario
- Vista con mapa embebido de OpenStreetMap, indicador de ubicación actual y panel lateral con datos del vecino y listado filtrable de lugares cercanos (gobierno, salud, educación, seguridad).【F:app/(vecino)/mapa/page.js†L5-L172】
- Secciones complementarias con distancias y horarios de atención de servicios relevantes del barrio.【F:app/(vecino)/mapa/page.js†L176-L200】

## Funcionalidades para Secretaría (rol `secretaria`)
### Dashboard de Secretaría
- Estadísticas principales enfocadas en tareas operativas: vecinos pendientes de aprobación, solicitudes pendientes/en proceso, certificados emitidos y total de vecinos activos.【F:app/secretaria/dashboard/page.js†L6-L78】
- Tablas para aprobar rápidamente nuevos vecinos (con acciones aprobar/rechazar) y revisar solicitudes recientes con estados destacados.【F:app/secretaria/dashboard/page.js†L82-L164】
- Acciones rápidas que priorizan aprobar vecinos, atender solicitudes pendientes, emitir certificados y gestionar el padrón, mostrando badges con conteos cuando corresponda.【F:app/secretaria/dashboard/page.js†L166-L235】
- Recordatorios semanales y métricas operativas en tarjetas tipo "chart placeholder" que resumen la carga de trabajo y eventos próximos.【F:app/secretaria/dashboard/page.js†L237-L282】

### Módulos previstos en la navegación
El sidebar de Secretaría expone rutas para:
- Ver y filtrar solicitudes (`/secretaria/solicitudes` y `/secretaria/solicitudes/pendientes`).
- Gestionar vecinos activos y aprobar nuevos registros (`/secretaria/vecinos`, `/secretaria/vecinos/aprobaciones`).
- Emitir certificados (`/secretaria/certificados`).
Estas rutas aún no cuentan con páginas dedicadas en la rama `master`, por lo que representan futuros módulos funcionales.【F:components/layout/SecretariaSidebar.jsx†L12-L64】

## Funcionalidades para Administración (rol `admin`)
### Dashboard administrativo
- Indicadores globales de usuarios y solicitudes desglosados por estado, con mensajes de tendencia (ej. "+12 este mes").【F:app/admin/dashboard/page.js†L3-L70】
- Tabla de solicitudes recientes con enlace directo al detalle y badges de estado coloreadas.【F:app/admin/dashboard/page.js†L73-L116】
- Tarjetas de gráficas en construcción que anticipan visualizaciones de solicitudes por estado y actividad semanal.【F:app/admin/dashboard/page.js†L118-L141】

### Gestión integral de solicitudes
- Listado filtrable por estado con búsqueda por texto, métricas rápidas por estado y tabla con RUT, tipo y acciones para ver o procesar solicitudes pendientes.【F:app/admin/solicitudes/page.js†L6-L140】
- Vista de detalle que agrupa información del solicitante, metadatos de la solicitud, documentos adjuntos descargables y formulario para cambiar estado con comentario obligatorio. También conserva un historial cronológico de acciones.【F:app/admin/solicitudes/[id]/page.js†L6-L197】

### Administración de usuarios
- Tabla con búsqueda y filtro por estado, mostrando RUT, datos de contacto, conteo de solicitudes y estado (Activo/Inactivo). Incluye opción para exportar la lista y paginación (placeholder).【F:app/admin/usuarios/page.js†L6-L147】
- Detalle individual con posibilidad de editar datos personales, alternar el estado activo/inactivo, revisar historial de solicitudes y ejecutar acciones críticas como eliminar usuario o reiniciar contraseña.【F:app/admin/usuarios/[id]/page.js†L6-L247】

### Navegación complementaria
El sidebar administrativo también reserva un enlace a un módulo de "Reportes" y acceso al mapa público, lo que permite expandir capacidades analíticas sin mezclar responsabilidades con otros roles.【F:components/layout/AdminSidebar.jsx†L12-L50】

## Estados especiales y consideraciones de seguridad
- El middleware centraliza las reglas de acceso: usuarios no autenticados son redirigidos al login, las cuentas pendientes solo pueden ver la página de espera, y cada rol es conducido a sus rutas permitidas. Esto evita accesos cruzados entre vecino, Secretaría y Administración.【F:middleware.js†L16-L60】
- Los componentes de cabecera y sidebar muestran visualmente el rol actual, reforzando la identidad de cada usuario y facilitando el acceso a las secciones relevantes.【F:components/layout/Header.jsx†L55-L105】【F:components/layout/Sidebar.jsx†L12-L45】【F:components/layout/SecretariaSidebar.jsx†L12-L70】【F:components/layout/AdminSidebar.jsx†L12-L50】

## Datos simulados y próximos pasos
Las vistas muestran datos de ejemplo codificados (estadísticas, tablas y mapas) para ilustrar la interfaz final mientras se completa la integración con la base de datos. Al estar respaldadas por el `AuthContext` y las operaciones a Supabase, basta con reemplazar estos placeholders por consultas reales para llevar el sistema a producción.【F:app/(vecino)/dashboard/page.js†L4-L118】【F:app/secretaria/dashboard/page.js†L6-L235】【F:app/admin/dashboard/page.js†L4-L141】 El almacenamiento de comprobantes y la estructura de perfiles ya están listos para trabajar con datos reales mediante Supabase.【F:contexts/AuthContext.jsx†L95-L190】
