import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE })

// Managers
export const fetchManagers = (params = {}) =>
  api.get('/managers/', { params }).then(r => r.data)

export const fetchManager = (id) =>
  api.get(`/managers/${id}/`).then(r => r.data)

export const fetchTopPerformers = (metric = 'avg_irr', n = 15) =>
  api.get('/managers/top_performers/', { params: { metric, n } }).then(r => r.data)

export const fetchOverviewStats = (params = {}) =>
  api.get('/managers/overview_stats/', { params }).then(r => r.data)

export const fetchVintageStats = () =>
  api.get('/managers/vintage_stats/').then(r => r.data)

export const fetchScatterData = (params = {}) =>
  api.get('/managers/scatter_data/', { params }).then(r => r.data)

// Funds
export const fetchFunds = (params = {}) =>
  api.get('/funds/', { params }).then(r => r.data)

// Workflow
export const fetchTasks = (params = {}) =>
  api.get('/tasks/', { params }).then(r => r.data)

export const fetchTask = (id) =>
  api.get(`/tasks/${id}/`).then(r => r.data)

export const createTask = (data) =>
  api.post('/tasks/', data).then(r => r.data)

export const updateTask = (id, data) =>
  api.patch(`/tasks/${id}/`, data).then(r => r.data)

export const updateTaskStatus = (id, status) =>
  api.patch(`/tasks/${id}/update_status/`, { status }).then(r => r.data)

export const addComment = (taskId, author, body) =>
  api.post(`/tasks/${taskId}/add_comment/`, { author, body, task: taskId }).then(r => r.data)
