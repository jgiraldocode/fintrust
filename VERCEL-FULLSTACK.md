# 🚀 Desplegar TODO en Vercel (Backend + Frontend)

## ⚠️ Consideración Importante: SQLite en Serverless

Vercel usa **funciones serverless** (AWS Lambda) para el backend. Esto significa:

- ❌ **SQLite local NO funciona** en serverless
  - Las funciones son stateless (sin estado)
  - No hay sistema de archivos persistente
  - La base de datos se borraría después de cada ejecución

## ✅ Solución: Vercel + Turso (SQLite en la nube)

**Turso** es SQLite como servicio, diseñado específicamente para edge/serverless:
- ✅ **Completamente GRATIS** (hasta 500 DB, 1 millón de lecturas)
- ✅ **Compatible con SQLite** (mismo código, solo cambias la conexión)
- ✅ **Edge computing** (ultra-rápido desde cualquier parte)
- ✅ **No requiere reescribir tu código**
- 🔗 [turso.tech](https://turso.tech)

---

## 🎯 Arquitectura: Vercel + Turso

```
┌─────────────────────────────────────────┐
│         VERCEL (Todo en uno)           │
├─────────────────────────────────────────┤
│  Frontend (Static)                      │
│  └─ Vue.js + Vite                      │
│                                         │
│  Backend (Serverless Functions)         │
│  └─ /api/* endpoints                   │
│     └─ Express.js                      │
│                                         │
└────────────┬────────────────────────────┘
             │
             │ SQL over HTTP
             ▼
┌─────────────────────────────────────────┐
│        TURSO (SQLite en Edge)          │
│  └─ Base de datos persistente          │
└─────────────────────────────────────────┘
```

---

## 📦 Paso 1: Configurar Turso (Base de datos)

### 1.1 Crear cuenta e instalar CLI

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# O con Homebrew (macOS)
brew install tursodatabase/tap/turso

# Login
turso auth login
```

### 1.2 Crear base de datos

```bash
# Crear DB
turso db create fintrust-db

# Obtener URL de conexión
turso db show fintrust-db --url

# Crear token de autenticación
turso db tokens create fintrust-db
```

**Guarda estos valores** (los necesitarás después):
- `TURSO_DATABASE_URL`: URL de la base de datos
- `TURSO_AUTH_TOKEN`: Token de autenticación

### 1.3 Inicializar esquema (opcional - hacer localmente primero)

```bash
# Conectar a tu DB
turso db shell fintrust-db

# Ejecutar tu schema
# (copia el contenido de backend/database/db.js)
```

---

## 📝 Paso 2: Adaptar el Backend para Turso

Solo necesitas cambiar la conexión de SQLite. El resto del código queda IGUAL.

### 2.1 Instalar dependencias

```bash
cd backend
npm install @libsql/client
```

### 2.2 Actualizar `backend/database/db.js`

```javascript
// backend/database/db.js
const { createClient } = require('@libsql/client');

// Usar Turso en producción, SQLite local en desarrollo
const db = process.env.TURSO_DATABASE_URL
  ? createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : require('sqlite3').verbose().Database('./database/database.db');

const initialize = async () => {
  // Mismo código de inicialización que antes
  // Turso es compatible con SQLite, funciona igual

  const createTables = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      graph_json TEXT NOT NULL,
      question_text TEXT NOT NULL,
      options_json TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      correct_answers_json TEXT,
      allow_multiple_answers INTEGER DEFAULT 0,
      tip TEXT,
      section INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      section INTEGER NOT NULL,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS game_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      is_active INTEGER DEFAULT 0,
      active_section INTEGER DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  if (process.env.TURSO_DATABASE_URL) {
    // Turso (producción)
    await db.batch(createTables.split(';').filter(q => q.trim()), 'write');
    await db.execute('INSERT OR IGNORE INTO game_state (id, is_active, active_section) VALUES (1, 0, NULL)');
  } else {
    // SQLite local (desarrollo)
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.exec(createTables, (err) => {
          if (err) reject(err);
          else {
            db.run('INSERT OR IGNORE INTO game_state (id, is_active, active_section) VALUES (1, 0, NULL)',
              (err) => err ? reject(err) : resolve()
            );
          }
        });
      });
    });
  }
};

const getDb = () => db;

module.exports = {
  initialize,
  getDb
};
```

---

## 🎨 Paso 3: Configurar Vercel (Backend + Frontend juntos)

### 3.1 Crear `vercel.json` en la raíz del proyecto

```json
{
  "version": 2,
  "buildCommand": "npm run build:all",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm install && cd frontend && npm install && cd ../backend && npm install",
  "framework": null,
  "functions": {
    "backend/server.js": {
      "runtime": "nodejs18.x",
      "includeFiles": "backend/**"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/backend/server.js"
    },
    {
      "source": "/(.*)",
      "destination": "/frontend/dist/$1"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3.2 Actualizar `package.json` en la raíz

```json
{
  "name": "fintrust-fullstack",
  "version": "1.0.0",
  "scripts": {
    "build:all": "cd frontend && npm install && npm run build",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev"
  }
}
```

### 3.3 Adaptar el backend para Vercel Serverless

Crear `backend/api/index.js` (punto de entrada serverless):

```javascript
// backend/api/index.js
const app = require('../server');

// Vercel exporta el handler serverless
module.exports = app;
```

Modificar `backend/server.js` para NO hacer listen automáticamente:

```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database/db');

const app = express();

// Middleware y rutas (sin cambios)
app.use(cors(/* ... */));
app.use(bodyParser.json());
app.use('/api', require('./routes/user'));
app.use('/api', require('./routes/game'));
app.use('/api/admin', require('./routes/admin'));

// Solo iniciar servidor si NO está en Vercel
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  db.initialize().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
} else {
  // En Vercel, solo inicializar DB
  db.initialize().catch(err => {
    console.error('Failed to initialize database:', err);
  });
}

module.exports = app;
```

---

## 🚀 Paso 4: Desplegar en Vercel

### 4.1 Desde GitHub (Recomendado)

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará la configuración automáticamente

### 4.2 Agregar Variables de Entorno

En Vercel Dashboard → Tu Proyecto → Settings → Environment Variables:

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=tu-token-de-turso
NODE_ENV=production
ADMIN_PASSWORD=tu-password-seguro
FRONTEND_URL=https://tu-app.vercel.app
```

### 4.3 Deploy

Click "Deploy" → ¡Listo en ~2 minutos!

---

## ✅ Ventajas de Esta Arquitectura

### Todo en Vercel:
- ✅ **Un solo servicio** (más fácil de mantener)
- ✅ **Despliegue unificado** (un solo deploy para todo)
- ✅ **HTTPS automático** para backend y frontend
- ✅ **CDN global** para frontend
- ✅ **Edge functions** para backend (ultra-rápido)

### Turso como base de datos:
- ✅ **Gratis** (hasta 500 DB, 1M lecturas/mes)
- ✅ **Compatible con SQLite** (mismo código SQL)
- ✅ **Global edge** (baja latencia desde cualquier lugar)
- ✅ **Backups automáticos**
- ✅ **No requiere VPS** ni contenedores

---

## 💰 Costos

### Completamente GRATIS para proyectos pequeños:

**Vercel (Hobby Plan)**:
- Frontend: Ilimitado
- Serverless Functions: 100GB-hrs/mes
- 100 GB bandwidth/mes
- Suficiente para miles de usuarios

**Turso (Starter Plan)**:
- 500 bases de datos
- 1 millón de lecturas/mes
- Suficiente para ~1000-5000 usuarios activos

---

## 🔄 Comparación con Otras Opciones

| Característica | Vercel + Turso | Railway | Fly.io | Render |
|----------------|----------------|---------|--------|--------|
| Costo inicial | GRATIS | $5/mes | GRATIS | GRATIS |
| Setup | Muy fácil | Fácil | Medio | Fácil |
| SQLite persistente | ✅ (Turso) | ✅ | ✅ | ❌ |
| Siempre activo | ✅ | ✅ | ✅ | ⚠️ Duerme |
| Global CDN | ✅ | ❌ | ✅ | ❌ |
| Backups automáticos | ✅ | ⚠️ Manual | ⚠️ Manual | ❌ |
| Auto-scaling | ✅ | ✅ | ✅ | ❌ |

---

## 🎯 Recomendación Final

### Para tu caso (Quiz de Grafos):

**🥇 Opción 1: Vercel + Turso** (Lo que acabamos de explicar)
- ✅ Mejor para: Proyectos serverless, alcance global
- ✅ Ventaja: Todo en Vercel, edge computing
- ⚠️ Requiere: Migrar a conexión Turso (15 minutos)

**🥈 Opción 2: Railway.app**
- ✅ Mejor para: Mantener SQLite local sin cambios
- ✅ Ventaja: Cero cambios de código
- ⚠️ Costo: $5/mes (pero suficiente)

**🥉 Opción 3: Fly.io**
- ✅ Mejor para: Mayor control, múltiples regiones
- ✅ Ventaja: Tier gratuito generoso
- ⚠️ Complejidad: Requiere CLI y Docker

---

## 📋 Checklist para Vercel + Turso

- [ ] Crear cuenta en Turso
- [ ] Instalar Turso CLI
- [ ] Crear base de datos en Turso
- [ ] Obtener URL y Auth Token
- [ ] Instalar `@libsql/client` en backend
- [ ] Actualizar `backend/database/db.js`
- [ ] Crear `vercel.json` en raíz
- [ ] Adaptar `backend/server.js` para serverless
- [ ] Configurar variables de entorno en Vercel
- [ ] Deploy en Vercel
- [ ] Verificar endpoints
- [ ] ¡Disfrutar! 🎉

---

## 🆘 Soporte

**Turso Docs**: https://docs.turso.tech
**Vercel Docs**: https://vercel.com/docs

¿Prefieres esta opción o te vas con Railway/Fly.io? 🤔

