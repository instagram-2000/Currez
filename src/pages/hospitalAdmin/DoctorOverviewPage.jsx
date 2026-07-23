import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useHospitalData } from '../../contexts/HospitalDataContext'
import { todayDateString } from '../../utils/dates'
import CompleteVisitModal from '../../components/hospitalAdmin/CompleteVisitModal'
import NavIcon from '../../components/common/NavIcon'

const STATUS_STYLES = {
  scheduled: 'bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400',
  completed: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400',
  cancelled: 'bg-card-strong text-muted ring-line',
}

function DoctorOverviewPage() {
  const location = useLocation()
  const { user } = useAuth()
  const { appointments } = useHospitalData()
  const [completingAppt, setCompletingAppt] = useState(null)
  const [viewingAppt, setViewingAppt] = useState(null)

  const today = todayDateString()
  const mine = appointments.filter(
    (a) => a.doctorId === user.uid && a.status !== 'pending' && a.date >= today
  )
  const todaysAppointments = mine.filter((a) => a.date === today)
  const upcoming = mine.filter((a) => a.date > today && a.status === 'scheduled')

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600 p-6 sm:p-8 text-white shadow-xl shadow-violet-500/20">
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium text-violet-100">Welcome back</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Dr. {user.displayName || user.email}</h1>
          <p className="mt-2 text-sm text-violet-100/80">
            You have <span className="font-semibold text-white">{todaysAppointments.length} appointments</span> today
            {upcoming.length > 0 && <> and <span className="font-semibold text-white">{upcoming.length} upcoming</span></>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 ring-1 ring-inset ring-sky-500/20">
              <NavIcon name="appointments" className="h-5 w-5 text-sky-600 dark:text-sky-300" />
            </div>
            <div>
              <p className="text-sm text-muted">Today's Appointments</p>
              <p className="text-2xl font-bold text-heading">{todaysAppointments.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-inset ring-violet-500/20">
              <NavIcon name="schedule" className="h-5 w-5 text-violet-600 dark:text-violet-300" />
            </div>
            <div>
              <p className="text-sm text-muted">Upcoming</p>
              <p className="text-2xl font-bold text-heading">{upcoming.length}</p>
            </div>
          </div>
        </div>
      </div>

      <Link
        to={{ pathname: '/dashboard/schedule', search: location.search }}
        className="group inline-flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-3 text-sm font-medium text-heading transition-all hover:border-indigo-500/30 hover:shadow-sm hover:shadow-indigo-500/5"
      >
        <NavIcon name="schedule" className="h-4 w-4 text-muted group-hover:text-indigo-500" />
        Manage my schedule
        <NavIcon name="arrowLeft" className="ml-auto h-4 w-4 rotate-180 text-faint transition-transform group-hover:translate-x-0.5" />
      </Link>

      <div className="rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-heading">Today's Appointments</h2>
        </div>
        <div className="divide-y divide-line">
          {todaysAppointments.map((appt) => (
            <div key={appt.id} className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-card-strong/50">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-strong text-sm font-bold text-muted">
                  {appt.time || '—'}
                </div>
                <div>
                  <p className="text-sm font-medium text-heading">{appt.patientName}</p>
                  <p className="text-xs text-faint">{appt.status === 'completed' ? 'Completed' : 'Scheduled'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${
                  STATUS_STYLES[appt.status] || STATUS_STYLES.scheduled
                }`}>
                  {appt.status}
                </span>
                {appt.status === 'scheduled' && (
                  <button
                    onClick={() => setCompletingAppt(appt)}
                    className="cursor-pointer rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                  >
                    Complete
                  </button>
                )}
                {appt.status === 'completed' && (
                  <button
                    onClick={() => setViewingAppt(appt)}
                    className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-card-strong hover:text-heading"
                  >
                    View notes
                  </button>
                )}
              </div>
            </div>
          ))}
          {todaysAppointments.length === 0 && (
            <div className="px-5 py-16 text-center">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-strong">
                  <NavIcon name="appointments" className="h-6 w-6 text-faint" />
                </div>
                <p className="mt-3 text-sm font-medium text-muted">No appointments today</p>
                <p className="mt-1 text-xs text-faint">Enjoy your free day</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {completingAppt && (
        <CompleteVisitModal
          appointment={completingAppt}
          onClose={() => setCompletingAppt(null)}
          onCompleted={() => setCompletingAppt(null)}
        />
      )}

      {viewingAppt && (
        <CompleteVisitModal appointment={viewingAppt} readOnly onClose={() => setViewingAppt(null)} />
      )}
    </div>
  )
}

export default DoctorOverviewPage
