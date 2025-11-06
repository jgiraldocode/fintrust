<template>
  <div class="container-mobile min-h-screen flex flex-col items-center justify-center">
    <div class="card w-full max-w-md text-center">
      <h1 class="text-4xl font-bold text-primary-700 mb-4">
        Quiz Game
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Test your knowledge with graph-based questions
      </p>

      <div class="space-y-4">
        <button @click="goToRegister" class="btn-primary w-full">
          Get Started
        </button>

        <button @click="goToLeaderboard" class="btn-secondary w-full">
          View Leaderboard
        </button>

        <button @click="goToAdmin" class="btn bg-gray-700 text-white hover:bg-gray-800 w-full">
          Admin Panel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const goToRegister = () => {
  if (userStore.isAuthenticated) {
    router.push('/waiting')
  } else {
    router.push('/register')
  }
}

const goToLeaderboard = () => {
  router.push('/leaderboard')
}

const goToAdmin = () => {
  router.push('/admin')
}
</script>

