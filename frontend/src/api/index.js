import axios from 'axios'

// Use environment variable for API URL, fallback to relative path for development
const apiBaseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  withCredentials: true
})

// User endpoints
export const registerUser = (name) => api.post('/register', { name })
export const getUser = (id) => api.get(`/user/${id}`)

// Game endpoints
export const getGameState = () => api.get('/game-state')
export const getQuestions = (userId) => api.get('/questions', { params: { userId } })
export const submitAnswer = (userId, questionId, answer) =>
  api.post('/answer', { userId, questionId, answer })
export const getLeaderboard = (section = null) => {
  const params = section ? { section } : {}
  return api.get('/leaderboard', { params })
}
export const getUserScore = (userId) => api.get(`/user-score/${userId}`)

// Admin endpoints
const getAuthHeaders = (password) => ({
  headers: {
    'Authorization': `Basic ${btoa(`admin:${password}`)}`
  }
})

export const setGameState = (isActive, password, section = null) =>
  api.post('/admin/game-state', { isActive, section }, getAuthHeaders(password))

export const setSectionState = (sectionNumber, isActive, password) =>
  api.post(`/admin/game-state/section/${sectionNumber}`, { isActive }, getAuthHeaders(password))

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

export const deleteAllUsers = (password) =>
  api.delete('/admin/delete-all-users', getAuthHeaders(password))

export const deleteAllQuestions = (password) =>
  api.delete('/admin/delete-all-questions', getAuthHeaders(password))

