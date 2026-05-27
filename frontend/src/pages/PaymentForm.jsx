import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import {
  createPayment,
  updatePayment,
  getPayment,
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

export default function PaymentForm() {
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      appointment_id: '',
      amount: '',
      status: 'pendente',
      method: '',
      paid_at: '',
      notes: '',
    },
  })

  const statusValue = watch('status')

  // Lista de consultas (só ao criar sem consulta pré-fixada)
  useEffect(() => {
    if (isEdit || presetAppointmentId) return
    getAppointments()
      .then(({ data }) => setAppointments(data))
      .catch(() => toast.error('Erro ao carregar consultas'))
  }, [isEdit, presetAppointmentId])

  // Consulta pré-fixada via query string
  useEffect(() => {
    if (isEdit || !presetAppointmentId) return
    getAppointment(presetAppointmentId)
      .then(({ data }) => {
        setLockedAppointment(data)
        reset((prev) => ({ ...prev, appointment_id: data.id }))
      })
      .catch(() => toast.error('Erro ao carregar consulta'))
  }, [isEdit, presetAppointmentId, reset])

  // Edição: carregar pagamento existente
  useEffect(() => {
    if (!isEdit) return
    getPayment(id)
      .then(({ data }) => {
        setLockedAppointment(data.appointment ?? null)
        reset({
          appointment_id: data.appointment_id,
          amount: data.amount ?? '',
          status: data.status ?? 'pendente',
          method: data.method ?? '',
          paid_at: data.paid_at ? dayjs(data.paid_at).format('YYYY-MM-DDTHH:mm') : '',
          notes: data.notes ?? '',
        })
      })
      .catch(() => toast.error('Erro ao carregar pagamento'))
  }, [id, isEdit, reset])

  const onSubmit = async (data) => {
    const payload = {
      appointment_id: Number(data.appointment_id),
      amount: Number(data.amount),
      status: data.status,
      method: data.method || null,
      paid_at: data.paid_at ? new Date(data.paid_at).toISOString() : null,
      notes: data.notes || null,
    }

    try {
      if (isEdit) {
        const { appointment_id, ...updatePayload } = payload
        await updatePayment(id, updatePayload)
        toast.success('Pagamento atualizado!')
      } else {
        await createPayment(payload)
        toast.success('Pagamento registrado!')
      }
      navigate('/financial')
    } catch (err) {
      const detail = err.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Erro ao salvar pagamento')
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
        <Link to="/financial" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Pagamento' : 'Novo Pagamento'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? 'Atualize os dados do pagamento' : 'Registre o pagamento de uma consulta'}
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
                <option key={a.id} value={a.id}>{formatAppointment(a)}</option>
              ))}
            </select>
          )}
        </Field>

        {/* Valor */}
        <Field label="Valor (R$) *" error={errors.amount?.message}>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            className={inputCls(errors.amount)}
            {...register('amount', {
              required: 'Valor obrigatório',
              validate: (v) => Number(v) > 0 || 'Valor deve ser maior que zero',
            })}
          />
        </Field>

        {/* Status + Forma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Status" error={errors.status?.message}>
            <select className={inputCls(errors.status)} {...register('status')}>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </Field>

          <Field label="Forma de pagamento" error={errors.method?.message}>
            <select className={inputCls(errors.method)} {...register('method')}>
              <option value="">—</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="cartao_debito">Cartão de débito</option>
              <option value="cartao_credito">Cartão de crédito</option>
              <option value="transferencia">Transferência</option>
            </select>
          </Field>
        </div>

        {/* Data do pagamento */}
        <Field label="Data do pagamento" error={errors.paid_at?.message}>
          <input
            type="datetime-local"
            className={inputCls(errors.paid_at)}
            {...register('paid_at')}
          />
          {statusValue === 'pago' && (
            <p className="mt-1 text-xs text-gray-400">
              Se deixar em branco, a data atual será registrada ao salvar.
            </p>
          )}
        </Field>

        {/* Observações */}
        <Field label="Observações" error={errors.notes?.message}>
          <textarea
            rows={3}
            placeholder="Detalhes do pagamento (opcional)"
            className={`${inputCls(errors.notes)} resize-none`}
            {...register('notes')}
          />
        </Field>

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Link
            to="/financial"
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
            {isSubmitting ? 'Salvando...' : 'Salvar Pagamento'}
          </button>
        </div>
      </form>
    </div>
  )
}
