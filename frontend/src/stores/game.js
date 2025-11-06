import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const questions = ref([])
  const currentQuestionIndex = ref(0)
  const answers = ref([])
  const isGameActive = ref(false)

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

  function setGameActive(active) {
    isGameActive.value = active
  }

  return {
    questions,
    currentQuestionIndex,
    answers,
    isGameActive,
    setQuestions,
    nextQuestion,
    addAnswer,
    reset,
    setGameActive
  }
})

