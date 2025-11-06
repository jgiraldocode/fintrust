<template>
  <div class="container-mobile min-h-screen py-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="card mb-6">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">
            🔧 Admin Panel
          </h1>
          <button @click="goHome" class="btn-secondary">
            ← Back
          </button>
        </div>
      </div>

      <!-- Login Section -->
      <div v-if="!isAuthenticated" class="card max-w-md mx-auto">
        <h2 class="text-2xl font-bold mb-6">Admin Login</h2>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-lg font-medium mb-2">Password</label>
            <input
              v-model="password"
              type="password"
              class="input"
              placeholder="Enter admin password"
              required
            />
          </div>
          <button type="submit" class="btn-primary w-full" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error }}
        </div>
      </div>

      <!-- Admin Dashboard -->
      <div v-else class="space-y-6">
        <!-- Game Controls -->
        <div class="card">
          <h2 class="text-2xl font-bold mb-4">Game Controls</h2>
          <div class="flex items-center gap-4">
            <button
              @click="toggleGameState(true)"
              :disabled="gameState.isActive"
              class="btn-success flex-1"
              :class="{ 'opacity-50 cursor-not-allowed': gameState.isActive }"
            >
              ▶️ Start Game
            </button>
            <button
              @click="toggleGameState(false)"
              :disabled="!gameState.isActive"
              class="btn-danger flex-1"
              :class="{ 'opacity-50 cursor-not-allowed': !gameState.isActive }"
            >
              ⏸️ Stop Game
            </button>
          </div>
          <p class="mt-4 text-lg">
            Status:
            <span :class="gameState.isActive ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
              {{ gameState.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE' }}
            </span>
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card bg-blue-50">
            <p class="text-gray-600 mb-2">Total Questions</p>
            <p class="text-4xl font-bold text-blue-600">{{ questions.length }}</p>
          </div>
          <div class="card bg-green-50">
            <p class="text-gray-600 mb-2">Total Users</p>
            <p class="text-4xl font-bold text-green-600">{{ users.length }}</p>
          </div>
          <div class="card bg-purple-50">
            <p class="text-gray-600 mb-2">Game Status</p>
            <p class="text-2xl font-bold text-purple-600">
              {{ gameState.isActive ? 'Running' : 'Stopped' }}
            </p>
          </div>
        </div>

        <!-- Questions Management -->
        <div class="card">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Questions</h2>
            <button @click="showCreateForm = !showCreateForm" class="btn-primary">
              {{ showCreateForm ? 'Cancel' : '+ New Question' }}
            </button>
          </div>

          <!-- Create/Edit Form -->
          <div v-if="showCreateForm || editingQuestion" class="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">
              {{ editingQuestion ? 'Edit Question' : 'Create New Question' }}
            </h3>
            <form @submit.prevent="saveQuestion" class="space-y-4">
              <div>
                <label class="block text-lg font-medium mb-2">Question Text</label>
                <textarea
                  v-model="questionForm.questionText"
                  class="input min-h-[80px]"
                  placeholder="What pattern do you see in this graph?"
                  required
                ></textarea>
              </div>

              <div>
                <label class="block text-lg font-medium mb-2">Graph JSON</label>
                <textarea
                  v-model="questionForm.graphJson"
                  class="input font-mono text-sm min-h-[200px]"
                  placeholder='{"nodes": [...], "links": [...]}'
                  required
                ></textarea>
                <button type="button" @click="previewGraph" class="mt-2 text-primary-600 hover:text-primary-700">
                  👁️ Preview Graph
                </button>
              </div>

              <div>
                <label class="block text-lg font-medium mb-2">Options</label>
                <div class="space-y-2">
                  <div v-for="(option, index) in questionForm.options" :key="index" class="flex gap-2">
                    <input
                      v-model="questionForm.options[index]"
                      class="input flex-1"
                      :placeholder="`Option ${index + 1}`"
                      required
                    />
                    <button
                      v-if="questionForm.options.length > 2"
                      type="button"
                      @click="removeOption(index)"
                      class="btn-danger px-4"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <button type="button" @click="addOption" class="mt-2 text-primary-600 hover:text-primary-700">
                  + Add Option
                </button>
              </div>

              <div>
                <label class="block text-lg font-medium mb-2">Correct Answer</label>
                <select v-model.number="questionForm.correctAnswer" class="input" required>
                  <option v-for="(option, index) in questionForm.options" :key="index" :value="index">
                    Option {{ index + 1 }}: {{ option || '(empty)' }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-lg font-medium mb-2">Tip (optional)</label>
                <textarea
                  v-model="questionForm.tip"
                  class="input min-h-[80px]"
                  placeholder="Helpful tip for learning from this question..."
                ></textarea>
              </div>

              <div class="flex gap-4">
                <button type="submit" class="btn-success flex-1" :disabled="loading">
                  {{ loading ? 'Saving...' : editingQuestion ? 'Update' : 'Create' }}
                </button>
                <button type="button" @click="cancelEdit" class="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Graph Preview Modal -->
          <div v-if="showGraphPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="showGraphPreview = false">
            <div class="bg-white rounded-xl p-6 max-w-4xl w-full" @click.stop>
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">Graph Preview</h3>
                <button @click="showGraphPreview = false" class="text-gray-500 hover:text-gray-700 text-2xl">
                  ✕
                </button>
              </div>
              <NetworkGraph v-if="previewGraphData" :graph-data="previewGraphData" />
              <div v-else class="text-red-600 p-4">
                Invalid graph JSON format
              </div>
            </div>
          </div>

          <!-- Questions List -->
          <div class="space-y-4">
            <div
              v-for="question in questions"
              :key="question.id"
              class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1">
                  <h4 class="font-bold text-lg mb-2">{{ question.questionText }}</h4>
                  <div class="text-sm text-gray-600 space-y-1">
                    <p>Options: {{ question.options.length }}</p>
                    <p>Correct: Option {{ question.correctAnswer + 1 }}</p>
                    <p v-if="question.tip" class="text-gray-500">Tip: {{ question.tip }}</p>
                  </div>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                  <button @click="editQuestion(question)" class="btn-secondary px-4">
                    ✏️ Edit
                  </button>
                  <button @click="deleteQuestionConfirm(question)" class="btn-danger px-4">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>

            <div v-if="questions.length === 0" class="text-center py-12 text-gray-500">
              No questions yet. Create your first question!
            </div>
          </div>
        </div>

        <!-- Users List -->
        <div class="card">
          <h2 class="text-2xl font-bold mb-4">Registered Users</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b-2 border-gray-300">
                  <th class="text-left py-3 px-4">Name</th>
                  <th class="text-left py-3 px-4">Registered At</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id" class="border-b border-gray-200">
                  <td class="py-3 px-4">{{ user.name }}</td>
                  <td class="py-3 px-4 text-gray-600">{{ formatDate(user.created_at) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="users.length === 0" class="text-center py-8 text-gray-500">
              No users registered yet.
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="card bg-red-50 border-2 border-red-300">
          <h2 class="text-2xl font-bold text-red-700 mb-4">⚠️ Danger Zone</h2>
          <button @click="resetAllScores" class="btn-danger">
            Reset All Scores
          </button>
          <p class="text-sm text-gray-600 mt-2">
            This will delete all user scores but keep questions and users.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  setGameState,
  getAdminUsers,
  resetScores,
  getGameState
} from '@/api'
import NetworkGraph from '@/components/NetworkGraph.vue'

const router = useRouter()

const isAuthenticated = ref(false)
const password = ref('')
const loading = ref(false)
const error = ref('')

const gameState = ref({ isActive: false })
const questions = ref([])
const users = ref([])

const showCreateForm = ref(false)
const editingQuestion = ref(null)
const showGraphPreview = ref(false)
const previewGraphData = ref(null)

const questionForm = ref({
  questionText: '',
  graphJson: '',
  options: ['', ''],
  correctAnswer: 0,
  tip: ''
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // Try to fetch questions to verify password
    await getAdminQuestions(password.value)
    isAuthenticated.value = true
    await loadDashboard()
  } catch (err) {
    error.value = 'Invalid password'
  } finally {
    loading.value = false
  }
}

const loadDashboard = async () => {
  try {
    const [questionsRes, usersRes, gameStateRes] = await Promise.all([
      getAdminQuestions(password.value),
      getAdminUsers(password.value),
      getGameState()
    ])

    questions.value = questionsRes.data
    users.value = usersRes.data
    gameState.value = gameStateRes.data
  } catch (err) {
    console.error('Error loading dashboard:', err)
  }
}

const toggleGameState = async (isActive) => {
  try {
    await setGameState(isActive, password.value)
    gameState.value.isActive = isActive
  } catch (err) {
    alert('Failed to update game state')
  }
}

const addOption = () => {
  questionForm.value.options.push('')
}

const removeOption = (index) => {
  questionForm.value.options.splice(index, 1)
  if (questionForm.value.correctAnswer >= questionForm.value.options.length) {
    questionForm.value.correctAnswer = 0
  }
}

const previewGraph = () => {
  try {
    previewGraphData.value = JSON.parse(questionForm.value.graphJson)
    showGraphPreview.value = true
  } catch (err) {
    alert('Invalid JSON format')
  }
}

const saveQuestion = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = {
      questionText: questionForm.value.questionText,
      graphJson: questionForm.value.graphJson,
      options: questionForm.value.options,
      correctAnswer: questionForm.value.correctAnswer,
      tip: questionForm.value.tip
    }

    if (editingQuestion.value) {
      await updateQuestion(editingQuestion.value.id, data, password.value)
    } else {
      await createQuestion(data, password.value)
    }

    await loadDashboard()
    cancelEdit()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to save question'
    alert(error.value)
  } finally {
    loading.value = false
  }
}

const editQuestion = (question) => {
  editingQuestion.value = question
  questionForm.value = {
    questionText: question.questionText,
    graphJson: question.graphJson,
    options: [...question.options],
    correctAnswer: question.correctAnswer,
    tip: question.tip || ''
  }
  showCreateForm.value = false
}

const deleteQuestionConfirm = async (question) => {
  if (confirm(`Are you sure you want to delete this question? "${question.questionText}"`)) {
    try {
      await deleteQuestion(question.id, password.value)
      await loadDashboard()
    } catch (err) {
      alert('Failed to delete question')
    }
  }
}

const cancelEdit = () => {
  showCreateForm.value = false
  editingQuestion.value = null
  questionForm.value = {
    questionText: '',
    graphJson: '',
    options: ['', ''],
    correctAnswer: 0,
    tip: ''
  }
}

const resetAllScores = async () => {
  if (confirm('Are you sure you want to reset all scores? This cannot be undone!')) {
    try {
      await resetScores(password.value)
      alert('All scores have been reset')
    } catch (err) {
      alert('Failed to reset scores')
    }
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  // Auto-load if we have password in session storage
  const savedPassword = sessionStorage.getItem('adminPassword')
  if (savedPassword) {
    password.value = savedPassword
    handleLogin()
  }
})
</script>

