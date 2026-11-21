import { clsx } from 'clsx'
import {
  BarChart3,
  Boxes,
  Building2,
  ChevronRight,
  CreditCard,
  Gift,
  LayoutDashboard,
  LogOut,
  Package,
  PieChart,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers'

const mainNav: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pos', label: 'POS', icon: ShoppingCart },
  { to: '/sales', label: 'Sales', icon: ShoppingBag },
  { to: '/returns', label: 'Returns', icon: ShoppingBag },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/inventory/advanced', label: 'Adv. Inventory', icon: Boxes },
  { to: '/purchases', label: 'Purchases', icon: Truck },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/suppliers', label: 'Suppliers', icon: Store },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/reports', label: 'Reports', icon: PieChart },
  { to: '/employees', label: 'Employees', icon: UsersRound },
  { to: '/promotions', label: 'Promotions', icon: Gift },
  { to: '/branches', label: 'Branches', icon: Building2 },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/subscription', label: 'Subscription', icon: CreditCard },
]

export function AppShell() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#111] text-gray-300">
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">RetailOS</span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {mainNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <hr className="border-white/5" />

        <div className="p-4">
          <Link
            to="/subscription"
            className="block rounded-2xl bg-gradient-to-br from-accent/20 to-amber-600/10 p-4 ring-1 ring-accent/25"
          >
            <div className="flex items-center gap-2 text-accent">
              <Wallet className="h-4 w-4" />
              <p className="text-sm font-semibold text-white">Upgrade Plan</p>
            </div>
            <p className="mt-1 text-xs text-gray-400">Unlock multi-branch & loyalty</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
              Upgrade Now <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out {user?.name ? `(${user.name})` : ''}
          </button>
        </div>
      </aside>

      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        <div className="flex-1 p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
