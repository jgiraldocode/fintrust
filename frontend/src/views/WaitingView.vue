<template>
  <div class="container-mobile min-h-screen flex flex-col items-center justify-center py-8">
    <div class="card w-full max-w-2xl">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-primary-700 mb-2">
          Welcome, {{ userStore.userName }}! 👋
        </h2>
        <p class="text-xl text-gray-600">
          The game will start soon. Please wait...
        </p>
      </div>

      <!-- Loading animation -->
      <div class="flex justify-center mb-8">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>

      <!-- Educational content about graphs -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-6">
        <h3 class="text-2xl font-bold text-gray-800 mb-4">
          Did You Know? 🤔
        </h3>

        <div class="space-y-4">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h4 class="font-bold text-lg text-primary-700 mb-2">
              What are Knowledge Graphs?
            </h4>
            <p class="text-gray-700 text-lg leading-relaxed">
              Knowledge graphs are visual representations that show how different pieces of information connect to each other. They help us understand relationships between people, places, and things!
            </p>
          </div>

          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h4 class="font-bold text-lg text-primary-700 mb-2">
              Real-World Applications 🌍
            </h4>
            <p class="text-gray-700 text-lg leading-relaxed">
              Companies use graphs to detect fraud, recommend products, and understand customer behavior. For example, social networks use graphs to suggest friends you might know based on shared connections!
            </p>
          </div>

          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h4 class="font-bold text-lg text-primary-700 mb-2">
              Understanding Connections 🔗
            </h4>
            <p class="text-gray-700 text-lg leading-relaxed">
              In identity verification, graphs help connect phones, emails, addresses, and devices to real people. This makes it easier to spot unusual patterns and keep everyone safe!
            </p>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center">
        <p class="text-gray-500 text-lg">
          Checking game status...
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

