import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ||'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
})

// Automatically attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const registerPatient = (data) => api.post('/auth/register/patient', data)
export const registerDoctor = (data) => api.post('/auth/register/doctor', data)
export const loginUser = (data) => api.post('/auth/login', data)

// Reports
export const uploadReport = (formData) =>
  api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getMyReports = () => api.get('/reports/my')
export const getReport = (id) => api.get(`/reports/${id}`)

// Doctor
export const getPatientByMobile = (mobile) => api.get(`/doctor/patient/${mobile}`)
export const getRecentPatients = () => api.get('/doctor/patients/recent')

// Chat
export const chatAboutReport = (data) => api.post('/chat/report', data)