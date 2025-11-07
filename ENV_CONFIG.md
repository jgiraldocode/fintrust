# Environment Configuration Guide

## Overview

The application is now configured to use environment variables for URLs, making it easy to deploy to different environments (development, staging, production).

## Changes Made

### 1. Separated QR and Registration Views

**Before:**
- `/register` - Had both QR code and registration form

**Now:**
- `/qr` - Dedicated QR code display page
- `/register` - Clean registration form only

### 2. Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# frontend/.env
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000/api
```

For production, create `.env.production`:

```bash
# frontend/.env.production
VITE_APP_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com/api
```

### 3. Configuration Module

A new configuration module at `frontend/src/config/env.js` centralizes all environment variables:

```javascript
import config from '@/config/env'

// Access URLs
config.appUrl          // Base application URL
config.apiUrl          // Backend API URL
config.registrationUrl // Full registration URL (used in QR)
```

## Usage Examples

### In QR View
```javascript
import config from '@/config/env'

// QR code will use config.registrationUrl
// Example: http://localhost:5173/register (dev)
// Example: https://your-domain.com/register (prod)
```

### In API Calls
```javascript
import config from '@/config/env'

fetch(`${config.apiUrl}/questions`)
```

## Deployment Instructions

### Development
1. Create `frontend/.env`:
   ```
   VITE_APP_URL=http://localhost:5173
   VITE_API_URL=http://localhost:3000/api
   ```
2. Run: `npm run dev`
3. QR code will point to `http://localhost:5173/register`

### Production (Generic)
1. Set environment variables in your hosting platform:
   ```
   VITE_APP_URL=https://your-domain.com
   VITE_API_URL=https://api.your-domain.com/api
   ```
2. Build: `npm run build`
3. QR code will point to `https://your-domain.com/register`

### Production (Vercel)
In Vercel project settings → Environment Variables:
```
VITE_APP_URL=https://your-app.vercel.app
VITE_API_URL=https://your-api.com/api
```

### Production (Netlify)
In Netlify site settings → Build & deploy → Environment:
```
VITE_APP_URL=https://your-app.netlify.app
VITE_API_URL=https://your-api.com/api
```

## Testing

1. **Test QR Code URL:**
   ```bash
   # Update .env
   VITE_APP_URL=http://192.168.1.100:5173

   # Restart server
   npm run dev

   # Visit http://localhost:5173/qr
   # Scan QR with phone
   # Should open http://192.168.1.100:5173/register
   ```

2. **Test Different Environments:**
   ```bash
   # Development
   npm run dev  # Uses .env

   # Production build
   npm run build  # Uses .env.production
   npm run preview
   ```

## Route Structure

```
/ (Home)
  ├─ /qr (QR Code Display)
  │   └─ [Scan leads to] /register
  │
  ├─ /register (Registration Form)
  │   └─ /waiting (After registration)
  │       └─ /game (When game starts)
  │
  ├─ /leaderboard (Rankings)
  └─ /admin (Admin Panel)
```

## User Flows

### Desktop User
1. Visit home page
2. Click "Comenzar"
3. See QR code page
4. Can click "Ir al Registro Manual" → Registration form

### Mobile User (Scan QR)
1. Scan QR code from another screen/device
2. Directly lands on registration form
3. Register and play

### Mobile User (Direct)
1. Visit home page
2. Click "Comenzar"
3. See QR code (optional)
4. Click "Ir al Registro Manual"
5. Register and play

## Fallback Behavior

If environment variables are not set:
- `VITE_APP_URL` defaults to `window.location.origin`
- `VITE_API_URL` defaults to `http://localhost:3000/api`

This ensures the app works even without explicit configuration in development.

## Important Notes

1. **Restart Required:** Changes to `.env` files require restarting the dev server
2. **Git Ignore:** `.env` and `.env.local` are git-ignored
3. **Prefix Required:** All Vite env vars must start with `VITE_`
4. **Build Time:** Env vars are embedded at build time, not runtime
5. **Security:** Never commit sensitive values to `.env.example`

## Troubleshooting

### QR code shows wrong URL
- Check `VITE_APP_URL` in `.env`
- Restart dev server: `Ctrl+C` then `npm run dev`
- Clear browser cache

### API calls fail
- Verify `VITE_API_URL` points to running backend
- Check backend server is running: `cd backend && npm start`
- Check CORS settings in backend

### Build fails
- Ensure all required env vars are set
- Check for typos in variable names
- Verify `.env.production` exists for production builds

## Additional Resources

- See `frontend/ENV_SETUP.md` for detailed setup instructions
- See `frontend/src/config/env.js` for configuration implementation
- Vite env docs: https://vitejs.dev/guide/env-and-mode.html

