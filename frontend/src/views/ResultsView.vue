<template>
  <div class="container-mobile min-h-screen py-8">
    <div class="card text-center max-w-2xl mx-auto">
      <!-- Success/Try Again Message -->
      <div class="mb-8">
        <div v-if="isSuccess" class="text-6xl mb-4">🎉</div>
        <div v-else class="text-6xl mb-4">💪</div>

        <h2 class="text-4xl font-bold mb-4" :class="isSuccess ? 'text-green-600' : 'text-orange-600'">
          {{ isSuccess ? 'Congratulations!' : 'Good Luck Next Time!' }}
        </h2>

        <p class="text-xl text-gray-600">
          {{ userName }}, you've completed the quiz!
        </p>
      </div>

      <!-- Score Summary -->
      <div class="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl p-8 mb-8">
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-white rounded-lg p-6 shadow-md">
            <p class="text-gray-600 text-lg mb-2">Correct Answers</p>
            <p class="text-5xl font-bold text-green-600">
              {{ score.correctAnswers }}
            </p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md">
            <p class="text-gray-600 text-lg mb-2">Total Questions</p>
            <p class="text-5xl font-bold text-primary-600">
              {{ score.totalAnswers }}
            </p>
          </div>
        </div>

        <div class="mt-6 bg-white rounded-lg p-6 shadow-md">
          <p class="text-gray-600 text-lg mb-2">Score Percentage</p>
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
          View Leaderboard 🏆
        </button>

        <button @click="goHome" class="btn-secondary w-full">
          Back to Home
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
    return "Outstanding performance! You have an excellent understanding of graph patterns! 🌟"
  } else if (percentage >= 70) {
    return "Great job! You demonstrated strong analytical skills! Keep it up! 💪"
  } else if (percentage >= 50) {
    return "Good effort! You're on the right track. Practice makes perfect! 📈"
  } else {
    return "Don't give up! Review the patterns and try again. You'll do better next time! 🚀"
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

