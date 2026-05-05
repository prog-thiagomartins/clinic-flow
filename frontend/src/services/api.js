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

// ── Agendamentos ───────────────────────────────────────
export const getAppointments = (filters = {}) =>
  api.get('/appointments/', { params: filters })

export const getAppointment = (id) =>
  api.get(`/appointments/${id}`)

export const createAppointment = (data) =>
  api.post('/appointments/', data)

export const updateAppointment = (id, data) =>
  api.put(`/appointments/${id}`, data)

export const deleteAppointment = (id) =>
  api.delete(`/appointments/${id}`)

export const checkAppointmentConflict = (params) =>
  api.get('/appointments/check-conflict', { params })

// ── Prontuários ────────────────────────────────────────
export const getMedicalRecords = (filters = {}) =>
  api.get('/medical-records/', { params: filters })

export const getMedicalRecord = (id) =>
  api.get(`/medical-records/${id}`)

export const getMedicalRecordByAppointment = (appointmentId) =>
  api.get(`/medical-records/by-appointment/${appointmentId}`)

export const createMedicalRecord = (data) =>
  api.post('/medical-records/', data)

export const updateMedicalRecord = (id, data) =>
  api.put(`/medical-records/${id}`, data)

export const deleteMedicalRecord = (id) =>
  api.delete(`/medical-records/${id}`)

export default api
