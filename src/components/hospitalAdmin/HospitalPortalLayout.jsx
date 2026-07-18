import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { subscribeHospital } from '../../firebase/hospitals'
import { signOutUser } from '../../firebase/auth'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES, ROLE_LABELS } from '../../utils/roles'
import StatusBadge from '../superadmin/StatusBadge'

const NAV_ITEMS_BY_ROLE = {
  [ROLES.HOSPITAL_ADMIN]: [
    { to: 'overview', label: 'Overview' },
    { to: 'appointments', label: 'Appointments' },
    { to: 'patients', label: 'Patients' },
    { to: 'staff', label: 'Staff' },
  ],
  [ROLES.RECEPTIONIST]: [
    { to: 'overview', label: 'Overview' },
    { to: 'appointments', label: 'Appointments' },
    { to: 'patients', label: 'Patients' },
    { to: 'doctors', label: 'Doctors' },
  ],
  [ROLES.DOCTOR]: [
    { to: 'overview', label: 'Overview' },
    { to: 'appointments', label: 'My Appointments' },
    { to: 'schedule', label: 'My Schedule' },
  ],
}

function HospitalPortalLayout({ tenantSlug }) {
  const location = useLocation()
  const { user, role } = useAuth()
  const [hospital, setHospital] = useState(undefined)

  useEffect(() => subscribeHospital(tenantSlug, setHospital), [tenantSlug])

  const navItems = NAV_ITEMS_BY_ROLE[role] || []

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="border-b border-slate-200 bg-white md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="px-6 py-5">
          <span className="block text-base font-semibold text-slate-900">
            {hospital?.title || 'Hospital Dashboard'}
          </span>
          <div className="mt-2 flex items-center gap-2">
            {hospital?.status && <StatusBadge status={hospital.status} />}
            <span className="text-xs font-medium text-slate-400">{ROLE_LABELS[role]}</span>
          </div>
        </div>
        <nav className="flex gap-1 px-3 pb-3 md:flex-col md:pb-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={{ pathname: item.to, search: location.search }}
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
          <Link
            to={{ pathname: '/', search: location.search }}
            className="cursor-pointer text-sm text-slate-500 hover:text-slate-700"
          >
            &larr; View public site
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user?.email}</span>
            <button
              onClick={() => signOutUser()}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default HospitalPortalLayout
