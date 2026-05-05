import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, FileText, User, Calendar } from 'lucide-react'
import { getMedicalRecords, getPatients, deleteMedicalRecord } from '../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const STATUS_LABEL = {
  agendado: 'Agendado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
}

export default function Records() {
  const [records, setRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [patientFilter, setPatientFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const params = patientFilter ? { patient_id: Number(patientFilter) } : {}
      const { data } = await getMedicalRecords(params)
      setRecords(data)
    } catch {
      toast.error('Erro ao carregar prontuários')
    } finally {
      setLoading(false)
    }
  }, [patientFilter])

  useEffect(() => {
    getPatients()
      .then(({ data }) => setPatients(data))
      .catch(() => toast.error('Erro ao carregar pacientes'))
  }, [])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const handleDelete = async (record) => {
    const patientName = record.appointment?.patient?.name || 'paciente'
    if (!confirm(`Remover prontuário de ${patientName}?`)) return
    try {
      await deleteMedicalRecord(record.id)
      toast.success('Prontuário removido!')
      fetchRecords()
    } catch {
      toast.error('Erro ao remover prontuário')
    }
  }

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prontuários</h2>
          <p className="text-sm text-gray-500 mt-1">
            {records.length} registro{records.length !== 1 ? 's' : ''}
            {patientFilter && patients.find(p => p.id === Number(patientFilter)) &&
              ` de ${patients.find(p => p.id === Number(patientFilter)).name}`}
          </p>
        </div>
        <Link
          to="/records/new"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Prontuário
        </Link>
      </div>

      {/* Filtro */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[260px]"
          >
            <option value="">Todos os pacientes</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {patientFilter && (
          <button
            onClick={() => setPatientFilter('')}
            className="px-3 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mr-3" />
          Carregando...
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum prontuário encontrado</p>
          <p className="text-sm mt-1">Clique em "Novo Prontuário" para criar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => {
            const appt = r.appointment
            const patient = appt?.patient
            const date = appt?.scheduled_at ? dayjs(appt.scheduled_at) : null
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-5">
                  {/* Data */}
                  <div className="flex flex-col items-center justify-center w-24 flex-shrink-0 border-r border-gray-100 pr-5">
                    <Calendar className="w-4 h-4 text-primary-600 mb-1" />
                    <span className="font-bold text-gray-900 text-sm">
                      {date ? date.format('DD/MM/YYYY') : '—'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {date ? date.format('HH:mm') : ''}
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 truncate">
                        {patient?.name ?? 'Paciente desconhecido'}
                      </span>
                      {appt?.status && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                          {STATUS_LABEL[appt.status] ?? appt.status}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Queixa: </span>
                        <span className="text-gray-700">{r.chief_complaint}</span>
                      </div>
                      {r.diagnosis && (
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hipótese: </span>
                          <span className="text-gray-700">{r.diagnosis}</span>
                        </div>
                      )}
                      {r.treatment && (
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Conduta: </span>
                          <span className="text-gray-700 line-clamp-2">{r.treatment}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      to={`/records/${r.id}/edit`}
                      className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(r)}
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
