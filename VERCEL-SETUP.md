# 🚀 Configuración Completa para Vercel + Turso

## ✅ Archivos Ya Preparados

He configurado todo el código necesario. Los siguientes archivos ya están listos:

- ✅ `api/index.js` - Punto de entrada serverless
- ✅ `backend/database/db-turso.js` - Soporte dual SQLite/Turso
- ✅ `backend/server.js` - Actualizado para serverless
- ✅ `vercel.json` - Configuración de Vercel
- ✅ `package.json` - Script build:all

---

## 📦 Paso 1: Instalar Dependencias

Ejecuta estos comandos en tu terminal:

```bash
# Ir a la carpeta del proyecto
cd /Users/jgiraldo/Desktop/truora/2025/fintrust

# Instalar dependencia de Turso en backend
cd backend
npm install @libsql/client

# Volver a la raíz
cd ..
```

---

## 🌍 Paso 2: Configurar Turso (Base de Datos)

### 2.1 Instalar Turso CLI

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# O con Homebrew (macOS)
brew install tursodatabase/tap/turso
```

### 2.2 Crear cuenta y login

```bash
turso auth login
```

Esto abrirá tu navegador para autenticarte con GitHub.

### 2.3 Crear tu base de datos

```bash
# Crear la base de datos
turso db create fintrust-db

# Ver la URL de la base de datos (GUARDA ESTO)
turso db show fintrust-db --url

# Crear token de autenticación (GUARDA ESTO)
turso db tokens create fintrust-db
```

**📝 Anota estos valores**:
- `TURSO_DATABASE_URL`: algo como `libsql://fintrust-db-tu-usuario.turso.io`
- `TURSO_AUTH_TOKEN`: un token largo tipo `eyJ...`

### 2.4 Inicializar el esquema (Opcional)

Si quieres ver tu base de datos:

```bash
# Abrir shell de Turso
turso db shell fintrust-db

# Ver tablas (después del primer deploy se crearán automáticamente)
.tables

# Salir
.exit
```

---

## 🎨 Paso 3: Desplegar en Vercel

### 3.1 Opción A: Desde el Dashboard de Vercel (Recomendado)

1. Ve a [vercel.com](https://vercel.com) y haz login
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Selecciona tu repositorio de GitHub
5. Vercel detectará la configuración de `vercel.json` automáticamente

### 3.2 Configurar Variables de Entorno

Antes de hacer deploy, configura las variables en Vercel:

**Settings → Environment Variables → Add:**

```
TURSO_DATABASE_URL=libsql://fintrust-db-tu-usuario.turso.io
TURSO_AUTH_TOKEN=eyJ...tu-token-completo...
NODE_ENV=production
ADMIN_PASSWORD=tu-password-seguro-aqui
FRONTEND_URL=https://tu-proyecto.vercel.app
```

**⚠️ IMPORTANTE**: Para `FRONTEND_URL`, usa la URL que Vercel te asigne después del primer deploy, luego actualízala.

### 3.3 Deploy Inicial

1. Click "Deploy"
2. Espera ~2-3 minutos
3. Vercel te dará una URL como: `https://fintrust-abc123.vercel.app`

### 3.4 Actualizar FRONTEND_URL

1. Copia la URL que Vercel te asignó
2. Ve a Settings → Environment Variables
3. Edita `FRONTEND_URL` con la URL real
4. Click "Redeploy" para aplicar el cambio

---

## 3.5 Opción B: Desde CLI de Vercel (Alternativa)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (en la raíz del proyecto)
cd /Users/jgiraldo/Desktop/truora/2025/fintrust
vercel

# Seguir las instrucciones en pantalla
# Configurar las variables de entorno cuando te lo pida
```

---

## ✅ Paso 4: Verificación

### 4.1 Verificar Backend (API)

Abre en tu navegador:
```
https://tu-proyecto.vercel.app/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2025-01-13T..."
}
```

### 4.2 Verificar Frontend

Abre:
```
https://tu-proyecto.vercel.app
```

Deberías ver tu aplicación funcionando.

### 4.3 Verificar Base de Datos

```bash
# Ver datos en Turso
turso db shell fintrust-db

# Verificar que existan las tablas
.tables

# Ver usuarios (si registraste alguno)
SELECT * FROM users;

# Salir
.exit
```

---

## 🔄 Paso 5: Actualizar API URL en Frontend

### 5.1 Configurar Variable de Entorno en Vercel

En Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://tu-proyecto.vercel.app/api
```

### 5.2 Redeploy

Click en "Deployments" → "..." en el último deploy → "Redeploy"

---

## 🎯 URLs Finales

Después de completar todo, tendrás:

- **Frontend**: `https://tu-proyecto.vercel.app`
- **QR Code**: `https://tu-proyecto.vercel.app/qr`
- **Admin Panel**: `https://tu-proyecto.vercel.app/admin`
- **API Health**: `https://tu-proyecto.vercel.app/api/health`
- **API Base**: `https://tu-proyecto.vercel.app/api/*`

---

## 🐛 Solución de Problemas

### Error: "Module '@libsql/client' not found"

**Solución**: Instala la dependencia:
```bash
cd backend
npm install @libsql/client
git add .
git commit -m "Add Turso client"
git push
```

### Error: "TURSO_DATABASE_URL is not defined"

**Solución**:
1. Ve a Vercel Dashboard
2. Settings → Environment Variables
3. Verifica que `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` estén configuradas
4. Redeploy

### Error: CORS

**Solución**:
1. Verifica que `FRONTEND_URL` en Vercel sea exactamente tu URL de Vercel
2. Sin barra final: `https://tu-app.vercel.app` ✅
3. NO: `https://tu-app.vercel.app/` ❌

### Las tablas no se crean

**Solución**: Vercel ejecuta la inicialización en cada cold start. Haz una petición a `/api/health` y verifica los logs en Vercel Dashboard.

### Error 500 en producción

**Solución**:
1. Ve a Vercel Dashboard → Tu Proyecto → Functions
2. Click en una función para ver los logs
3. Busca el error específico

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
# Con Vercel CLI
vercel logs --follow
```

### Ver Logs en Dashboard

1. Vercel Dashboard
2. Tu Proyecto
3. "Functions" tab
4. Click en cualquier función para ver logs

### Ver Datos en Turso

```bash
# Conectar a tu DB
turso db shell fintrust-db

# Ver estadísticas
.stats

# Ver tablas y filas
.tables
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM scores;
```

---

## 💰 Límites del Tier Gratuito

### Vercel (Hobby Plan):
- ✅ 100 GB bandwidth/mes
- ✅ Serverless functions ilimitadas
- ✅ Suficiente para miles de usuarios
- ✅ Deploy ilimitados

### Turso (Starter):
- ✅ 500 bases de datos
- ✅ 1 millón de lecturas/mes
- ✅ Suficiente para ~1000-5000 usuarios activos
- ✅ Backups automáticos incluidos

---

## 🎉 ¡Listo!

Tu aplicación ahora está desplegada en:
- **Backend**: Vercel Serverless Functions
- **Frontend**: Vercel CDN Global
- **Base de Datos**: Turso (SQLite en Edge)

**Todo completamente GRATIS** 🚀

---

## 📚 Recursos

- [Turso Docs](https://docs.turso.tech)
- [Vercel Docs](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

¿Problemas? Revisa los logs en Vercel Dashboard o ejecuta `vercel logs`.

