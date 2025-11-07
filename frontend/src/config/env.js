/**
 * Environment configuration
 *
 * This file provides easy access to environment variables
 * and fallback values for development
 */

export const config = {
  // Base URL where the application is hosted
  // Used for generating QR codes and links
  appUrl: import.meta.env.VITE_APP_URL || window.location.origin,

  // Backend API URL
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',

  // Registration URL (used in QR codes)
  get registrationUrl() {
    return `${this.appUrl}/register`
  },

  // Helper to check if in development mode
  isDevelopment: import.meta.env.DEV,

  // Helper to check if in production mode
  isProduction: import.meta.env.PROD
}

// Log configuration in development
if (config.isDevelopment) {
  console.log('App Configuration:', {
    appUrl: config.appUrl,
    apiUrl: config.apiUrl,
    registrationUrl: config.registrationUrl,
    mode: 'development'
  })
}

export default config

