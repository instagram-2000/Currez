import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHospitalCounts, subscribeHospitals } from '../../firebase/hospitals'
import { getStaffCount } from '../../firebase/users'
import StatCard from '../../components/superadmin/StatCard'
import StatusBadge from '../../components/superadmin/StatusBadge'
import { PageSpinner } from '../../components/common/Spinner'
import NavIcon from '../../components/common/NavIcon'

function DashboardPage() {
  const [counts, setCounts] = useState(null)
  const [staffCount, setStaffCount] = useState(null)
  const [hospitals, setHospitals] = useState(null)

  useEffect(() => {
    getHospitalCounts().then(setCounts)
    getStaffCount().then(setStaffCount)
  }, [])
  useEffect(() => subscribeHospitals(setHospitals), [])

  if (!counts || staffCount === null) return <PageSpinner />

  const recent = (hospitals || []).slice(0, 6)
  const greetingTime = new Date().getHours()
  const greeting = greetingTime < 12 ? 'Good morning' : greetingTime < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-8">
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5 blur-xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-100">{greeting}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Control Center</h1>
            <p className="mt-2 max-w-lg text-sm text-indigo-100/80">
              Overseeing <span className="font-semibold text-white">{counts.total} hospital{counts.total !== 1 ? 's' : ''}</span> and{' '}
              <span className="font-semibold text-white">{staffCount} staff account{staffCount !== 1 ? 's' : ''}</span> across the platform.
            </p>
          </div>
          <Link
            to="/superadmin/hospitals/new"
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/25 ring-inset backdrop-blur-sm transition-all hover:bg-white/25 active:scale-[0.98]"
          >
            <NavIcon name="hospitals" className="h-4 w-4" />
            Onboard hospital
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Hospitals" value={counts.total} hint="All time onboarded" icon="hospitals" />
        <StatCard label="Trial" value={counts.trial} hint="Evaluating the platform" icon="dashboard" />
        <StatCard label="Ongoing" value={counts.active} hint="Live, paying accounts" icon="schedule" />
        <StatCard label="Total Staff" value={staffCount} hint="Across every hospital" icon="staff" />
      </div>

      <div className="rounded-2xl border border-line bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-heading">Recently onboarded</h2>
          <Link
            to="/superadmin/hospitals"
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-heading"
          >
            View all
            <NavIcon name="arrowLeft" className="h-3 w-3 rotate-180" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-strong">
              <NavIcon name="hospitals" className="h-6 w-6 text-faint" />
            </div>
            <p className="mt-3 text-sm font-medium text-muted">No hospitals yet</p>
            <p className="mt-1 text-xs text-faint">Onboard your first hospital to get started</p>
            <Link
              to="/superadmin/hospitals/new"
              className="mt-4 cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500"
            >
              + Onboard hospital
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {recent.map((hospital) => (
              <Link
                key={hospital.slug}
                to={`/superadmin/hospitals/${hospital.slug}`}
                className="group flex items-center justify-between gap-3 rounded-xl bg-card-strong/50 px-4 py-2.5 transition-colors hover:bg-card-strong"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 ring-1 ring-indigo-500/20 ring-inset dark:text-indigo-300">
                    {(hospital.title || '?')[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-heading">{hospital.title}</p>
                    <p className="truncate text-xs text-faint">{hospital.slug}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={hospital.status} />
                  <NavIcon name="arrowLeft" className="h-3.5 w-3.5 rotate-180 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
