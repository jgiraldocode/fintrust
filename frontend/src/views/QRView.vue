<template>
  <div class="min-h-screen gradient-bg relative overflow-hidden">
    <!-- Floating Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-10 right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-10 left-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
    </div>

    <div class="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <div class="w-full max-w-2xl">
        <div class="glass rounded-2xl p-8 md:p-12 text-center animate-zoom-in">
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              <span class="gradient-text">Únete al Juego</span>
            </h1>
            <p class="text-lg md:text-xl text-gray-700">
              Escanea el código QR con tu celular para registrarte
            </p>
          </div>

          <!-- QR Code -->
          <div class="bg-white p-8 rounded-2xl inline-block shadow-2xl mb-8 animate-pulse-glow">
            <canvas ref="qrcodeCanvas" class="mx-auto"></canvas>
          </div>

          <!-- Instructions -->
          <div class="space-y-4 mb-8">
            <div class="flex items-start gap-4 text-left bg-white/50 rounded-lg p-4">
              <div class="text-3xl flex-shrink-0">📱</div>
              <div>
                <h3 class="font-bold text-lg mb-1">Paso 1</h3>
                <p class="text-gray-700">Abre la cámara de tu celular</p>
              </div>
            </div>

            <div class="flex items-start gap-4 text-left bg-white/50 rounded-lg p-4">
              <div class="text-3xl flex-shrink-0">📷</div>
              <div>
                <h3 class="font-bold text-lg mb-1">Paso 2</h3>
                <p class="text-gray-700">Enfoca el código QR</p>
              </div>
            </div>

            <div class="flex items-start gap-4 text-left bg-white/50 rounded-lg p-4">
              <div class="text-3xl flex-shrink-0">🎮</div>
              <div>
                <h3 class="font-bold text-lg mb-1">Paso 3</h3>
                <p class="text-gray-700">¡Regístrate y comienza a jugar!</p>
              </div>
            </div>
          </div>

          <!-- Alternative Link -->
          <div class="pt-6 border-t border-gray-200/50">
            <p class="text-gray-600 mb-4">¿No puedes escanear el código?</p>
            <button
              @click="goToRegister"
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>Ir al Registro Manual</span>
              <span>→</span>
            </button>
          </div>

          <!-- Back Button -->
          <div class="mt-8">
            <button
              @click="goHome"
              class="text-primary hover:underline flex items-center gap-2 mx-auto group"
            >
              <span class="transform group-hover:-translate-x-1 transition-transform">←</span>
              <span>Volver al Inicio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import config from '@/config/env'

const router = useRouter()
const qrcodeCanvas = ref(null)

onMounted(async () => {
  // Get the registration URL from config (uses VITE_APP_URL env variable)
  const registrationUrl = config.registrationUrl

  console.log('Generating QR code for:', registrationUrl)

  try {
    await QRCode.toCanvas(qrcodeCanvas.value, registrationUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0369a1',
        light: '#ffffff'
      }
    })
  } catch (err) {
    console.error('Error generating QR code:', err)
  }
})

const goToRegister = () => {
  router.push('/register')
}

const goHome = () => {
  router.push('/')
}
</script>

