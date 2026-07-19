import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { subscribeHospital } from '../../firebase/hospitals'
import { signOutUser } from '../../firebase/auth'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES, ROLE_LABELS } from '../../utils/roles'
import StatusBadge from '../superadmin/StatusBadge'
import NavIcon from '../common/NavIcon'
import ThemeToggle from '../common/ThemeToggle'

const NAV_ITEMS_BY_ROLE = {
  [ROLES.HOSPITAL_ADMIN]: [
    { to: 'overview', label: 'Overview', icon: 'overview' },
    { to: 'appointments', label: 'Appointments', icon: 'appointments' },
    { to: 'patients', label: 'Patients', icon: 'patients' },
    { to: 'staff', label: 'Staff', icon: 'staff' },
  ],
  [ROLES.RECEPTIONIST]: [
    { to: 'overview', label: 'Overview', icon: 'overview' },
    { to: 'appointments', label: 'Appointments', icon: 'appointments' },
    { to: 'patients', label: 'Patients', icon: 'patients' },
    { to: 'doctors', label: 'Doctors', icon: 'doctors' },
  ],
  [ROLES.DOCTOR]: [
    { to: 'overview', label: 'Overview', icon: 'overview' },
    { to: 'appointments', label: 'My Appointments', icon: 'appointments' },
    { to: 'schedule', label: 'My Schedule', icon: 'schedule' },
  ],
}

function HospitalPortalLayout({ tenantSlug }) {
  const location = useLocation()
  const { user, role } = useAuth()
  const [hospital, setHospital] = useState(undefined)

  useEffect(() => subscribeHospital(tenantSlug, setHospital), [tenantSlug])

  const navItems = NAV_ITEMS_BY_ROLE[role] || []

  return (
    <div className="min-h-screen bg-page text-heading md:flex">
      <aside className="relative overflow-hidden border-b border-line bg-surface md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
        <div className="relative px-6 py-5">
          <span className="block truncate text-sm font-semibold text-heading">
            {hospital?.title || 'Hospital Dashboard'}
          </span>
          <div className="mt-2 flex items-center gap-2">
            {hospital?.status && <StatusBadge status={hospital.status} />}
            <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
              {ROLE_LABELS[role]}
            </span>
          </div>
        </div>
        <nav className="relative flex gap-1 px-3 pb-3 md:flex-col md:pb-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={{ pathname: item.to, search: location.search }}
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
          <Link
            to={{ pathname: '/', search: location.search }}
            className="cursor-pointer text-sm text-muted transition-colors hover:text-heading"
          >
            &larr; View public site
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <span className="hidden text-sm text-muted sm:inline">{user?.email}</span>
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

export default HospitalPortalLayout
