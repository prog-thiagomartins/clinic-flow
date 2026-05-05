import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react'
import {
  createAppointment,
  updateAppointment,
  getAppointment,
  getPatients,
  checkAppointmentConflict,
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

const toLocalDateTimeInput = (iso) => {
  if (!iso) return ''
  return dayjs(iso).format('YYYY-MM-DDTHH:mm')
}

export default function AppointmentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [patients, setPatients] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [checkingConflict, setCheckingConflict] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      patient_id: '',
      scheduled_at: '',
      duration_minutes: 30,
      status: 'agendado',
      notes: '',
    },
  })

  const watchedFields = watch(['patient_id', 'scheduled_at', 'duration_minutes'])
  const [watchPatientId, watchScheduledAt, watchDuration] = watchedFields

  useEffect(() => {
    getPatients()
      .then(({ data }) => setPatients(data))
      .catch(() => toast.error('Erro ao carregar pacientes'))
  }, [])

  useEffect(() => {
    if (isEdit) {
      getAppointment(id)
        .then(({ data }) => {
          reset({
            patient_id: data.patient_id,
            scheduled_at: toLocalDateTimeInput(data.scheduled_at),
            duration_minutes: data.duration_minutes,
            status: data.status,
            notes: data.notes ?? '',
          })
        })
        .catch(() => toast.error('Erro ao carregar agendamento'))
    }
  }, [id, isEdit, reset])

  // Verificação de conflito (não-bloqueante) ao mudar paciente/horário/duração
  useEffect(() => {
    if (!watchPatientId || !watchScheduledAt || !watchDuration) {
      setConflicts([])
      return
    }
    const handle = setTimeout(async () => {
      try {
        setCheckingConflict(true)
        const params = {
          patient_id: Number(watchPatientId),
          scheduled_at: dayjs(watchScheduledAt).toISOString(),
          duration_minutes: Number(watchDuration),
        }
        if (isEdit) params.exclude_id = Number(id)
        const { data } = await checkAppointmentConflict(params)
        setConflicts(data.has_conflict ? data.conflicts : [])
      } catch {
        setConflicts([])
      } finally {
        setCheckingConflict(false)
      }
    }, 400)
    return () => clearTimeout(handle)
  }, [watchPatientId, watchScheduledAt, watchDuration, id, isEdit])

  const onSubmit = async (data) => {
    const payload = {
      patient_id: Number(data.patient_id),
      scheduled_at: dayjs(data.scheduled_at).toISOString(),
      duration_minutes: Number(data.duration_minutes),
      status: data.status,
      notes: data.notes || null,
    }

    try {
      if (isEdit) {
        await updateAppointment(id, payload)
        toast.success('Agendamento atualizado!')
      } else {
        await createAppointment(payload)
        toast.success('Agendamento criado!')
      }
      navigate('/appointments')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erro ao salvar agendamento'
      toast.error(msg)
    }
  }

  return (
    <div className="flex-1 p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/appointments" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? 'Atualize os dados da consulta' : 'Preencha os dados para agendar'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
        {/* Paciente */}
        <Field label="Paciente *" error={errors.patient_id?.message}>
          <select
            className={inputCls(errors.patient_id)}
            {...register('patient_id', { required: 'Selecione um paciente' })}
          >
            <option value="">Selecione um paciente...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.cpf}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          {/* Data e hora */}
          <Field label="Data e hora *" error={errors.scheduled_at?.message}>
            <input
              type="datetime-local"
              className={inputCls(errors.scheduled_at)}
              {...register('scheduled_at', { required: 'Data e hora obrigatórias' })}
            />
          </Field>

          {/* Duração */}
          <Field label="Duração (minutos) *" error={errors.duration_minutes?.message}>
            <input
              type="number"
              min={1}
              max={600}
              className={inputCls(errors.duration_minutes)}
              {...register('duration_minutes', {
                required: 'Duração obrigatória',
                valueAsNumber: true,
                min: { value: 1, message: 'Mínimo 1 minuto' },
                max: { value: 600, message: 'Máximo 600 minutos' },
              })}
            />
          </Field>
        </div>

        {/* Status */}
        <Field label="Status" error={errors.status?.message}>
          <select className={inputCls(errors.status)} {...register('status')}>
            <option value="agendado">Agendado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </Field>

        {/* Aviso de conflito (não bloqueia) */}
        {conflicts.length > 0 && (
          <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">
                Conflito de horário detectado
              </p>
              <p className="text-yellow-700 mt-1">
                Este paciente já tem {conflicts.length} agendamento{conflicts.length !== 1 ? 's' : ''} sobrepondo este horário:
              </p>
              <ul className="list-disc ml-5 mt-1 text-yellow-700">
                {conflicts.map((c) => (
                  <li key={c.id}>
                    {dayjs(c.scheduled_at).format('DD/MM/YYYY HH:mm')} ({c.duration_minutes} min)
                  </li>
                ))}
              </ul>
              <p className="text-yellow-700 mt-1 italic">Você pode salvar mesmo assim.</p>
            </div>
          </div>
        )}

        {/* Observações */}
        <Field label="Observações" error={errors.notes?.message}>
          <textarea
            rows={3}
            placeholder="Motivo da consulta, lembretes, etc."
            className={`${inputCls(errors.notes)} resize-none`}
            {...register('notes')}
          />
        </Field>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Link
            to="/appointments"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || checkingConflict}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Salvando...' : 'Salvar Agendamento'}
          </button>
        </div>
      </form>
    </div>
  )
}
