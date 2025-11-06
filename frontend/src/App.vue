<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { getGameState } from '@/api'

const gameStore = useGameStore()

// Check game state periodically
onMounted(() => {
  const checkGameState = async () => {
    try {
      const response = await getGameState()
      gameStore.setGameActive(response.data.isActive)
    } catch (error) {
      console.error('Error checking game state:', error)
    }
  }

  checkGameState()
  // Check every 5 seconds
  setInterval(checkGameState, 5000)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

