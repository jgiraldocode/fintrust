# 🔐 Variables de Entorno

Este archivo contiene las plantillas para configurar las variables de entorno en producción.

## Backend (.env)

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (for CORS) - Reemplaza con tu URL de Vercel
FRONTEND_URL=https://your-frontend-app.vercel.app

# Admin Password - ¡CAMBIA ESTO!
ADMIN_PASSWORD=change-this-secure-password
```

### Variables de Entorno en Render.com:

Agrega estas variables en: Dashboard → Tu Servicio → Environment

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Ambiente de ejecución |
| `PORT` | `3000` | Puerto del servidor (automático en Render) |
| `FRONTEND_URL` | `https://tu-app.vercel.app` | URL del frontend para CORS |
| `ADMIN_PASSWORD` | `MiPassword2024!` | Contraseña del panel administrativo |

---

## Frontend (.env)

Crea un archivo `.env` en la carpeta `frontend/` con el siguiente contenido:

```bash
# API Configuration - Reemplaza con tu URL de Render
VITE_API_URL=https://your-backend-app.onrender.com/api

# App Configuration - Reemplaza con tu URL de Vercel
VITE_APP_URL=https://your-frontend-app.vercel.app
VITE_REGISTRATION_URL=https://your-frontend-app.vercel.app/register
```

### Variables de Entorno en Vercel:

Agrega estas variables en: Dashboard → Tu Proyecto → Settings → Environment Variables

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `VITE_API_URL` | `https://tu-backend.onrender.com/api` | URL completa de la API (incluye `/api`) |
| `VITE_APP_URL` | `https://tu-app.vercel.app` | URL base de tu aplicación |
| `VITE_REGISTRATION_URL` | `https://tu-app.vercel.app/register` | URL de registro para QR |

---

## ⚠️ Importante

### CORS Configuration

El backend está configurado para aceptar peticiones SOLO desde las URLs especificadas en `FRONTEND_URL`.

**Pasos críticos:**

1. Primero despliega el **frontend** en Vercel
2. Copia la URL que Vercel te asigna (ej: `https://fintrust-abc123.vercel.app`)
3. Usa esa URL exacta en `FRONTEND_URL` del backend
4. ⚠️ **SIN barra final**: `https://tu-app.vercel.app` (correcto)
5. ❌ **NO uses**: `https://tu-app.vercel.app/` (incorrecto)

### Desarrollo Local

Para desarrollo local, puedes usar estas variables:

**Backend (`backend/.env`):**
```bash
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_PASSWORD=admin123
```

**Frontend (`frontend/.env.local`):**
```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_URL=http://localhost:5173
VITE_REGISTRATION_URL=http://localhost:5173/register
```

---

## 🔒 Seguridad

### Nunca compartas:
- ❌ Archivos `.env` reales
- ❌ Tu `ADMIN_PASSWORD`
- ❌ Tokens o credenciales

### Sí puedes compartir:
- ✅ `.env.example` (valores de ejemplo)
- ✅ Este documento (ENV-TEMPLATE.md)
- ✅ URLs públicas de tu app

---

## 🔄 Cambiar Variables

### En Render:
1. Dashboard → Servicio → Environment
2. Edita la variable
3. Guarda → El servicio se redespliega automáticamente

### En Vercel:
1. Dashboard → Proyecto → Settings → Environment Variables
2. Edita la variable
3. Guarda → Haz click en "Redeploy" para aplicar cambios

---

## ✅ Verificación

Después de configurar las variables:

### 1. Backend Health Check:
```bash
curl https://tu-backend.onrender.com/health
```

Deberías ver:
```json
{"status":"ok","timestamp":"2025-01-13T..."}
```

### 2. Frontend API Connection:
Abre la consola del navegador (F12) en tu app y verifica que no haya errores de CORS o conexión.

### 3. Admin Panel:
1. Ve a: `https://tu-app.vercel.app/admin`
2. Ingresa tu `ADMIN_PASSWORD`
3. Deberías poder ver el panel administrativo

---

## 🆘 Troubleshooting

### Error: "Not allowed by CORS"
- Verifica que `FRONTEND_URL` en Render coincida EXACTAMENTE con tu URL de Vercel
- Incluye `https://` (protocolo)
- NO incluyas barra final `/`

### Error: "Network Error" o "Failed to fetch"
- Verifica que `VITE_API_URL` incluya `/api` al final
- Usa la URL completa con `https://`
- Confirma que el backend esté activo en Render

### Backend no inicia en Render
- Revisa los logs: Dashboard → Tu Servicio → Logs
- Verifica que todas las variables estén definidas
- Confirma que el disco esté montado correctamente

---

¿Necesitas ayuda? Consulta `DEPLOYMENT.md` para la guía completa. 🚀

