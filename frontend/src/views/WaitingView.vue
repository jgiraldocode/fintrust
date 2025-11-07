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

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

let checkInterval = null

onMounted(() => {
  // Redirect to game if it's already active
  if (gameStore.isGameActive) {
    router.push('/game')
  }
})

// Watch for game state changes
watch(() => gameStore.isGameActive, (isActive) => {
  if (isActive) {
    router.push('/game')
  }
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>
