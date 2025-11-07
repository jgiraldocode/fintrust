<template>
  <div class="min-h-screen gradient-bg relative overflow-hidden">
    <!-- Floating Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
      <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 container-mobile min-h-screen flex flex-col items-center justify-center py-12">
      <!-- Hero Section -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-6xl md:text-7xl font-bold mb-6 animate-slide-in-from-top">
          <span class="gradient-text">Juego de Preguntas</span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-700 mb-4 animate-slide-in-from-bottom" style="animation-delay: 0.1s">
          Pon a prueba tu conocimiento con preguntas interactivas basadas en gráficos
        </p>
        <p class="text-lg text-gray-600 animate-slide-in-from-bottom" style="animation-delay: 0.2s">
          Desafíate y compite en la tabla de clasificación
        </p>
      </div>

      <!-- Main Card -->
      <div class="w-full max-w-md glass rounded-2xl p-8 shadow-2xl animate-zoom-in" style="animation-delay: 0.3s">
        <div class="space-y-4">
          <button
            @click="goToRegister"
            class="btn-primary w-full flex items-center justify-center gap-2 group"
          >
            <span>Comenzar</span>
            <span class="transform group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            @click="goToLeaderboard"
            class="btn-outline w-full flex items-center justify-center gap-2"
          >
            <span>🏆</span>
            <span>Ver Tabla de Clasificación</span>
          </button>

          <button
            @click="goToAdmin"
            class="btn-ghost w-full flex items-center justify-center gap-2 text-gray-700"
          >
            <span>🔧</span>
            <span>Panel de Administración</span>
          </button>
        </div>

        <!-- Stats or Info -->
        <div class="mt-8 pt-6 border-t border-gray-200/50">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-3xl font-bold gradient-text">∞</div>
              <div class="text-xs text-gray-600 mt-1">Preguntas</div>
            </div>
            <div>
              <div class="text-3xl font-bold gradient-text">📊</div>
              <div class="text-xs text-gray-600 mt-1">Gráficos</div>
            </div>
            <div>
              <div class="text-3xl font-bold gradient-text">🎯</div>
              <div class="text-xs text-gray-600 mt-1">Desafío</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl animate-fade-in" style="animation-delay: 0.5s">
        <div class="card-hover text-center">
          <div class="text-4xl mb-3">🔍</div>
          <h3 class="font-bold text-lg mb-2">Gráficos Interactivos</h3>
          <p class="text-sm text-gray-600">Visualiza y analiza conexiones de red</p>
        </div>

        <div class="card-hover text-center">
          <div class="text-4xl mb-3">📱</div>
          <h3 class="font-bold text-lg mb-2">Adaptado a Móviles</h3>
          <p class="text-sm text-gray-600">Juega en cualquier lugar y dispositivo</p>
        </div>

        <div class="card-hover text-center">
          <div class="text-4xl mb-3">🏅</div>
          <h3 class="font-bold text-lg mb-2">Clasificación en Tiempo Real</h3>
          <p class="text-sm text-gray-600">Compite con otros jugadores</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-16 text-center text-gray-600 text-sm animate-fade-in" style="animation-delay: 0.7s">
        <p>Hecho con ❤️ usando Vue.js y D3.js</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const goToRegister = () => {
  if (userStore.isAuthenticated) {
    router.push('/waiting')
  } else {
    router.push('/register')
  }
}

const goToLeaderboard = () => {
  router.push('/leaderboard')
}

const goToAdmin = () => {
  router.push('/admin')
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
