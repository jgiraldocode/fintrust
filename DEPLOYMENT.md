# 🚀 Guía de Despliegue

Esta guía te ayudará a desplegar la aplicación FinTrust Quiz en servicios gratuitos.

## 📋 Tabla de Contenidos

1. [Servicios Recomendados](#servicios-recomendados)
2. [Despliegue del Backend (Render.com)](#despliegue-del-backend)
3. [Despliegue del Frontend (Vercel)](#despliegue-del-frontend)
4. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
5. [Verificación](#verificación)

## 🌟 Servicios Recomendados

### Backend: **Render.com**
- ✅ Tier gratuito permanente
- ✅ Soporta Node.js + SQLite con almacenamiento persistente
- ✅ 750 horas/mes gratis
- ✅ Auto-deploy desde GitHub
- 🔗 [render.com](https://render.com)

### Frontend: **Vercel**
- ✅ Completamente gratuito para proyectos personales
- ✅ Optimizado para Vite/Vue
- ✅ CDN global ultra-rápido
- ✅ Auto-deploy desde GitHub
- 🔗 [vercel.com](https://vercel.com)

## 📦 Despliegue del Backend

### Paso 1: Preparación

1. Crea una cuenta en [Render.com](https://render.com)
2. Conecta tu repositorio de GitHub

### Paso 2: Crear Web Service

1. Click en "New +" → "Web Service"
2. Selecciona tu repositorio
3. Configura el servicio:
   - **Name**: `fintrust-backend` (o el nombre que prefieras)
   - **Region**: Elige la más cercana (Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Paso 3: Configurar Variables de Entorno

En la sección "Environment Variables", agrega:

```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-app.vercel.app
ADMIN_PASSWORD=tu-password-seguro
```

### Paso 4: Configurar Disco Persistente

1. En el dashboard de tu servicio, ve a "Disks"
2. Click "Add Disk"
3. Configura:
   - **Name**: `database`
   - **Mount Path**: `/opt/render/project/src/backend/database`
   - **Size**: 1 GB

### Paso 5: Deploy

Click en "Create Web Service" y espera a que termine el despliegue (~5 minutos).

Tu backend estará disponible en: `https://fintrust-backend.onrender.com`

## 🎨 Despliegue del Frontend

### Paso 1: Preparación

1. Crea una cuenta en [Vercel](https://vercel.com)
2. Instala Vercel CLI (opcional): `npm install -g vercel`

### Paso 2: Deploy desde GitHub

1. Click en "Add New..." → "Project"
2. Importa tu repositorio de GitHub
3. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Paso 3: Configurar Variables de Entorno

En "Environment Variables", agrega:

```
VITE_API_URL=https://fintrust-backend.onrender.com/api
VITE_APP_URL=https://tu-app.vercel.app
VITE_REGISTRATION_URL=https://tu-app.vercel.app/register
```

### Paso 4: Deploy

Click en "Deploy" y espera a que termine (~2 minutos).

Tu frontend estará disponible en: `https://tu-app.vercel.app`

## 🔧 Configuración de Variables de Entorno

### Backend (Render.com)

Navega a tu servicio → Environment → Agrega/Edita:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Ambiente de ejecución |
| `PORT` | `3000` | Puerto del servidor |
| `FRONTEND_URL` | URL de Vercel | Para configurar CORS |
| `ADMIN_PASSWORD` | Tu password | Contraseña del panel admin |

### Frontend (Vercel)

Navega a tu proyecto → Settings → Environment Variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_API_URL` | URL del backend + `/api` | URL de la API |
| `VITE_APP_URL` | URL de Vercel | URL de tu app |
| `VITE_REGISTRATION_URL` | URL de Vercel + `/register` | Para QR code |

**⚠️ Importante**: Después de cambiar variables de entorno:
- **Render**: El servicio se redesplegará automáticamente
- **Vercel**: Haz un nuevo deploy o activa "Redeploy"

## 🔍 Verificación

### 1. Verifica el Backend

Abre en tu navegador: `https://tu-backend.onrender.com/health`

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2025-01-13T10:30:00.000Z"
}
```

### 2. Verifica el Frontend

1. Abre tu app en Vercel
2. Intenta registrarte con un nombre
3. Verifica que el QR code funcione
4. Accede al panel admin con tu contraseña

### 3. Verifica CORS

Abre la consola del navegador (F12) y verifica que no haya errores de CORS.

## 🐛 Solución de Problemas

### Error: CORS Policy

**Problema**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solución**:
1. Verifica que `FRONTEND_URL` en Render coincida exactamente con tu URL de Vercel
2. Asegúrate de incluir `https://` (sin barra final)
3. Redespliega el backend después de cambiar variables

### Error: Database not persistent

**Problema**: Los datos se pierden después de cada deploy

**Solución**:
1. Verifica que el disco esté montado en `/opt/render/project/src/backend/database`
2. Confirma que el tamaño del disco sea > 0 GB
3. Revisa los logs para errores de escritura

### Error: 502 Bad Gateway en Render

**Problema**: El servicio no responde

**Solución**:
1. Revisa los logs en Render Dashboard
2. Verifica que `npm start` esté configurado correctamente
3. Confirma que el puerto sea 3000 (el que Render asigna automáticamente)

### Frontend no se conecta al Backend

**Problema**: Las peticiones fallan

**Solución**:
1. Verifica que `VITE_API_URL` incluya `/api` al final
2. Usa la URL completa con `https://`
3. Redespliega el frontend después de cambiar variables

## 💰 Límites del Tier Gratuito

### Render.com (Free Plan)
- 750 horas/mes
- El servicio "duerme" después de 15 minutos de inactividad
- Primera petición después de dormir tarda ~30 segundos
- 1 GB de almacenamiento para base de datos

### Vercel (Hobby Plan)
- 100 GB de ancho de banda/mes
- Despliegues ilimitados
- Sin límite de tiempo de actividad
- CDN global incluido

## 🔄 Auto-Deploy con GitHub

Ambos servicios soportan auto-deploy:

1. Haz cambios en tu código
2. Commit y push a GitHub
3. El deploy se inicia automáticamente

Para desactivar auto-deploy:
- **Render**: Settings → Auto-Deploy → Disable
- **Vercel**: Settings → Git → Disable

## 🎯 URLs de Ejemplo

Después del despliegue, tendrás:

- **Backend**: `https://fintrust-backend.onrender.com`
- **API Health**: `https://fintrust-backend.onrender.com/health`
- **Frontend**: `https://fintrust-quiz.vercel.app`
- **QR Code**: `https://fintrust-quiz.vercel.app/qr`
- **Admin Panel**: `https://fintrust-quiz.vercel.app/admin`

## 📝 Alternativas

Si necesitas más recursos, considera:

### Backend Alternatives:
- **Railway.app**: $5/mes con más recursos
- **Fly.io**: Free tier con límites diferentes
- **AWS Lightsail**: $3.50/mes (no gratuito pero muy barato)

### Frontend Alternatives:
- **Netlify**: Similar a Vercel, también gratuito
- **Cloudflare Pages**: Gratuito con CDN ultra-rápido
- **GitHub Pages**: Gratuito pero requiere configuración adicional

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs en Render/Vercel
2. Verifica las variables de entorno
3. Consulta la documentación oficial:
   - [Render Docs](https://render.com/docs)
   - [Vercel Docs](https://vercel.com/docs)

¡Buena suerte con tu despliegue! 🚀

