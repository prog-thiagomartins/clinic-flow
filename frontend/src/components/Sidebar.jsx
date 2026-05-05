import { NavLink } from 'react-router-dom'
import { Users, Calendar, FileText, DollarSign, Activity } from 'lucide-react'

const navItems = [
  { to: '/patients', icon: Users,    label: 'Pacientes' },
  { to: '/appointments', icon: Calendar,  label: 'Agendamentos' },
  { to: '/records',   icon: FileText,  label: 'Prontuários',  soon: true },
  { to: '/financial', icon: DollarSign, label: 'Financeiro',   soon: true },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">ClinicFlow</h1>
            <p className="text-xs text-gray-500 mt-0.5">Gestão de Consultório</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, soon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
              ${soon ? 'opacity-50 pointer-events-none' : ''}`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
            {soon && (
              <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                Em breve
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">ClinicFlow v1.1 — AC2</p>
      </div>
    </aside>
  )
}
