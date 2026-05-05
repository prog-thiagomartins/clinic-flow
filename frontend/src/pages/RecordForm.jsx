import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import {
  createMedicalRecord,
  updateMedicalRecord,
  getMedicalRecord,
  getAppointments,
  getAppointment,
} from '../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

const inputCls = (error) =>
  `w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
  }`

export default function RecordForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)
  const presetAppointmentId = searchParams.get('appointment_id')

  const [appointments, setAppointments] = useState([])
  const [lockedAppointment, setLockedAppointment] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      appointment_id: '',
      chief_complaint: '',
      evolution: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
    },
  })

  // Carregar consultas para o select (somente quando criando sem appointment pré-fixado)
  useEffect(() => {
    if (isEdit || presetAppointmentId) return
    getAppointments()
      .then(({ data }) => setAppointments(data))
      .catch(() => toast.error('Erro ao carregar consultas'))
  }, [isEdit, presetAppointmentId])

  // Caso pré-fixado via query string: carregar detalhes da consulta e travar o select
  useEffect(() => {
    if (isEdit || !presetAppointmentId) return
    getAppointment(presetAppointmentId)
      .then(({ data }) => {
        setLockedAppointment(data)
        reset((prev) => ({ ...prev, appointment_id: data.id }))
      })
      .catch(() => toast.error('Erro ao carregar consulta'))
  }, [isEdit, presetAppointmentId, reset])

  // Edição: carregar prontuário existente
  useEffect(() => {
    if (!isEdit) return
    getMedicalRecord(id)
      .then(({ data }) => {
        setLockedAppointment(data.appointment ?? null)
        reset({
          appointment_id: data.appointment_id,
          chief_complaint: data.chief_complaint ?? '',
          evolution: data.evolution ?? '',
          diagnosis: data.diagnosis ?? '',
          treatment: data.treatment ?? '',
          prescription: data.prescription ?? '',
        })
      })
      .catch(() => toast.error('Erro ao carregar prontuário'))
  }, [id, isEdit, reset])

  const onSubmit = async (data) => {
    const payload = {
      appointment_id: Number(data.appointment_id),
      chief_complaint: data.chief_complaint,
      evolution: data.evolution || null,
      diagnosis: data.diagnosis || null,
      treatment: data.treatment || null,
      prescription: data.prescription || null,
    }

    try {
      if (isEdit) {
        // Em edição não enviamos appointment_id (não permitimos trocar)
        const { appointment_id, ...updatePayload } = payload
        await updateMedicalRecord(id, updatePayload)
        toast.success('Prontuário atualizado!')
      } else {
        await createMedicalRecord(payload)
        toast.success('Prontuário criado!')
      }
      navigate('/records')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erro ao salvar prontuário'
      toast.error(msg)
    }
  }

  const formatAppointment = (a) => {
    const when = dayjs(a.scheduled_at).format('DD/MM/YYYY HH:mm')
    const patient = a.patient?.name ?? `Paciente #${a.patient_id}`
    return `${when} — ${patient}`
  }

  const appointmentLocked = isEdit || Boolean(presetAppointmentId)

  return (
    <div className="flex-1 p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/records" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Prontuário' : 'Novo Prontuário'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? 'Atualize o registro clínico' : 'Preencha os dados do atendimento'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
        {/* Consulta */}
        <Field label="Consulta *" error={errors.appointment_id?.message}>
          {appointmentLocked && lockedAppointment ? (
            <div className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700">
              {formatAppointment(lockedAppointment)}
            </div>
          ) : (
            <select
              className={inputCls(errors.appointment_id)}
              {...register('appointment_id', { required: 'Selecione uma consulta' })}
            >
              <option value="">Selecione uma consulta...</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {formatAppointment(a)}
                </option>
              ))}
            </select>
          )}
        </Field>

        {/* Queixa */}
        <Field label="Queixa principal *" error={errors.chief_complaint?.message}>
          <textarea
            rows={2}
            placeholder="Motivo principal do atendimento"
            className={`${inputCls(errors.chief_complaint)} resize-none`}
            {...register('chief_complaint', { required: 'Queixa obrigatória' })}
          />
        </Field>

        {/* Hipótese diagnóstica */}
        <Field label="Hipótese diagnóstica" error={errors.diagnosis?.message}>
          <input
            type="text"
            placeholder="Ex.: Cefaleia tensional"
            className={inputCls(errors.diagnosis)}
            {...register('diagnosis')}
          />
        </Field>

        {/* Evolução */}
        <Field label="Evolução / Anamnese" error={errors.evolution?.message}>
          <textarea
            rows={3}
            placeholder="Histórico, exame físico, observações"
            className={`${inputCls(errors.evolution)} resize-none`}
            {...register('evolution')}
          />
        </Field>

        {/* Conduta */}
        <Field label="Conduta" error={errors.treatment?.message}>
          <textarea
            rows={3}
            placeholder="Plano terapêutico, encaminhamentos"
            className={`${inputCls(errors.treatment)} resize-none`}
            {...register('treatment')}
          />
        </Field>

        {/* Prescrição */}
        <Field label="Prescrição" error={errors.prescription?.message}>
          <textarea
            rows={3}
            placeholder="Medicamentos, dosagem, duração"
            className={`${inputCls(errors.prescription)} resize-none`}
            {...register('prescription')}
          />
        </Field>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Link
            to="/records"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Salvando...' : 'Salvar Prontuário'}
          </button>
        </div>
      </form>
    </div>
  )
}
