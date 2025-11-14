<template>
  <div class="container-mobile min-h-screen py-8">
    <div class="card text-center max-w-2xl mx-auto">
      <!-- Success/Try Again Message -->
      <div class="mb-8">
        <div v-if="isSuccess" class="text-6xl mb-4">🎉</div>
        <div v-else class="text-6xl mb-4">💪</div>

        <h2 class="text-4xl font-bold mb-4" :class="isSuccess ? 'text-green-600' : 'text-orange-600'">
          {{ isSuccess ? '¡Felicitaciones!' : '¡Buena Suerte la Próxima!' }}
        </h2>

        <div class="text-xl text-gray-600 px-4">
          <div class="flex items-center justify-center gap-1 flex-wrap">
            <span class="truncate max-w-[200px] md:max-w-xs">{{ userName }}</span>
            <span>, ¡has completado el cuestionario!</span>
          </div>
        </div>
      </div>

      <!-- Score Summary -->
      <div class="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl p-8 mb-8">
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-white rounded-lg p-6 shadow-md">
            <p class="text-gray-600 text-lg mb-2">Respuestas Correctas</p>
            <p class="text-5xl font-bold text-green-600">
              {{ score.correctAnswers }}
            </p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md">
            <p class="text-gray-600 text-lg mb-2">Total de Preguntas</p>
            <p class="text-5xl font-bold text-primary-600">
              {{ score.totalAnswers }}
            </p>
          </div>
        </div>

        <div class="mt-6 bg-white rounded-lg p-6 shadow-md">
          <p class="text-gray-600 text-lg mb-2">Porcentaje de Aciertos</p>
          <p class="text-5xl font-bold text-primary-700">
            {{ scorePercentage }}%
          </p>
        </div>
      </div>

      <!-- Encouraging Message -->
      <div class="bg-blue-50 rounded-lg p-6 mb-8">
        <p class="text-lg text-gray-700">
          {{ encouragementMessage }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-4">
        <button @click="viewLeaderboard" class="btn-primary w-full">
          Ver Tabla de Clasificación 🏆
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
import { getUserScore } from '@/api'

const router = useRouter()
const userStore = useUserStore()

const score = ref({
  totalAnswers: 0,
  correctAnswers: 0
})

const userName = computed(() => userStore.userName)

const scorePercentage = computed(() => {
  if (score.value.totalAnswers === 0) return 0
  return Math.round((score.value.correctAnswers / score.value.totalAnswers) * 100)
})

const isSuccess = computed(() => {
  return scorePercentage.value >= 50
})

const encouragementMessage = computed(() => {
  const percentage = scorePercentage.value

  if (percentage >= 90) {
    return "¡Desempeño sobresaliente! ¡Tienes una excelente comprensión de los patrones de grafos! 🌟"
  } else if (percentage >= 70) {
    return "¡Buen trabajo! ¡Demostraste fuertes habilidades analíticas! ¡Sigue así! 💪"
  } else if (percentage >= 50) {
    return "¡Buen esfuerzo! Vas por buen camino. ¡La práctica hace al maestro! 📈"
  } else {
    return "¡No te rindas! Revisa los patrones e inténtalo de nuevo. ¡Lo harás mejor la próxima vez! 🚀"
  }
})

onMounted(async () => {
  try {
    const response = await getUserScore(userStore.userId)
    score.value = response.data
  } catch (err) {
    console.error('Error fetching score:', err)
  }
})

const viewLeaderboard = () => {
  router.push('/leaderboard')
}

const goHome = () => {
  router.push('/')
}
</script>

