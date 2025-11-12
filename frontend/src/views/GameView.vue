<template>
  <div class="container-mobile min-h-screen py-2 md:py-8">
    <!-- Tutorial Modal -->
    <GraphTutorial v-if="showTutorial" @close="showTutorial = false" />

    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
    </div>

    <div v-else-if="error" class="card">
      <div class="text-center">
        <p class="text-xl text-red-600 mb-4">{{ error }}</p>
        <button @click="goHome" class="btn-primary">
          Volver al Inicio
        </button>
      </div>
    </div>

    <!-- All questions completed message -->
    <div v-else-if="allQuestionsCompleted" class="card">
      <div class="text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-2xl md:text-3xl font-bold text-green-600 mb-4">
          ¡Felicidades!
        </h2>
        <p class="text-lg md:text-xl text-gray-700 mb-6">
          Ya has completado todas las preguntas disponibles.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button @click="router.push('/leaderboard')" class="btn-primary">
            📊 Ver Clasificación
          </button>
          <button @click="goHome" class="btn-secondary">
            🏠 Volver al Inicio
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="currentQuestion" class="space-y-3 md:space-y-4 relative">
      <!-- Indicador compacto de progreso - Flotante en la esquina inferior derecha (oculto durante tutorial) -->
      <div v-if="!showTutorial" class="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border-2 border-primary-300">
        <div class="flex items-center gap-2">
          <div class="text-xs font-semibold text-gray-600">
            <span class="text-primary-600 font-bold">{{ gameStore.currentQuestionIndex + 1 }}</span>/<span>{{ gameStore.questions.length }}</span>
          </div>
          <div class="h-4 w-px bg-gray-300"></div>
          <div class="text-sm font-bold text-primary-600">
            🏆 {{ correctAnswers }}
          </div>
        </div>
      </div>

      <!-- Graph visualization - Más grande en móvil -->
      <div class="card p-2 md:p-6">
        <NetworkGraph
          v-if="currentQuestion && currentQuestion.graphData"
          :key="currentQuestion.id"
          :graph-data="currentQuestion.graphData"
          :hide-controls="showTutorial"
        />
        <div v-else class="text-center py-12 text-gray-500">
          <p>No se pudo cargar el grafo</p>
        </div>
      </div>

      <!-- Question and options - Grande y legible en móvil -->
      <div class="card p-4 md:p-6">
        <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
          {{ currentQuestion.questionText }}
        </h3>

        <div class="space-y-3 md:space-y-4">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            @click="selectOption(index)"
            :disabled="answered"
            :class="[
              'w-full p-3 md:p-4 text-left rounded-lg border-2 transition-all text-base md:text-lg font-medium flex items-start gap-3',
              // Multiple answer logic
              currentQuestion.allowMultipleAnswers && answered && Array.isArray(answerResult?.correctAnswer) && answerResult.correctAnswer.includes(index) && selectedAnswers.includes(index)
                ? 'bg-green-100 border-green-500 text-green-800'
                : currentQuestion.allowMultipleAnswers && answered && selectedAnswers.includes(index) && !answerResult?.correctAnswer.includes(index)
                ? 'bg-red-100 border-red-500 text-red-800'
                : currentQuestion.allowMultipleAnswers && answered && answerResult?.correctAnswer.includes(index)
                ? 'bg-green-50 border-green-400 text-green-700'
                : currentQuestion.allowMultipleAnswers && selectedAnswers.includes(index) && !answered
                ? 'bg-primary-100 border-primary-500 text-primary-900'
                // Single answer logic
                : answered && index === selectedAnswer && answerResult?.isCorrect
                ? 'bg-green-100 border-green-500 text-green-800'
                : answered && index === selectedAnswer && !answerResult?.isCorrect
                ? 'bg-red-100 border-red-500 text-red-800'
                : answered && index === answerResult?.correctAnswer
                ? 'bg-green-50 border-green-400 text-green-700'
                : selectedAnswer === index && !answered
                ? 'bg-primary-100 border-primary-500 text-primary-900'
                : 'bg-white border-gray-300 hover:border-primary-500 hover:bg-primary-50 active:bg-primary-100'
            ]"
          >
            <span v-if="currentQuestion.allowMultipleAnswers" class="flex-shrink-0 mt-0.5">
              <span class="inline-flex items-center justify-center w-5 h-5 border-2 rounded"
                    :class="selectedAnswers.includes(index) ? 'bg-primary-600 border-primary-600' : 'border-gray-400'">
                <span v-if="selectedAnswers.includes(index)" class="text-white text-sm">✓</span>
              </span>
            </span>
            <div class="flex-1">
              <span class="font-bold mr-2">{{ String.fromCharCode(65 + index) }}.</span>
              {{ option }}
            </div>
          </button>
        </div>

        <!-- Botón Enviar -->
        <button
          v-if="!answered"
          @click="submitSelectedAnswer"
          class="btn-primary w-full mt-4 py-3 text-lg font-bold"
          :class="(selectedAnswer === null && selectedAnswers.length === 0) ? 'opacity-60' : ''"
        >
          📤 Enviar {{ currentQuestion.allowMultipleAnswers ? 'Respuestas' : 'Respuesta' }}
        </button>

        <!-- Answer feedback - Compacto en móvil -->
        <div v-if="answered && answerResult" class="mt-4 md:mt-6 p-3 md:p-4 rounded-lg" :class="answerResult.isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'">
          <div class="flex items-start gap-2 md:gap-3">
            <span class="text-2xl md:text-3xl">{{ answerResult.isCorrect ? '✅' : '❌' }}</span>
            <div class="flex-1">
              <p class="text-lg md:text-xl font-bold mb-1 md:mb-2" :class="answerResult.isCorrect ? 'text-green-800' : 'text-red-800'">
                {{ answerResult.isCorrect ? '¡Correcto!' : '¡Incorrecto!' }}
              </p>
              <p v-if="currentQuestion.allowMultipleAnswers && answerResult.score !== undefined" class="text-sm md:text-base text-gray-700 mb-2">
                <span class="font-semibold">🎯 Puntaje:</span> {{ Math.round(answerResult.score * 100) }}%
                <span class="text-xs ml-2">({{ answerResult.score.toFixed(2) }} puntos)</span>
              </p>
              <p v-if="answerResult.tip" class="text-sm md:text-lg text-gray-700">
                <span class="font-semibold">💡 Consejo:</span> {{ answerResult.tip }}
              </p>
            </div>
          </div>

          <button @click="nextQuestion" class="btn-primary w-full mt-3 md:mt-4">
            {{ hasMoreQuestions ? 'Siguiente Pregunta →' : 'Ver Resultados →' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGameStore } from '@/stores/game'
import { getQuestions, submitAnswer } from '@/api'
import NetworkGraph from '@/components/NetworkGraph.vue'
import GraphTutorial from '@/components/GraphTutorial.vue'

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

const loading = ref(true)
const error = ref('')
const answered = ref(false)
const selectedAnswer = ref(null) // Single answer: number | null
const selectedAnswers = ref([]) // Multiple answers: number[]
const answerResult = ref(null)
const correctAnswers = ref(0)
const showTutorial = ref(true)
const allQuestionsCompleted = ref(false)

const currentQuestion = computed(() => {
  return gameStore.questions[gameStore.currentQuestionIndex]
})

const progress = computed(() => {
  return ((gameStore.currentQuestionIndex + 1) / gameStore.questions.length) * 100
})

const hasMoreQuestions = computed(() => {
  return gameStore.currentQuestionIndex < gameStore.questions.length - 1
})

onMounted(async () => {
  // Verify user is authenticated
  if (!userStore.userId) {
    console.log('Usuario no autenticado, redirigiendo a registro...')
    userStore.clearUser() // Clear stale data
    router.push('/register')
    return
  }

  try {
    const response = await getQuestions(userStore.userId)

    // Check if there are any questions left to answer
    if (response.data.length === 0) {
      allQuestionsCompleted.value = true
    } else {
      gameStore.setQuestions(response.data)
    }
  } catch (err) {
    if (err.response?.status === 404) {
      // Usuario no encontrado en la base de datos, redirigir a registro
      console.log('Usuario no encontrado, redirigiendo a registro...')
      userStore.clearUser() // Clear invalid user data
      router.push('/register')
    } else if (err.response?.status === 400) {
      // Error de validación, redirigir a registro
      console.log('Error de validación, redirigiendo a registro...')
      userStore.clearUser() // Clear invalid user data
      router.push('/register')
    } else {
      error.value = err.response?.data?.error || 'No se pudieron cargar las preguntas.'
    }
  } finally {
    loading.value = false
  }
})

const selectOption = (index) => {
  if (answered.value) return

  // Check if this is a multiple answer question
  if (currentQuestion.value.allowMultipleAnswers) {
    // Toggle selection for multiple answers
    const idx = selectedAnswers.value.indexOf(index)
    if (idx > -1) {
      selectedAnswers.value.splice(idx, 1)
    } else {
      selectedAnswers.value.push(index)
    }
  } else {
    // Single answer selection
    selectedAnswer.value = index
  }
}

const submitSelectedAnswer = async () => {
  if (answered.value) return

  // Validar que haya seleccionado una opción
  const isMultiple = currentQuestion.value.allowMultipleAnswers

  if (isMultiple) {
    if (selectedAnswers.value.length === 0) {
      alert('⚠️ Por favor selecciona al menos una respuesta antes de enviar.')
      return
    }
  } else {
    if (selectedAnswer.value === null) {
      alert('⚠️ Por favor selecciona una respuesta antes de enviar.')
      return
    }
  }

  try {
    const answerToSend = isMultiple ? selectedAnswers.value : selectedAnswer.value

    const response = await submitAnswer(
      userStore.userId,
      currentQuestion.value.id,
      answerToSend
    )

    answerResult.value = response.data

    // Set answered AFTER we have the result to prevent red flash
    answered.value = true

    if (response.data.isCorrect) {
      correctAnswers.value++
    }

    gameStore.addAnswer({
      questionId: currentQuestion.value.id,
      selectedAnswer: answerToSend,
      isCorrect: response.data.isCorrect
    })
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo enviar la respuesta.'
    answered.value = false
  }
}

const nextQuestion = () => {
  const hasMore = gameStore.nextQuestion()

  if (hasMore) {
    // Reset for next question
    answered.value = false
    selectedAnswer.value = null
    selectedAnswers.value = []
    answerResult.value = null
  } else {
    // Game finished, go to results
    router.push('/results')
  }
}

const goHome = () => {
  router.push('/')
}

const goToRegister = () => {
  router.push('/register')
}
</script>

