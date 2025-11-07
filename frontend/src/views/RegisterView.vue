<template>
  <div class="min-h-screen gradient-bg relative overflow-hidden">
    <!-- Floating Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-10 right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-10 left-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
    </div>

    <div class="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <div class="w-full max-w-md">
        <!-- Registration Form -->
        <div class="glass rounded-2xl p-8 shadow-2xl animate-zoom-in">
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
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { registerUser } from '@/api'

const router = useRouter()
const userStore = useUserStore()

const name = ref('')
const loading = ref(false)
const error = ref('')

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
