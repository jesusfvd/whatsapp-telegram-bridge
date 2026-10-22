# Despliegue en Vercel - WhatsApp-Telegram Bridge

## Variables de Entorno en Vercel

Después de desplegar, debes configurar estas variables en el dashboard de Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las siguientes variables:

```
WHATSAPP_VERIFY_TOKEN=proyecto_puente_beta_2026
TELEGRAM_BOT_TOKEN=8710225078:AAGBQDbyGuCUMlcji0QJ5aO8X7XLyTCx1Tk
TELEGRAM_CHAT_ID=-5330434982
PORT=3000
```

## URL del Webhook

Una vez desplegado, tu URL será algo como:
`https://tu-proyecto.vercel.app`

Configura en Meta Business Dashboard:
- Callback URL: `https://tu-proyecto.vercel.app/webhook`
- Verify Token: `proyecto_puente_beta_2026`

## Endpoints Disponibles

- GET `/` - Health check
- GET `/webhook` - Verificación de webhook de Meta
- POST `/webhook` - Recepción de mensajes de WhatsApp
