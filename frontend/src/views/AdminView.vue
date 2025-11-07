<template>
  <div class="container-mobile min-h-screen py-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="card mb-6">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">
            🔧 Panel de Administración
          </h1>
          <button @click="goHome" class="btn-secondary">
            ← Volver
          </button>
        </div>
      </div>

      <!-- Login Section -->
      <div v-if="!isAuthenticated" class="card max-w-md mx-auto">
        <h2 class="text-2xl font-bold mb-6">Iniciar Sesión como Administrador</h2>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-lg font-medium mb-2">Contraseña</label>
            <input
              v-model="password"
              type="password"
              class="input"
              placeholder="Ingresa la contraseña de administrador"
              required
            />
          </div>
          <button type="submit" class="btn-primary w-full" :disabled="loading">
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>
        <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error }}
        </div>
      </div>

      <!-- Admin Dashboard -->
      <div v-else class="space-y-6">
        <!-- Tabs Navigation -->
        <div class="card">
          <div class="flex flex-wrap gap-2">
            <button
              @click="activeTab = 'general'"
              class="px-4 py-2 rounded-lg font-medium transition-all"
              :class="activeTab === 'general' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              📊 General
            </button>
            <button
              @click="activeTab = 'questions'"
              class="px-4 py-2 rounded-lg font-medium transition-all"
              :class="activeTab === 'questions' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              📝 Preguntas
            </button>
            <button
              @click="activeTab = 'users'"
              class="px-4 py-2 rounded-lg font-medium transition-all"
              :class="activeTab === 'users' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              👥 Usuarios
            </button>
            <button
              @click="activeTab = 'danger'"
              class="px-4 py-2 rounded-lg font-medium transition-all"
              :class="activeTab === 'danger' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              ⚠️ Eliminación
            </button>
          </div>
        </div>

        <!-- Tab 1: General -->
        <div v-if="activeTab === 'general'" class="space-y-6">
          <!-- Game Controls -->
          <div class="card">
          <h2 class="text-2xl font-bold mb-4">Control del Juego</h2>
          <div class="flex items-center gap-4">
            <button
              @click="toggleGameState(true)"
              :disabled="gameState.isActive"
              class="btn-success flex-1"
              :class="{ 'opacity-50 cursor-not-allowed': gameState.isActive }"
            >
              ▶️ Iniciar Juego
            </button>
            <button
              @click="toggleGameState(false)"
              :disabled="!gameState.isActive"
              class="btn-danger flex-1"
              :class="{ 'opacity-50 cursor-not-allowed': !gameState.isActive }"
            >
              ⏸️ Detener Juego
            </button>
          </div>
          <p class="mt-4 text-lg">
            Estado:
            <span :class="gameState.isActive ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
              {{ gameState.isActive ? '🟢 ACTIVO' : '🔴 INACTIVO' }}
            </span>
          </p>
        </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="card bg-blue-50">
              <p class="text-gray-600 mb-2">Total de Preguntas</p>
              <p class="text-4xl font-bold text-blue-600">{{ questions.length }}</p>
            </div>
            <div class="card bg-green-50">
              <p class="text-gray-600 mb-2">Total de Usuarios</p>
              <p class="text-4xl font-bold text-green-600">{{ users.length }}</p>
            </div>
            <div class="card bg-purple-50">
              <p class="text-gray-600 mb-2">Estado del Juego</p>
              <p class="text-2xl font-bold text-purple-600">
                {{ gameState.isActive ? 'En Curso' : 'Detenido' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tab 2: Questions Management -->
        <div v-if="activeTab === 'questions'" class="card">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Preguntas</h2>
            <button @click="showCreateForm = !showCreateForm" class="btn-primary">
              {{ showCreateForm ? 'Cancelar' : '+ Nueva Pregunta' }}
            </button>
          </div>

          <!-- Create/Edit Form -->
          <div v-if="showCreateForm || editingQuestion" class="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">
              {{ editingQuestion ? 'Editar Pregunta' : 'Crear Nueva Pregunta' }}
            </h3>
            <form @submit.prevent="saveQuestion" class="space-y-4">
              <div>
                <label class="block text-lg font-medium mb-2">Texto de la Pregunta</label>
                <textarea
                  v-model="questionForm.questionText"
                  class="input min-h-[80px]"
                  placeholder="¿Qué patrón ves en este grafo?"
                  required
                ></textarea>
              </div>

              <div>
                <label class="block text-lg font-medium mb-2">JSON del Grafo</label>
                <textarea
                  v-model="questionForm.graphJson"
                  class="input font-mono text-sm min-h-[200px]"
                  placeholder='{"nodes": [...], "links": [...]}'
                  required
                ></textarea>
                <button type="button" @click="previewGraph" class="mt-2 text-primary-600 hover:text-primary-700">
                  👁️ Vista Previa del Grafo
                </button>
              </div>

              <div>
                <label class="block text-lg font-medium mb-2">Opciones</label>
                <div class="space-y-2">
                  <div v-for="(option, index) in questionForm.options" :key="index" class="flex gap-2">
                    <input
                      v-model="questionForm.options[index]"
                      class="input flex-1"
                      :placeholder="`Opción ${index + 1}`"
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
                  + Agregar Opción
                </button>
              </div>

              <!-- Toggle for multiple answers -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="questionForm.allowMultipleAnswers"
                    class="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span class="text-lg font-medium">
                    ✅ Permitir múltiples respuestas correctas
                  </span>
                </label>
                <p class="text-sm text-gray-600 mt-2 ml-8">
                  Si activas esta opción, podrás seleccionar múltiples respuestas correctas. Los usuarios recibirán puntaje parcial según sus selecciones.
                </p>
              </div>

              <!-- Single answer selection -->
              <div v-if="!questionForm.allowMultipleAnswers">
                <label class="block text-lg font-medium mb-2">Respuesta Correcta</label>
                <select v-model.number="questionForm.correctAnswer" class="input" required>
                  <option v-for="(option, index) in questionForm.options" :key="index" :value="index">
                    Opción {{ index + 1 }}: {{ option || '(vacío)' }}
                  </option>
                </select>
              </div>

              <!-- Multiple answers selection -->
              <div v-else>
                <label class="block text-lg font-medium mb-2">
                  Respuestas Correctas (selecciona todas las que apliquen)
                </label>
                <div class="space-y-2">
                  <label
                    v-for="(option, index) in questionForm.options"
                    :key="index"
                    class="flex items-start gap-3 p-3 bg-white border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    :class="questionForm.correctAnswers.includes(index) ? 'border-primary-500 bg-primary-50' : 'border-gray-300'"
                  >
                    <input
                      type="checkbox"
                      :value="index"
                      v-model="questionForm.correctAnswers"
                      class="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 mt-0.5"
                    />
                    <div class="flex-1">
                      <span class="font-medium">Opción {{ index + 1 }}:</span>
                      <span class="ml-2">{{ option || '(vacío)' }}</span>
                    </div>
                  </label>
                </div>
                <p v-if="questionForm.correctAnswers.length === 0" class="text-sm text-red-600 mt-2">
                  ⚠️ Debes seleccionar al menos una respuesta correcta
                </p>
              </div>

              <div>
                <label class="block text-lg font-medium mb-2">Consejo (opcional)</label>
                <textarea
                  v-model="questionForm.tip"
                  class="input min-h-[80px]"
                  placeholder="Consejo útil para aprender de esta pregunta..."
                ></textarea>
              </div>

              <div class="flex gap-4">
                <button type="submit" class="btn-success flex-1" :disabled="loading">
                  {{ loading ? 'Guardando...' : editingQuestion ? 'Actualizar' : 'Crear' }}
                </button>
                <button type="button" @click="cancelEdit" class="btn-secondary flex-1">
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <!-- Graph Preview Modal -->
          <div v-if="showGraphPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="showGraphPreview = false">
            <div class="bg-white rounded-xl p-6 max-w-4xl w-full" @click.stop>
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">Vista Previa del Grafo</h3>
                <button @click="showGraphPreview = false" class="text-gray-500 hover:text-gray-700 text-2xl">
                  ✕
                </button>
              </div>
              <NetworkGraph
                v-if="previewGraphData && previewGraphData.nodes && previewGraphData.links"
                :key="JSON.stringify(previewGraphData)"
                :graph-data="previewGraphData"
              />
              <div v-else class="text-red-600 p-4 text-center">
                <p class="text-lg font-semibold mb-2">Formato JSON del grafo inválido</p>
                <p class="text-sm">Asegúrate de que el JSON tenga la estructura correcta con "nodes" y "links".</p>
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
                    <p>Opciones: {{ question.options.length }}</p>
                    <p>Correcta: Opción {{ question.correctAnswer + 1 }}</p>
                    <p v-if="question.tip" class="text-gray-500">Consejo: {{ question.tip }}</p>
                  </div>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                  <button @click="editQuestion(question)" class="btn-secondary px-4">
                    ✏️ Editar
                  </button>
                  <button @click="deleteQuestionConfirm(question)" class="btn-danger px-4">
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>

            <div v-if="questions.length === 0" class="text-center py-12 text-gray-500">
              Aún no hay preguntas. ¡Crea tu primera pregunta!
            </div>
          </div>
        </div>

        <!-- Tab 3: Users List -->
        <div v-if="activeTab === 'users'" class="card">
          <h2 class="text-2xl font-bold mb-4">Usuarios Registrados</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b-2 border-gray-300">
                  <th class="text-left py-3 px-4">Nombre</th>
                  <th class="text-left py-3 px-4">Fecha de Registro</th>
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
              Aún no hay usuarios registrados.
            </div>
          </div>
        </div>

        <!-- Tab 4: Danger Zone -->
        <div v-if="activeTab === 'danger'" class="card bg-red-50 border-2 border-red-300">
          <h2 class="text-2xl font-bold text-red-700 mb-4">⚠️ Zona de Peligro</h2>

          <div class="space-y-4">
            <div class="bg-white rounded-lg p-4 border border-red-200">
              <button @click="resetAllScores" class="btn-danger w-full mb-2">
                Reiniciar Todos los Puntajes
              </button>
              <p class="text-sm text-gray-600">
                Esto eliminará todos los puntajes de usuarios pero mantendrá las preguntas y usuarios.
              </p>
            </div>

            <div class="bg-white rounded-lg p-4 border border-red-200">
              <button @click="deleteAllUsersConfirm" class="btn-danger w-full mb-2">
                🗑️ Eliminar Todos los Usuarios
              </button>
              <p class="text-sm text-gray-600">
                Esto eliminará todos los usuarios registrados y sus puntajes. Las preguntas se mantendrán.
              </p>
            </div>

            <div class="bg-white rounded-lg p-4 border border-red-200">
              <button @click="deleteAllQuestionsConfirm" class="btn-danger w-full mb-2">
                🗑️ Eliminar Todas las Preguntas
              </button>
              <p class="text-sm text-gray-600">
                Esto eliminará todas las preguntas y sus puntajes asociados. Los usuarios se mantendrán.
              </p>
            </div>
          </div>
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
  deleteAllUsers,
  deleteAllQuestions,
  getGameState
} from '@/api'
import NetworkGraph from '@/components/NetworkGraph.vue'

const router = useRouter()

const isAuthenticated = ref(false)
const password = ref('')
const loading = ref(false)
const error = ref('')
const activeTab = ref('general')

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
  correctAnswers: [],
  allowMultipleAnswers: false,
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
    error.value = 'Contraseña inválida'
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
    alert('No se pudo actualizar el estado del juego')
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
    alert('Formato JSON inválido')
  }
}

const saveQuestion = async () => {
  loading.value = true
  error.value = ''

  // Validate multiple answers
  if (questionForm.value.allowMultipleAnswers && questionForm.value.correctAnswers.length === 0) {
    error.value = 'Debes seleccionar al menos una respuesta correcta'
    alert(error.value)
    loading.value = false
    return
  }

  try {
    const data = {
      questionText: questionForm.value.questionText,
      graphJson: questionForm.value.graphJson,
      options: questionForm.value.options,
      allowMultipleAnswers: questionForm.value.allowMultipleAnswers,
      tip: questionForm.value.tip
    }

    // Add correct answer(s) based on type
    if (questionForm.value.allowMultipleAnswers) {
      data.correctAnswers = questionForm.value.correctAnswers
    } else {
      data.correctAnswer = questionForm.value.correctAnswer
    }

    if (editingQuestion.value) {
      await updateQuestion(editingQuestion.value.id, data, password.value)
    } else {
      await createQuestion(data, password.value)
    }

    await loadDashboard()
    cancelEdit()
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo guardar la pregunta'
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
    correctAnswer: question.correctAnswer || 0,
    correctAnswers: question.correctAnswers || [],
    allowMultipleAnswers: question.allowMultipleAnswers || false,
    tip: question.tip || ''
  }
  showCreateForm.value = false
}

const deleteQuestionConfirm = async (question) => {
  if (confirm(`¿Estás seguro de que deseas eliminar esta pregunta? "${question.questionText}"`)) {
    try {
      await deleteQuestion(question.id, password.value)
      await loadDashboard()
    } catch (err) {
      alert('No se pudo eliminar la pregunta')
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
    correctAnswers: [],
    allowMultipleAnswers: false,
    tip: ''
  }
}

const resetAllScores = async () => {
  if (confirm('¿Estás seguro de que deseas reiniciar todos los puntajes? ¡Esto no se puede deshacer!')) {
    try {
      await resetScores(password.value)
      alert('Todos los puntajes han sido reiniciados')
    } catch (err) {
      alert('Error al reiniciar los puntajes')
    }
  }
}

const deleteAllUsersConfirm = async () => {
  const confirmText = '¿Estás ABSOLUTAMENTE SEGURO de que deseas eliminar TODOS LOS USUARIOS?\n\nEsto eliminará:\n- Todos los usuarios registrados\n- Todos sus puntajes\n\n¡Esta acción NO se puede deshacer!\n\nEscribe "ELIMINAR TODO" para confirmar.'
  const userInput = prompt(confirmText)

  if (userInput === 'ELIMINAR TODO') {
    try {
      const response = await deleteAllUsers(password.value)
      alert(`Se eliminaron ${response.data.deletedCount} usuarios exitosamente`)
      await loadDashboard()
    } catch (err) {
      alert('Error al eliminar usuarios: ' + (err.response?.data?.error || err.message))
    }
  } else if (userInput !== null) {
    alert('Eliminación cancelada. El texto de confirmación no coincide.')
  }
}

const deleteAllQuestionsConfirm = async () => {
  const confirmText = '¿Estás ABSOLUTAMENTE SEGURO de que deseas eliminar TODAS LAS PREGUNTAS?\n\nEsto eliminará:\n- Todas las preguntas\n- Todos los puntajes asociados\n\n¡Esta acción NO se puede deshacer!\n\nEscribe "ELIMINAR TODO" para confirmar.'
  const userInput = prompt(confirmText)

  if (userInput === 'ELIMINAR TODO') {
    try {
      const response = await deleteAllQuestions(password.value)
      alert(`Se eliminaron ${response.data.deletedCount} preguntas exitosamente`)
      await loadDashboard()
    } catch (err) {
      alert('Error al eliminar preguntas: ' + (err.response?.data?.error || err.message))
    }
  } else if (userInput !== null) {
    alert('Eliminación cancelada. El texto de confirmación no coincide.')
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

