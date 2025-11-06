import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// User endpoints
export const registerUser = (name) => api.post('/register', { name })
export const getUser = (id) => api.get(`/user/${id}`)

// Game endpoints
export const getGameState = () => api.get('/game-state')
export const getQuestions = () => api.get('/questions')
export const submitAnswer = (userId, questionId, answer) =>
  api.post('/answer', { userId, questionId, answer })
export const getLeaderboard = () => api.get('/leaderboard')
export const getUserScore = (userId) => api.get(`/user-score/${userId}`)

// Admin endpoints
const getAuthHeaders = (password) => ({
  headers: {
    'Authorization': `Basic ${btoa(`admin:${password}`)}`
  }
})

export const setGameState = (isActive, password) =>
  api.post('/admin/game-state', { isActive }, getAuthHeaders(password))

export const getAdminQuestions = (password) =>
  api.get('/admin/questions', getAuthHeaders(password))

export const createQuestion = (questionData, password) =>
  api.post('/admin/questions', questionData, getAuthHeaders(password))

export const updateQuestion = (id, questionData, password) =>
  api.put(`/admin/questions/${id}`, questionData, getAuthHeaders(password))

export const deleteQuestion = (id, password) =>
  api.delete(`/admin/questions/${id}`, getAuthHeaders(password))

export const getAdminUsers = (password) =>
  api.get('/admin/users', getAuthHeaders(password))

export const resetScores = (password) =>
  api.delete('/admin/reset-scores', getAuthHeaders(password))

