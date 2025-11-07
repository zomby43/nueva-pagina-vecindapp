# 📧 Configuración de Correos Electrónicos - VecindApp

Este documento explica cómo configurar el envío de correos electrónicos cuando se aprueban registros de usuarios o solicitudes de certificados.

## 🎯 Funcionalidades Implementadas

El sistema envía correos automáticos en las siguientes situaciones:

1. **Aprobación de Registro de Usuario**
   - Se envía cuando la secretaría aprueba un nuevo registro de vecino
   - Notifica al usuario que ya puede acceder a la plataforma

2. **Aprobación de Solicitud de Certificado**
   - Se envía cuando se aprueba una solicitud de certificado de residencia o antigüedad
   - Incluye enlace para descargar el certificado

3. **Rechazo de Solicitud**
   - Se envía cuando se rechaza una solicitud
   - Incluye el motivo del rechazo (si se proporcionó)

## 🔧 Modo Desarrollo (Actual)

Actualmente, el sistema está en **modo desarrollo**. Los correos no se envían realmente, pero se registran en la consola del servidor.

Para ver los correos en desarrollo:
1. Abre la terminal donde está corriendo `npm run dev`
2. Cuando apruebes un usuario o solicitud, verás el contenido del correo en la consola
3. Ejemplo:
```
📧 ========================================
📧 CORREO ELECTRÓNICO (Modo Desarrollo)
📧 ========================================
Para: usuario@example.com
Asunto: ✅ ¡Tu registro en VecindApp ha sido aprobado!
----------------------------------------
Hola Juan Pérez,

¡Tu registro en VecindApp ha sido aprobado!
...
📧 ========================================
```

## 🚀 Configuración para Producción

Para enviar correos reales en producción, elige una de las siguientes opciones:

### Opción 1: Resend (Recomendado) ⭐

Resend es fácil de configurar y ofrece 3,000 emails gratis por mes.

**Pasos:**

1. Crea una cuenta en https://resend.com

2. Instala el paquete:
```bash
npm install resend
```

3. Agrega tu API key en `.env.local`:
```env
RESEND_API_KEY=re_tu_api_key_aqui
EMAIL_SERVICE_ENABLED=true
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

4. Edita `app/api/emails/send/route.js` y descomenta la sección de Resend (líneas 63-85):
```javascript
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: 'VecindApp <noreply@tu-dominio.com>', // Usa tu dominio verificado
  to: [destinatario],
  subject: plantilla.asunto,
  html: plantilla.html,
  text: plantilla.texto,
});
```

5. Verifica tu dominio en Resend para enviar desde tu propio email

### Opción 2: Nodemailer (Gmail, Outlook)

Si prefieres usar Gmail u otro proveedor SMTP:

**Pasos:**

1. Instala nodemailer:
```bash
npm install nodemailer
```

2. Si usas Gmail, crea una "App Password":
   - Ve a tu cuenta de Google
   - Seguridad > Verificación en dos pasos
   - Contraseñas de aplicaciones
   - Genera una nueva contraseña

3. Agrega las credenciales en `.env.local`:
```env
EMAIL_SERVICE_ENABLED=true
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu_app_password_aqui
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

4. Edita `app/api/emails/send/route.js` y descomenta la sección de Nodemailer (líneas 90-116)

### Opción 3: SendGrid

SendGrid ofrece 100 emails gratis por día.

**Pasos:**

1. Crea una cuenta en https://sendgrid.com

2. Instala el paquete:
```bash
npm install @sendgrid/mail
```

3. Agrega tu API key en `.env.local`:
```env
SENDGRID_API_KEY=SG.tu_api_key_aqui
EMAIL_SERVICE_ENABLED=true
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

4. Agrega este código en `app/api/emails/send/route.js`:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: destinatario,
  from: 'noreply@tu-dominio.com', // Debe estar verificado en SendGrid
  subject: plantilla.asunto,
  text: plantilla.texto,
  html: plantilla.html,
};

await sgMail.send(msg);
```

## 📝 Personalización de Plantillas

Las plantillas de correo están en `lib/emails/templates.js`. Puedes personalizarlas editando:

- **Asunto**: Cambia el texto del asunto
- **HTML**: Modifica el diseño del correo
- **Texto plano**: Versión sin formato para clientes de email antiguos
- **Colores**: Los colores principales son `#154765` y `#439fa4`

## 🧪 Probar en Desarrollo

Para probar que los correos funcionan:

1. Crea un usuario de prueba registrándote en `/register`
2. Inicia sesión como secretaría
3. Ve a "Aprobar Vecinos" en `/secretaria/vecinos/aprobaciones`
4. Aprueba el usuario de prueba
5. Revisa la consola del servidor - verás el contenido del correo

## 📧 Archivos Relacionados

- `lib/emails/sendEmail.js` - Funciones para enviar correos
- `lib/emails/templates.js` - Plantillas de correos
- `app/api/emails/send/route.js` - API endpoint para envío
- `app/secretaria/vecinos/aprobaciones/page.js` - Aprobación de registros
- `app/secretaria/solicitudes/page.js` - Aprobación de solicitudes

## ⚠️ Notas Importantes

1. **Límites de Envío**: Respeta los límites del plan gratuito de tu proveedor
2. **SPF/DKIM**: Configura estos registros DNS para mejor entregabilidad
3. **Lista de Spam**: Evita enviar correos masivos no solicitados
4. **Variables de Entorno**: Nunca subas `.env.local` a Git

## 🔍 Troubleshooting

**Los correos no se envían:**
- Verifica que `EMAIL_SERVICE_ENABLED=true` en `.env.local`
- Revisa la consola del servidor para ver errores
- Confirma que las credenciales del servicio sean correctas

**Los correos van a spam:**
- Verifica tu dominio en el servicio de email
- Configura registros SPF y DKIM
- Evita palabras spam en el asunto

**Error de autenticación:**
- Si usas Gmail, asegúrate de usar App Password, no tu contraseña normal
- Verifica que la API key esté correcta

## 📞 Soporte

Si tienes problemas configurando los correos:
1. Revisa la documentación del proveedor (Resend, SendGrid, etc.)
2. Verifica los logs en la consola del servidor
3. Asegúrate de que las variables de entorno estén configuradas correctamente
