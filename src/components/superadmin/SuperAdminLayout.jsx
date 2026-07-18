import { NavLink, Outlet } from 'react-router-dom'
import { signOutUser } from '../../firebase/auth'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/superadmin/dashboard', label: 'Dashboard' },
  { to: '/superadmin/hospitals', label: 'Hospitals' },
]

function SuperAdminLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="border-b border-slate-200 bg-white md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="px-6 py-5">
          <span className="text-base font-semibold text-slate-900">MediDesk Admin</span>
        </div>
        <nav className="flex gap-1 px-3 pb-3 md:flex-col md:pb-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `cursor-pointer rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <span className="text-sm text-slate-500">{user?.email}</span>
          <button
            onClick={() => signOutUser()}
            className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Logout
          </button>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout
