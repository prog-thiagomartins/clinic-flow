import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, DollarSign, User, Calendar, TrendingUp, Clock } from 'lucide-react'
import { getPayments, getPatients, deletePayment, getPaymentSummary } from '../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const STATUS_STYLES = {
  pendente:  { label: 'Pendente',  cls: 'bg-yellow-100 text-yellow-700' },
  pago:      { label: 'Pago',      cls: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', cls: 'bg-gray-200 text-gray-600 line-through' },
}

const METHOD_LABEL = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao_debito: 'Cartão de débito',
  cartao_credito: 'Cartão de crédito',
  transferencia: 'Transferência',
}

const formatBRL = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Financial() {
  const [payments, setPayments] = useState([])
  const [patients, setPatients] = useState([])
  const [summary, setSummary] = useState({ total_received: 0, total_pending: 0, count_paid: 0, count_pending: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [patientFilter, setPatientFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (patientFilter) params.patient_id = Number(patientFilter)
      const { data } = await getPayments(params)
      setPayments(data)
    } catch {
      toast.error('Erro ao carregar pagamentos')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, patientFilter])

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await getPaymentSummary()
      setSummary(data)
    } catch {
      /* resumo é informativo; ignora erro */
    }
  }, [])

  useEffect(() => {
    getPatients()
      .then(({ data }) => setPatients(data))
      .catch(() => toast.error('Erro ao carregar pacientes'))
  }, [])

  useEffect(() => { fetchPayments() }, [fetchPayments])
  useEffect(() => { fetchSummary() }, [fetchSummary])

  const handleDelete = async (payment) => {
    const patientName = payment.appointment?.patient?.name || 'paciente'
    if (!confirm(`Remover pagamento de ${patientName}?`)) return
    try {
      await deletePayment(payment.id)
      toast.success('Pagamento removido!')
      fetchPayments()
      fetchSummary()
    } catch {
      toast.error('Erro ao remover pagamento')
    }
  }

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financeiro</h2>
          <p className="text-sm text-gray-500 mt-1">
            {payments.length} pagamento{payments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/financial/new"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Pagamento
        </Link>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard icon={TrendingUp} color="text-green-600"   bg="bg-green-50"   label="Recebido"             value={formatBRL(summary.total_received)} />
        <SummaryCard icon={Clock}      color="text-yellow-600"  bg="bg-yellow-50"  label="Pendente"             value={formatBRL(summary.total_pending)} />
        <SummaryCard icon={DollarSign} color="text-primary-600" bg="bg-primary-50" label="Consultas pagas"      value={summary.count_paid} />
        <SummaryCard icon={DollarSign} color="text-gray-500"    bg="bg-gray-100"   label="Consultas pendentes"  value={summary.count_pending} />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[240px]"
          >
            <option value="">Todos os pacientes</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {(statusFilter || patientFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setPatientFilter('') }}
            className="px-3 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mr-3" />
          Carregando...
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum pagamento encontrado</p>
          <p className="text-sm mt-1">Clique em "Novo Pagamento" para registrar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const appt = p.appointment
            const patient = appt?.patient
            const date = appt?.scheduled_at ? dayjs(appt.scheduled_at) : null
            const status = STATUS_STYLES[p.status] ?? STATUS_STYLES.pendente
            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-5">
                  {/* Valor + status */}
                  <div className="flex flex-col items-center justify-center w-28 flex-shrink-0 border-r border-gray-100 pr-5">
                    <span className="font-bold text-gray-900 text-lg">{formatBRL(p.amount)}</span>
                    <span className={`mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 truncate">
                        {patient?.name ?? 'Paciente desconhecido'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {date ? date.format('DD/MM/YYYY HH:mm') : '—'}
                      </span>
                      {p.method && <span>• {METHOD_LABEL[p.method] ?? p.method}</span>}
                      {p.paid_at && <span>• pago em {dayjs(p.paid_at).format('DD/MM/YYYY')}</span>}
                    </div>
                    {p.notes && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.notes}</p>}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      to={`/financial/${p.id}/edit`}
                      className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon: Icon, color, bg, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}
