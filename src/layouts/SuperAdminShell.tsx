import { clsx } from 'clsx'
import { Building2, LayoutDashboard, Layers, LogOut, Shield } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearTokens } from '@/shared/api/client'

const nav = [
  { to: '/super-admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/super-admin/retailers', label: 'Retailers', icon: Building2 },
  { to: '/super-admin/plans', label: 'Plans', icon: Layers },
]

export function SuperAdminShell() {
  const navigate = useNavigate()

  const logout = () => {
    clearTokens()
    navigate('/super-admin/login')
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="flex w-60 flex-col bg-[#0a0a0a] text-gray-400">
        <div className="flex items-center gap-2 border-b border-white/5 p-5">
          <Shield className="h-6 w-6 text-accent" />
          <span className="font-bold text-white">Super Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-white/10 text-accent'
                    : 'hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Exit
        </button>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}