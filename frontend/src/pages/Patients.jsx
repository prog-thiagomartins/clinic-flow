import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Pencil, Trash2, User, Phone, Mail } from 'lucide-react'
import { getPatients, deletePatient } from '../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await getPatients(search)
      setPatients(data)
    } catch {
      toast.error('Erro ao carregar pacientes')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timeout = setTimeout(fetchPatients, 300)
    return () => clearTimeout(timeout)
  }, [fetchPatients])

  const handleDelete = async (patient) => {
    if (!confirm(`Remover o paciente ${patient.name}?`)) return
    try {
      await deletePatient(patient.id)
      toast.success('Paciente removido com sucesso!')
      fetchPatients()
    } catch {
      toast.error('Erro ao remover paciente')
    }
  }

  const age = (birth) => dayjs().diff(dayjs(birth), 'year')

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
          <p className="text-sm text-gray-500 mt-1">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} cadastrado{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/patients/new"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Paciente
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mr-3" />
          Carregando...
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum paciente encontrado</p>
          <p className="text-sm mt-1">Comece cadastrando seu primeiro paciente</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Paciente</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">CPF</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Idade</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Contato</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Cadastro</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-semibold text-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">{p.cpf}</td>
                  <td className="px-6 py-4 text-gray-600">{age(p.birth_date)} anos</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Phone className="w-3 h-3" />{p.phone}
                      </span>
                      {p.email && (
                        <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Mail className="w-3 h-3" />{p.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {dayjs(p.created_at).format('DD/MM/YYYY')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        to={`/patients/${p.id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
