import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Pacientes ──────────────────────────────────────────
export const getPatients = (search = '') =>
  api.get('/patients/', { params: search ? { search } : {} })

export const getPatient = (id) =>
  api.get(`/patients/${id}`)

export const createPatient = (data) =>
  api.post('/patients/', data)

export const updatePatient = (id, data) =>
  api.put(`/patients/${id}`, data)

export const deletePatient = (id) =>
  api.delete(`/patients/${id}`)

export default api
