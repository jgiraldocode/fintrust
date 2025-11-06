<template>
  <div class="container-mobile min-h-screen flex flex-col items-center justify-center py-8">
    <div class="card w-full max-w-md">
      <!-- QR Code Section (for admin to print/share) -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-primary-700 mb-4">
          Join the Quiz
        </h2>
        <p class="text-lg text-gray-600 mb-6">
          Scan this QR code or enter your name to register
        </p>

        <div class="bg-white p-4 rounded-lg inline-block border-2 border-gray-200">
          <canvas ref="qrcodeCanvas" class="mx-auto"></canvas>
        </div>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label for="name" class="block text-lg font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="input"
            placeholder="Enter your full name"
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          :disabled="loading || !name.trim()"
          class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {{ error }}
      </div>

      <div class="mt-6 text-center">
        <button @click="goHome" class="text-primary-600 hover:text-primary-700 text-lg">
          ← Back to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { registerUser } from '@/api'
import QRCode from 'qrcode'

const router = useRouter()
const userStore = useUserStore()

const name = ref('')
const loading = ref(false)
const error = ref('')
const qrcodeCanvas = ref(null)

onMounted(async () => {
  // Generate QR code with the registration URL
  const registrationUrl = window.location.origin + '/register'
  try {
    await QRCode.toCanvas(qrcodeCanvas.value, registrationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#0369a1',
        light: '#ffffff'
      }
    })
  } catch (err) {
    console.error('Error generating QR code:', err)
  }
})

const handleRegister = async () => {
  if (!name.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    const response = await registerUser(name.value.trim())
    userStore.setUser(response.data.id, response.data.name)
    router.push('/waiting')
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to register. Please try again.'
  } finally {
    loading.value = false
  }
}

const goHome = () => {
  router.push('/')
}
</script>

