# 🚀 Guía Rápida de Despliegue

## Servicios Gratuitos Recomendados

### ✅ Mejor Combinación:

1. **Backend**: [Render.com](https://render.com) (Gratuito, soporta SQLite persistente)
2. **Frontend**: [Vercel](https://vercel.com) (Gratuito, optimizado para Vue/Vite)

---

## 📦 Paso 1: Desplegar Backend en Render.com

1. **Crear cuenta** en https://render.com
2. **Conectar GitHub** y seleccionar tu repositorio
3. **Crear Web Service**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

4. **Configurar Variables de Entorno**:
   ```
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://tu-app.vercel.app
   ADMIN_PASSWORD=tu-password-seguro
   ```

5. **Agregar Disco Persistente** (para SQLite):
   - Name: `database`
   - Mount Path: `/opt/render/project/src/backend/database`
   - Size: 1 GB

6. **Deploy** → Espera ~5 minutos

Tu backend estará en: `https://tu-backend.onrender.com`

---

## 🎨 Paso 2: Desplegar Frontend en Vercel

1. **Crear cuenta** en https://vercel.com
2. **Importar proyecto** desde GitHub
3. **Configurar**:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Variables de Entorno**:
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   VITE_APP_URL=https://tu-app.vercel.app
   VITE_REGISTRATION_URL=https://tu-app.vercel.app/register
   ```

5. **Deploy** → Espera ~2 minutos

Tu frontend estará en: `https://tu-app.vercel.app`

---

## 🔧 Paso 3: Actualizar CORS en Backend

1. Ve a Render.com → Tu servicio → Environment
2. **Actualiza `FRONTEND_URL`** con la URL real de Vercel
3. El servicio se redesplegará automáticamente

---

## ✅ Verificación

### Backend:
Abre: `https://tu-backend.onrender.com/health`

Deberías ver:
```json
{"status": "ok", "timestamp": "2025-01-13..."}
```

### Frontend:
1. Abre tu app de Vercel
2. Registra un usuario
3. Verifica que el QR funcione
4. Accede al admin panel

---

## 🎯 Alternativas Gratuitas

### Backend:
- **Railway.app** (500 horas/mes)
- **Fly.io** (3 VMs gratis)

### Frontend:
- **Netlify** (similar a Vercel)
- **Cloudflare Pages** (CDN ultra-rápido)

---

## 📝 Archivos de Configuración Incluidos

- ✅ `render.yaml` - Configuración automática para Render
- ✅ `vercel.json` - Configuración automática para Vercel
- ✅ `backend/.env.example` - Variables de entorno del backend
- ✅ `frontend/.env.example` - Variables de entorno del frontend
- ✅ CORS configurado correctamente en `backend/server.js`
- ✅ API URL dinámica en `frontend/src/api/index.js`

---

## 🐛 Problemas Comunes

### Error de CORS:
- Verifica que `FRONTEND_URL` en Render sea exactamente tu URL de Vercel
- Incluye `https://` sin barra final

### Base de datos no persiste:
- Verifica que el disco esté montado correctamente
- Path: `/opt/render/project/src/backend/database`

### Servicio 502 en Render:
- Revisa los logs en Render Dashboard
- Confirma que el puerto sea 3000

---

## 💡 Tips

1. **Auto-deploy**: Ambos servicios hacen deploy automático cuando haces push a GitHub
2. **Sleep mode**: Render duerme después de 15 min de inactividad (primera petición tarda ~30s)
3. **HTTPS**: Ambos servicios proveen HTTPS gratis automáticamente
4. **Custom domains**: Puedes agregar tu propio dominio en ambos servicios

---

Para más detalles, consulta `DEPLOYMENT.md` (guía completa).

¡Listo para producción! 🚀

