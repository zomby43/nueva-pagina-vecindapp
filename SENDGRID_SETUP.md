# 🚀 Guía Rápida: Configurar SendGrid para VecindApp

## Paso 1: Crear Cuenta en SendGrid

1. Ve a https://sendgrid.com/
2. Haz clic en "Start for Free" o "Sign Up"
3. Completa el formulario de registro
4. Verifica tu email

## Paso 2: Obtener tu API Key

1. **Inicia sesión** en SendGrid
2. Ve a **Settings** → **API Keys** (en el menú lateral izquierdo)
3. Haz clic en **"Create API Key"**
4. Configura:
   - **API Key Name**: `VecindApp` (o el nombre que prefieras)
   - **API Key Permissions**: Selecciona **"Full Access"** (o al menos "Mail Send")
5. Haz clic en **"Create & View"**
6. **¡IMPORTANTE!** Copia la API Key que aparece (solo se muestra una vez)
   - Se verá algo así: `SG.xxxxxxxxxxxx...`

## Paso 3: Verificar tu Email de Remitente

SendGrid requiere que verifiques el email desde el cual enviarás correos:

### Opción A: Single Sender Verification (Más Fácil - Recomendado para empezar)

1. Ve a **Settings** → **Sender Authentication**
2. Haz clic en **"Verify a Single Sender"**
3. Completa el formulario:
   - **From Name**: VecindApp - Junta de Vecinos
   - **From Email Address**: tu-email@gmail.com (o el email que uses)
   - **Reply To**: el mismo email o uno diferente
   - **Company Address**: Dirección de tu junta de vecinos
   - **City, State, Zip, Country**: Completa los datos
4. Haz clic en **"Create"**
5. **Verifica tu email**: SendGrid te enviará un correo de verificación
6. Haz clic en el link del correo para verificar

### Opción B: Domain Authentication (Para producción - Más profesional)

Si tienes un dominio propio (ej: `tujuntadevecinos.cl`):

1. Ve a **Settings** → **Sender Authentication**
2. Haz clic en **"Authenticate Your Domain"**
3. Sigue los pasos para agregar registros DNS
4. Podrás enviar desde emails como `noreply@tujuntadevecinos.cl`

## Paso 4: Configurar Variables de Entorno

1. Abre el archivo `.env.local` en tu proyecto VecindApp

2. Agrega las siguientes variables:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.tu_api_key_completa_aqui
SENDGRID_FROM_EMAIL=tu-email-verificado@gmail.com
EMAIL_SERVICE_ENABLED=true

# URL de tu sitio (para links en emails)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Reemplaza**:
   - `SG.tu_api_key_completa_aqui` → Tu API Key de SendGrid
   - `tu-email-verificado@gmail.com` → El email que verificaste en SendGrid

4. **Guarda** el archivo

## Paso 5: Reiniciar el Servidor

Para que Next.js cargue las nuevas variables de entorno:

```bash
# Detén el servidor (Ctrl + C)
# Luego ejecuta:
npm run dev
```

## Paso 6: Probar el Envío

1. **Regístrate** con un email real en `/register`
2. **Inicia sesión** como secretaría
3. Ve a **"Aprobar Vecinos"** (`/secretaria/vecinos/aprobaciones`)
4. **Aprueba** el usuario recién registrado
5. **¡Revisa tu email!** Deberías recibir el correo de aprobación

## 📧 Ejemplo de Configuración Completa en `.env.local`

```env
# Supabase (ya configurado)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# SendGrid - NUEVO
SENDGRID_API_KEY=SG.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
SENDGRID_FROM_EMAIL=contacto@tujuntadevecinos.cl
EMAIL_SERVICE_ENABLED=true

# URL del sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## ✅ Verificar que Funciona

### En la Terminal:

Cuando apruebes un usuario o solicitud, verás:
```
📧 Enviando correo a: usuario@example.com
📧 Asunto: ✅ ¡Tu registro en VecindApp ha sido aprobado!
✅ Correo enviado exitosamente a: usuario@example.com
```

### En SendGrid Dashboard:

1. Ve a **Activity** → **Email Activity**
2. Verás los correos enviados en tiempo real
3. Puedes ver si fueron entregados, abiertos, etc.

## ⚠️ Límites del Plan Gratuito

- **100 emails por día** (gratis para siempre)
- Puedes actualizar a plan pagado si necesitas más

## 🐛 Problemas Comunes

### Error: "API Key no configurado"
- ✅ Verifica que `SENDGRID_API_KEY` esté en `.env.local`
- ✅ Reinicia el servidor después de agregar variables

### Error: "Email de origen no verificado"
- ✅ Verifica el email en SendGrid (Single Sender)
- ✅ Usa exactamente el mismo email en `SENDGRID_FROM_EMAIL`

### Los correos van a spam
- ✅ Configura Domain Authentication (más adelante)
- ✅ No uses palabras como "gratis", "oferta" en asuntos
- ✅ Pide a destinatarios que agreguen tu email a contactos

### No llegan los correos
- ✅ Revisa "Email Activity" en SendGrid Dashboard
- ✅ Verifica la bandeja de spam del destinatario
- ✅ Asegúrate de que `EMAIL_SERVICE_ENABLED=true`

## 📱 Probar en Modo Desarrollo (sin gastar cuota)

Si quieres probar sin enviar correos reales:

```env
# Desactiva el envío real
EMAIL_SERVICE_ENABLED=false
```

Los correos se mostrarán en la consola del servidor.

## 🎯 ¡Listo!

Ahora VecindApp enviará correos reales cuando:
- ✅ Se apruebe un registro de vecino
- ✅ Se apruebe una solicitud de certificado
- ✅ Se rechace una solicitud

---

**¿Necesitas ayuda?** Revisa los logs de la terminal o el Email Activity de SendGrid.
