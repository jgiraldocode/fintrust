# Environment Variables Setup

This application uses environment variables to configure URLs for different environments (development, production).

## Files

- `.env.example` - Template with default development values
- `.env.local.example` - Template for local overrides
- `.env` - Active environment file (git ignored)
- `.env.local` - Local overrides (git ignored, highest priority)

## Variables

### `VITE_APP_URL`
The base URL where users access the application.

**Development:**
```
VITE_APP_URL=http://localhost:5173
```

**Production:**
```
VITE_APP_URL=https://your-domain.com
```

This URL is used for:
- Generating QR codes that link to the registration page
- Setting up proper redirects

### `VITE_API_URL`
The backend API base URL.

**Development:**
```
VITE_API_URL=http://localhost:3000/api
```

**Production:**
```
VITE_API_URL=https://api.your-domain.com/api
```

## Setup Instructions

### Development

1. The default `.env` file should work out of the box:
   ```bash
   VITE_APP_URL=http://localhost:5173
   VITE_API_URL=http://localhost:3000/api
   ```

2. If you need custom values, create `.env.local`:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your values
   ```

### Production

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.):
   ```
   VITE_APP_URL=https://your-production-domain.com
   VITE_API_URL=https://your-api-domain.com/api
   ```

2. Or create a `.env.production` file:
   ```bash
   VITE_APP_URL=https://your-production-domain.com
   VITE_API_URL=https://your-api-domain.com/api
   ```

## QR Code URL

The QR code in `/qr` route will automatically use `VITE_APP_URL` to generate the registration link. When users scan the QR code, they will be directed to:

```
{VITE_APP_URL}/register
```

## Important Notes

- Vite only exposes variables that start with `VITE_`
- Changes to `.env` files require restarting the dev server
- `.env.local` has the highest priority and overrides `.env`
- Never commit `.env` or `.env.local` to version control

## Testing

To test the QR code with different URLs:

1. Update `VITE_APP_URL` in `.env.local`
2. Restart the dev server: `npm run dev`
3. Visit `/qr` and scan the QR code
4. Verify it points to the correct URL

## Troubleshooting

If the QR code URL is incorrect:

1. Check the value of `VITE_APP_URL`:
   ```javascript
   console.log('App URL:', import.meta.env.VITE_APP_URL)
   ```

2. Ensure the dev server was restarted after changing `.env`

3. Clear browser cache if needed

4. If `VITE_APP_URL` is not set, it will fall back to `window.location.origin`

