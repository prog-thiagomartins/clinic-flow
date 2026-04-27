import { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { createPatient, updatePatient, getPatient } from '../services/api'
import toast from 'react-hot-toast'

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

export default function PatientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (isEdit) {
      getPatient(id)
        .then(({ data }) => reset({ ...data, birth_date: data.birth_date }))
        .catch(() => toast.error('Erro ao carregar paciente'))
    }
  }, [id, isEdit, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updatePatient(id, data)
        toast.success('Paciente atualizado!')
      } else {
        await createPatient(data)
        toast.success('Paciente cadastrado!')
      }
      navigate('/patients')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erro ao salvar paciente'
      toast.error(msg)
    }
  }

  return (
    <div className="flex-1 p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/patients" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Paciente' : 'Novo Paciente'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? 'Atualize os dados do paciente' : 'Preencha os dados para cadastrar'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
        {/* Nome */}
        <Field label="Nome completo *" error={errors.name?.message}>
          <input
            type="text"
            placeholder="Ex: Maria Silva"
            className={inputCls(errors.name)}
            {...register('name', { required: 'Nome é obrigatório' })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          {/* CPF */}
          <Field label="CPF *" error={errors.cpf?.message}>
            <input
              type="text"
              placeholder="000.000.000-00"
              className={inputCls(errors.cpf)}
              {...register('cpf', {
                required: 'CPF é obrigatório',
                pattern: { value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, message: 'CPF inválido' }
              })}
            />
          </Field>

          {/* Data nascimento */}
          <Field label="Data de nascimento *" error={errors.birth_date?.message}>
            <input
              type="date"
              className={inputCls(errors.birth_date)}
              {...register('birth_date', { required: 'Data de nascimento obrigatória' })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Telefone */}
          <Field label="Telefone *" error={errors.phone?.message}>
            <input
              type="text"
              placeholder="(11) 99999-9999"
              className={inputCls(errors.phone)}
              {...register('phone', { required: 'Telefone é obrigatório' })}
            />
          </Field>

          {/* E-mail */}
          <Field label="E-mail" error={errors.email?.message}>
            <input
              type="email"
              placeholder="email@exemplo.com"
              className={inputCls(errors.email)}
              {...register('email')}
            />
          </Field>
        </div>

        {/* Endereço */}
        <Field label="Endereço" error={errors.address?.message}>
          <input
            type="text"
            placeholder="Rua, número, bairro, cidade"
            className={inputCls(errors.address)}
            {...register('address')}
          />
        </Field>

        {/* Observações */}
        <Field label="Observações / Anotações" error={errors.notes?.message}>
          <textarea
            rows={3}
            placeholder="Alergias, histórico relevante, etc."
            className={`${inputCls(errors.notes)} resize-none`}
            {...register('notes')}
          />
        </Field>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Link
            to="/patients"
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
            {isSubmitting ? 'Salvando...' : 'Salvar Paciente'}
          </button>
        </div>
      </form>
    </div>
  )
}
