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

      <!-- Round Tabs -->
      <div class="flex justify-center gap-2 mb-6">
        <button
          @click="changeSection('combined')"
          class="px-4 py-2 rounded-lg font-medium transition-all"
          :class="selectedSection === 'combined' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          🏆 Total
        </button>
        <button
          @click="changeSection('1')"
          class="px-4 py-2 rounded-lg font-medium transition-all"
          :class="selectedSection === '1' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          🎯 Ronda 1
        </button>
        <button
          @click="changeSection('2')"
          class="px-4 py-2 rounded-lg font-medium transition-all"
          :class="selectedSection === '2' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          🎯 Ronda 2
        </button>
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
                <p v-if="entry.finishTime" class="text-xs text-gray-400 mt-1">
                  {{ formatDate(entry.finishTime) }}
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
const selectedSection = ref('combined')

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

const formatDate = (dateString) => {
  if (!dateString) return ''

  // SQLite returns dates without timezone info, treat them as UTC
  // If the date doesn't end with 'Z', add it to indicate UTC
  const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
  const date = new Date(utcDateString)
  const now = new Date()

  // Calculate difference using UTC timestamps (always accurate)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  // Format time in Bogotá timezone (America/Bogota = UTC-5)
  const timeStr = date.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  // Relative time with exact time for clarity
  if (diffMins < 1) return `Hace un momento (${timeStr})`
  if (diffMins < 60) return `Hace ${diffMins} min (${timeStr})`
  if (diffHours < 24) return `Hace ${diffHours}h (${timeStr})`
  if (diffDays === 0) return `Hoy ${timeStr}`
  if (diffDays === 1) return `Ayer ${timeStr}`

  // Absolute date with time for older dates (Bogotá time)
  return date.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const loadLeaderboard = async () => {
  loading.value = true
  error.value = ''

  try {
    const section = selectedSection.value === 'combined' ? 'combined' : selectedSection.value
    const response = await getLeaderboard(section)
    leaderboard.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo cargar la tabla de clasificación.'
  } finally {
    loading.value = false
  }
}

const changeSection = (section) => {
  selectedSection.value = section
  loadLeaderboard()
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

