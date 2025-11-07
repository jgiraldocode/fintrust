<template>
  <div class="min-h-screen gradient-bg relative overflow-hidden">
    <!-- Floating Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-10 right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-10 left-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
    </div>

    <div class="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <div class="w-full max-w-5xl">
        <!-- Desktop: Side-by-side layout, Mobile: Stacked -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <!-- QR Code Section -->
          <div class="order-2 md:order-1 animate-slide-in-from-left">
            <div class="glass rounded-2xl p-8 text-center">
              <h2 class="text-2xl font-bold mb-4 gradient-text">
                Escanea para Unirte
              </h2>
              <p class="text-gray-700 mb-6">
                Usa la cámara de tu celular para escanear este código QR
              </p>

              <div class="bg-white p-6 rounded-xl inline-block shadow-lg animate-pulse-glow">
                <canvas ref="qrcodeCanvas" class="mx-auto"></canvas>
              </div>

              <div class="mt-6 flex items-center gap-2 justify-center text-sm text-gray-600">
                <span>📱</span>
                <span>Registro rápido mediante código QR</span>
              </div>
            </div>
          </div>

          <!-- Registration Form -->
          <div class="order-1 md:order-2 animate-slide-in-from-right">
            <div class="glass rounded-2xl p-8 shadow-2xl">
              <div class="mb-8">
                <h2 class="text-3xl font-bold mb-2">
                  <span class="gradient-text">¡Bienvenido! 👋</span>
                </h2>
                <p class="text-gray-700">
                  Ingresa tu nombre para comenzar a jugar
                </p>
              </div>

              <form @submit.prevent="handleRegister" class="space-y-6">
                <div>
                  <label for="name" class="block text-lg font-medium text-gray-900 mb-2">
                    Tu Nombre <span class="text-destructive">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="name"
                      v-model="name"
                      type="text"
                      required
                      class="input"
                      placeholder="Ingresa tu nombre completo"
                      :disabled="loading"
                    />
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">
                      👤
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  :disabled="loading || !name.trim()"
                  class="btn-primary w-full flex items-center justify-center gap-2 group"
                >
                  <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  <span v-else>
                    <span>Registrarse Ahora</span>
                    <span class="inline-block transform group-hover:translate-x-1 transition-transform ml-2">→</span>
                  </span>
                </button>
              </form>

              <!-- Error Message -->
              <div v-if="error" class="alert-error mt-6 animate-slide-in-from-bottom">
                <p>{{ error }}</p>
              </div>

              <!-- Back Button -->
              <div class="mt-6 text-center">
                <button
                  @click="goHome"
                  class="text-primary hover:underline flex items-center gap-2 mx-auto group"
                >
                  <span class="transform group-hover:-translate-x-1 transition-transform">←</span>
                  <span>Volver al Inicio</span>
                </button>
              </div>

              <!-- Info Cards -->
              <div class="mt-8 grid grid-cols-2 gap-4">
                <div class="bg-primary-50 rounded-lg p-4 text-center">
                  <div class="text-2xl mb-1">⚡</div>
                  <div class="text-sm font-medium text-gray-700">Rápido</div>
                  <div class="text-xs text-gray-600">Configuración rápida</div>
                </div>
                <div class="bg-purple-50 rounded-lg p-4 text-center">
                  <div class="text-2xl mb-1">🎮</div>
                  <div class="text-sm font-medium text-gray-700">Divertido</div>
                  <div class="text-xs text-gray-600">Interactivo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { registerUser } from '@/api'
import QRCode from 'qrcode'

const router = useRouter()
const userStore = useUserStore()

const name = ref('')
const loading = ref(false)
const error = ref('')
const qrcodeCanvas = ref(null)

onMounted(async () => {
  // Generate QR code with the registration URL
  const registrationUrl = window.location.origin + '/register'
  try {
    await QRCode.toCanvas(qrcodeCanvas.value, registrationUrl, {
      width: 220,
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

const handleRegister = async () => {
  if (!name.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    const response = await registerUser(name.value.trim())
    userStore.setUser(response.data.id, response.data.name)

    // Success animation before redirect
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push('/waiting')
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo registrar. Por favor intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

const goHome = () => {
  router.push('/')
}
</script>
