import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Calendar, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAppointments, deleteAppointment } from '../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const STATUS_STYLES = {
  agendado:  { label: 'Agendado',  cls: 'bg-blue-100 text-blue-700' },
  realizado: { label: 'Realizado', cls: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', cls: 'bg-gray-200 text-gray-600 line-through' },
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const params = { date: selectedDate }
      if (statusFilter) params.status = statusFilter
      const { data } = await getAppointments(params)
      setAppointments(data)
    } catch {
      toast.error('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, statusFilter])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const handleDelete = async (appt) => {
    const time = dayjs(appt.scheduled_at).format('HH:mm')
    if (!confirm(`Remover o agendamento de ${appt.patient?.name} às ${time}?`)) return
    try {
      await deleteAppointment(appt.id)
      toast.success('Agendamento removido!')
      fetchAppointments()
    } catch {
      toast.error('Erro ao remover agendamento')
    }
  }

  const shiftDay = (delta) => {
    setSelectedDate(dayjs(selectedDate).add(delta, 'day').format('YYYY-MM-DD'))
  }

  const formatHumanDate = (d) => {
    const day = dayjs(d)
    const today = dayjs().startOf('day')
    const diff = day.startOf('day').diff(today, 'day')
    if (diff === 0) return 'Hoje'
    if (diff === 1) return 'Amanhã'
    if (diff === -1) return 'Ontem'
    return day.format('dddd, DD/MM/YYYY')
  }

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agendamentos</h2>
          <p className="text-sm text-gray-500 mt-1">
            {appointments.length} consulta{appointments.length !== 1 ? 's' : ''} para {formatHumanDate(selectedDate)}
          </p>
        </div>
        <Link
          to="/appointments/new"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Link>
      </div>

      {/* Date navigator + filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => shiftDay(-1)}
            className="p-2.5 hover:bg-gray-50 text-gray-500 transition-colors"
            aria-label="Dia anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-3 py-2.5 text-sm border-x border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => shiftDay(1)}
            className="p-2.5 hover:bg-gray-50 text-gray-500 transition-colors"
            aria-label="Próximo dia"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setSelectedDate(dayjs().format('YYYY-MM-DD'))}
          className="px-3 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hoje
        </button>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos os status</option>
          <option value="agendado">Agendado</option>
          <option value="realizado">Realizado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mr-3" />
          Carregando...
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum agendamento neste dia</p>
          <p className="text-sm mt-1">Clique em "Novo Agendamento" para criar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => {
            const start = dayjs(a.scheduled_at)
            const end = start.add(a.duration_minutes, 'minute')
            const status = STATUS_STYLES[a.status] ?? STATUS_STYLES.agendado
            return (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5"
              >
                {/* Hora */}
                <div className="flex flex-col items-center justify-center w-20 flex-shrink-0 border-r border-gray-100 pr-5">
                  <Clock className="w-4 h-4 text-primary-600 mb-1" />
                  <span className="font-bold text-gray-900">{start.format('HH:mm')}</span>
                  <span className="text-xs text-gray-400">{end.format('HH:mm')}</span>
                </div>

                {/* Paciente + notas */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">
                      {a.patient?.name ?? `Paciente #${a.patient_id}`}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{a.duration_minutes} min</span>
                    {a.patient?.phone && <span>• {a.patient.phone}</span>}
                  </div>
                  {a.notes && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{a.notes}</p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    to={`/appointments/${a.id}/edit`}
                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(a)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
