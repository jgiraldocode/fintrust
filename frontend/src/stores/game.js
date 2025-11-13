import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  const questions = ref([])
  const currentQuestionIndex = ref(0)
  const answers = ref([])
  const activeSection = ref(null) // null, 1, 2, 3, etc.

  // Computed property for backward compatibility
  const isGameActive = computed(() => activeSection.value !== null)

  function setQuestions(newQuestions) {
    questions.value = newQuestions
    currentQuestionIndex.value = 0
    answers.value = []
  }

  function nextQuestion() {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++
      return true
    }
    return false
  }

  function addAnswer(answer) {
    answers.value.push(answer)
  }

  function reset() {
    questions.value = []
    currentQuestionIndex.value = 0
    answers.value = []
  }

  function setGameActive(active, section = null) {
    // If active is boolean (legacy), convert to section format
    if (typeof active === 'boolean') {
      activeSection.value = active ? (section || 1) : null
    } else {
      // New format: pass section number directly or null
      activeSection.value = active
    }
  }

  function setActiveSection(section) {
    activeSection.value = section
  }

  return {
    questions,
    currentQuestionIndex,
    answers,
    activeSection,
    isGameActive,
    setQuestions,
    nextQuestion,
    addAnswer,
    reset,
    setGameActive,
    setActiveSection
  }
})

