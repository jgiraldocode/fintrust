<template>
  <div class="container-mobile min-h-screen flex flex-col items-center justify-center py-8">
    <div class="card w-full max-w-2xl">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-primary-700 mb-2">
          ¡Bienvenido, {{ userStore.userName }}! 👋
        </h2>
        <p class="text-xl text-gray-600">
          El juego comenzará pronto. Por favor espera...
        </p>
        <p v-if="gameStore.activeSection" class="text-lg text-green-600 font-bold mt-2">
          {{ gameStore.activeSection === 1 ? '🎯 Ronda 1' : '🎯 Ronda 2' }} activada - Redirigiendo...
        </p>
      </div>

      <!-- Loading animation -->
      <div class="flex justify-center mb-8">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>

      <!-- Educational content about graphs -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-6">
        <h3 class="text-2xl font-bold text-gray-800 mb-4">
          ¿Sabías que? 🤔
        </h3>

        <div class="space-y-4">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h4 class="font-bold text-lg text-primary-700 mb-2">
              ¿Qué son los Grafos de Conocimiento?
            </h4>
            <p class="text-gray-700 text-lg leading-relaxed">
              Los grafos de conocimiento son representaciones visuales que muestran cómo diferentes piezas de información se conectan entre sí. ¡Nos ayudan a entender las relaciones entre personas, lugares y cosas!
            </p>
          </div>

          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h4 class="font-bold text-lg text-primary-700 mb-2">
              Aplicaciones en el Mundo Real 🌍
            </h4>
            <p class="text-gray-700 text-lg leading-relaxed">
              Las empresas usan grafos para detectar fraude, recomendar productos y entender el comportamiento de los clientes. ¡Por ejemplo, las redes sociales usan grafos para sugerir amigos que podrías conocer basándose en conexiones compartidas!
            </p>
          </div>

          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h4 class="font-bold text-lg text-primary-700 mb-2">
              Entendiendo las Conexiones 🔗
            </h4>
            <p class="text-gray-700 text-lg leading-relaxed">
              En la verificación de identidad, los grafos ayudan a conectar teléfonos, correos electrónicos, direcciones y dispositivos con personas reales. ¡Esto facilita detectar patrones inusuales y mantener a todos seguros!
            </p>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center">
        <p class="text-gray-500 text-lg">
          Verificando estado del juego...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGameStore } from '@/stores/game'
import { getGameState } from '@/api'

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

let checkInterval = null

onMounted(() => {
  // Verify user is authenticated
  if (!userStore.userId) {
    console.log('Usuario no autenticado en waiting, redirigiendo a registro...')
    userStore.clearUser() // Clear any stale data
    router.push('/register')
    return
  }

  // Redirect to game if it's already active
  if (gameStore.activeSection !== null) {
    console.log('Game already active, redirecting to /game')
    router.push('/game')
    return
  }

  // Check game state periodically (only in waiting view)
  const checkGameState = async () => {
    try {
      const response = await getGameState()
      console.log('Game state response:', response.data)
      // Update store with active section (null or section number)
      gameStore.setActiveSection(response.data.activeSection)
      console.log('Active section updated to:', gameStore.activeSection)
    } catch (error) {
      console.error('Error checking game state:', error)
    }
  }

  // Initial check
  checkGameState()

  // Check every 2 seconds (reduced for better responsiveness)
  checkInterval = setInterval(checkGameState, 2000)
})

// Watch for game state changes - with deep and immediate options
watch(
  () => gameStore.activeSection,
  (newValue, oldValue) => {
    console.log('Watch triggered - Old:', oldValue, 'New:', newValue)
    if (newValue !== null && newValue !== undefined) {
      console.log('Section activated, redirecting to game...', newValue)
      setTimeout(() => {
        router.push('/game')
      }, 100) // Small delay to ensure state is fully updated
    }
  },
  { immediate: false, deep: false }
)

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>
