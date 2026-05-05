import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Patients from './pages/Patients'
import PatientForm from './pages/PatientForm'
import Appointments from './pages/Appointments'
import AppointmentForm from './pages/AppointmentForm'
import Records from './pages/Records'
import RecordForm from './pages/RecordForm'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/patients" replace />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/new" element={<PatientForm />} />
            <Route path="/patients/:id/edit" element={<PatientForm />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/appointments/new" element={<AppointmentForm />} />
            <Route path="/appointments/:id/edit" element={<AppointmentForm />} />
            <Route path="/records" element={<Records />} />
            <Route path="/records/new" element={<RecordForm />} />
            <Route path="/records/:id/edit" element={<RecordForm />} />
            {/* Rotas futuras (Prova) */}
            <Route path="/financial"    element={<ComingSoon title="Financeiro" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function ComingSoon({ title }) {
  return (
    <div className="flex-1 flex items-center justify-center text-center">
      <div>
        <p className="text-5xl mb-4">🚧</p>
        <h2 className="text-xl font-bold text-gray-700">{title}</h2>
        <p className="text-gray-400 mt-2 text-sm">Funcionalidade em desenvolvimento — Prova</p>
      </div>
    </div>
  )
}
