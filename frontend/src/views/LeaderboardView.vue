<template>
  <div class="container-mobile min-h-screen py-8">
    <div class="card max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-700 mb-2">
          🏆 Tabla de Clasificación
        </h1>
        <p class="text-xl text-gray-600">
          Los mejores jugadores del cuestionario
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-xl text-red-600 mb-4">{{ error }}</p>
        <button @click="loadLeaderboard" class="btn-primary">
          Intentar de Nuevo
        </button>
      </div>

      <div v-else>
        <!-- Current user highlight (if logged in) -->
        <div v-if="currentUserRank && userStore.isAuthenticated" class="bg-primary-50 border-2 border-primary-500 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <span class="text-3xl">👤</span>
              <div>
                <p class="text-lg font-bold text-primary-900">Tu Posición</p>
                <p class="text-2xl font-bold text-primary-700">
                  #{{ currentUserRank.rank }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-gray-600">Puntaje</p>
              <p class="text-2xl font-bold text-primary-700">
                {{ currentUserRank.correctAnswers }}/{{ currentUserRank.totalAnswers }}
              </p>
            </div>
          </div>
        </div>

        <!-- Leaderboard list -->
        <div class="space-y-3">
          <div
            v-for="(entry, index) in leaderboard"
            :key="entry.id"
            :class="[
              'rounded-lg p-4 transition-all',
              entry.id === userStore.userId
                ? 'bg-primary-100 border-2 border-primary-500'
                : 'bg-gray-50 hover:bg-gray-100'
            ]"
          >
            <div class="flex items-center justify-between">
              <!-- Rank and Name -->
              <div class="flex items-center gap-4 flex-1">
                <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl"
                     :class="getRankClass(entry.rank)">
                  {{ getRankIcon(entry.rank) }}
                </div>

                <div class="flex-1 min-w-0">
                  <p class="font-bold text-lg truncate" :class="entry.id === userStore.userId ? 'text-primary-900' : 'text-gray-900'">
                    {{ entry.name }}
                    <span v-if="entry.id === userStore.userId" class="text-sm text-primary-600">(Tú)</span>
                  </p>
                  <p class="text-sm text-gray-600">
                    Posición #{{ entry.rank }}
                  </p>
                </div>
              </div>

              <!-- Score -->
              <div class="text-right flex-shrink-0">
                <p class="text-2xl font-bold text-gray-900">
                  {{ entry.correctAnswers }}
                </p>
                <p class="text-sm text-gray-600">
                  / {{ entry.totalAnswers }} preguntas
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ Math.round(entry.score) }}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="leaderboard.length === 0" class="text-center py-12">
          <p class="text-xl text-gray-600">
            Aún no hay puntajes. ¡Sé el primero en jugar!
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-8 space-y-4">
        <button v-if="!userStore.isAuthenticated" @click="goToRegister" class="btn-primary w-full">
          Unirse al Juego
        </button>

        <button @click="refreshLeaderboard" class="btn-secondary w-full" :disabled="loading">
          {{ loading ? 'Actualizando...' : '🔄 Actualizar' }}
        </button>

        <button @click="goHome" class="btn-secondary w-full">
          Volver al Inicio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getLeaderboard } from '@/api'

const router = useRouter()
const userStore = useUserStore()

const leaderboard = ref([])
const loading = ref(true)
const error = ref('')

const currentUserRank = computed(() => {
  if (!userStore.userId) return null
  return leaderboard.value.find(entry => entry.id === userStore.userId)
})

const getRankClass = (rank) => {
  if (rank === 1) return 'bg-yellow-400 text-yellow-900'
  if (rank === 2) return 'bg-gray-300 text-gray-900'
  if (rank === 3) return 'bg-orange-400 text-orange-900'
  return 'bg-gray-200 text-gray-700'
}

const getRankIcon = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

const loadLeaderboard = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await getLeaderboard()
    leaderboard.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo cargar la tabla de clasificación.'
  } finally {
    loading.value = false
  }
}

const refreshLeaderboard = () => {
  loadLeaderboard()
}

const goToRegister = () => {
  router.push('/register')
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  loadLeaderboard()
})
</script>

