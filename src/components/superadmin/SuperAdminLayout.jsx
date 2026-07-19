import { NavLink, Outlet } from 'react-router-dom'
import { signOutUser } from '../../firebase/auth'
import { useAuth } from '../../contexts/AuthContext'
import NavIcon from '../common/NavIcon'
import ThemeToggle from '../common/ThemeToggle'

const NAV_ITEMS = [
  { to: '/superadmin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/superadmin/hospitals', label: 'Hospitals', icon: 'hospitals' },
]

function SuperAdminLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-page text-heading md:flex">
      <aside className="relative overflow-hidden border-b border-line bg-surface md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
        <div className="relative px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-sm font-bold text-indigo-600 ring-1 ring-indigo-500/30 dark:text-indigo-300">
              M
            </span>
            <div>
              <span className="block text-sm font-semibold text-heading">MediDesk</span>
              <span className="block text-[11px] uppercase tracking-wide text-faint">Super Admin</span>
            </div>
          </div>
        </div>
        <nav className="relative flex gap-1 px-3 pb-3 md:flex-col md:pb-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-600 ring-1 ring-inset ring-indigo-500/30 dark:text-indigo-300'
                    : 'text-muted hover:bg-card-strong hover:text-heading'
                }`
              }
            >
              <NavIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-line bg-surface/60 px-6 py-4 backdrop-blur">
          <span className="text-sm text-muted">{user?.email}</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => signOutUser()}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-card-strong hover:text-heading"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout
