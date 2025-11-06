<template>
  <div class="container-mobile min-h-screen py-8">
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
    </div>

    <div v-else-if="error" class="card">
      <div class="text-center">
        <p class="text-xl text-red-600 mb-4">{{ error }}</p>
        <button @click="goHome" class="btn-primary">
          Back to Home
        </button>
      </div>
    </div>

    <div v-else-if="!gameStarted" class="card text-center">
      <h2 class="text-3xl font-bold text-primary-700 mb-4">
        Game Not Active
      </h2>
      <p class="text-xl text-gray-600 mb-6">
        Please wait for the admin to start the game.
      </p>
      <button @click="goHome" class="btn-primary">
        Back to Home
      </button>
    </div>

    <div v-else-if="currentQuestion" class="space-y-6">
      <!-- Progress bar -->
      <div class="bg-white rounded-lg p-4 shadow-md">
        <div class="flex justify-between items-center mb-2">
          <span class="text-lg font-semibold text-gray-700">
            Question {{ gameStore.currentQuestionIndex + 1 }} of {{ gameStore.questions.length }}
          </span>
          <span class="text-lg font-semibold text-primary-600">
            Score: {{ correctAnswers }}
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="bg-primary-600 h-3 rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Graph visualization -->
      <div class="card">
        <NetworkGraph :graph-data="currentQuestion.graphData" />
      </div>

      <!-- Question and options -->
      <div class="card">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">
          {{ currentQuestion.questionText }}
        </h3>

        <div class="space-y-4">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            @click="selectAnswer(index)"
            :disabled="answered"
            :class="[
              'w-full p-4 text-left rounded-lg border-2 transition-all text-lg font-medium',
              answered && index === selectedAnswer && answerResult?.isCorrect
                ? 'bg-green-100 border-green-500 text-green-800'
                : answered && index === selectedAnswer && !answerResult?.isCorrect
                ? 'bg-red-100 border-red-500 text-red-800'
                : answered && index === answerResult?.correctAnswer
                ? 'bg-green-50 border-green-400 text-green-700'
                : 'bg-white border-gray-300 hover:border-primary-500 hover:bg-primary-50 active:bg-primary-100'
            ]"
          >
            <span class="font-bold mr-2">{{ String.fromCharCode(65 + index) }}.</span>
            {{ option }}
          </button>
        </div>

        <!-- Answer feedback -->
        <div v-if="answered && answerResult" class="mt-6 p-4 rounded-lg" :class="answerResult.isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'">
          <div class="flex items-start gap-3">
            <span class="text-3xl">{{ answerResult.isCorrect ? '✅' : '❌' }}</span>
            <div>
              <p class="text-xl font-bold mb-2" :class="answerResult.isCorrect ? 'text-green-800' : 'text-red-800'">
                {{ answerResult.isCorrect ? 'Correct!' : 'Incorrect!' }}
              </p>
              <p v-if="answerResult.tip" class="text-lg text-gray-700">
                <span class="font-semibold">💡 Tip:</span> {{ answerResult.tip }}
              </p>
            </div>
          </div>

          <button @click="nextQuestion" class="btn-primary w-full mt-4">
            {{ hasMoreQuestions ? 'Next Question →' : 'See Results →' }}
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

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

const loading = ref(true)
const error = ref('')
const gameStarted = ref(false)
const answered = ref(false)
const selectedAnswer = ref(null)
const answerResult = ref(null)
const correctAnswers = ref(0)

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
  try {
    const response = await getQuestions()
    gameStore.setQuestions(response.data)
    gameStarted.value = true
  } catch (err) {
    if (err.response?.status === 403) {
      error.value = 'Game is not active yet. Please wait for the admin to start.'
      gameStarted.value = false
    } else {
      error.value = err.response?.data?.error || 'Failed to load questions.'
    }
  } finally {
    loading.value = false
  }
})

const selectAnswer = async (index) => {
  if (answered.value) return

  selectedAnswer.value = index
  answered.value = true

  try {
    const response = await submitAnswer(
      userStore.userId,
      currentQuestion.value.id,
      index
    )

    answerResult.value = response.data

    if (response.data.isCorrect) {
      correctAnswers.value++
    }

    gameStore.addAnswer({
      questionId: currentQuestion.value.id,
      selectedAnswer: index,
      isCorrect: response.data.isCorrect
    })
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to submit answer.'
  }
}

const nextQuestion = () => {
  const hasMore = gameStore.nextQuestion()

  if (hasMore) {
    // Reset for next question
    answered.value = false
    selectedAnswer.value = null
    answerResult.value = null
  } else {
    // Game finished, go to results
    router.push('/results')
  }
}

const goHome = () => {
  router.push('/')
}
</script>

