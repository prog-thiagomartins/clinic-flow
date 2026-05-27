import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Patients from './pages/Patients'
import PatientForm from './pages/PatientForm'
import Appointments from './pages/Appointments'
import AppointmentForm from './pages/AppointmentForm'
import Records from './pages/Records'
import RecordForm from './pages/RecordForm'
import Financial from './pages/Financial'
import PaymentForm from './pages/PaymentForm'

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
            <Route path="/financial" element={<Financial />} />
            <Route path="/financial/new" element={<PaymentForm />} />
            <Route path="/financial/:id/edit" element={<PaymentForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
