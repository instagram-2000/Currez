import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { subscribeAppointments } from '../../firebase/appointments'
import { useAuth } from '../../contexts/AuthContext'
import StatCard from '../../components/superadmin/StatCard'
import CompleteVisitModal from '../../components/hospitalAdmin/CompleteVisitModal'

const todayString = () => new Date().toISOString().slice(0, 10)

const STATUS_STYLES = {
  scheduled: 'bg-sky-500/10 text-sky-600 ring-sky-500/30 dark:text-sky-400',
  completed: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400',
  cancelled: 'bg-card-strong text-muted ring-line',
}

function DoctorOverviewPage({ tenantSlug }) {
  const location = useLocation()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [completingAppt, setCompletingAppt] = useState(null)
  const [viewingAppt, setViewingAppt] = useState(null)

  const today = todayString()
  useEffect(() => subscribeAppointments(tenantSlug, setAppointments, today), [tenantSlug, today])

  // Doctors only ever see confirmed appointments — pending (unconfirmed by
  // reception) ones are invisible to them by design.
  const mine = appointments.filter((a) => a.doctorId === user.uid && a.status !== 'pending')
  const todaysAppointments = mine.filter((a) => a.date === today)
  const upcoming = mine.filter((a) => a.date > today && a.status === 'scheduled')

  return (
    <div>
      <h1 className="text-xl font-semibold text-heading">Overview</h1>
      <p className="mt-1 text-sm text-muted">Your day at a glance.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Today's Appointments" value={todaysAppointments.length} icon="appointments" />
        <StatCard label="Upcoming Appointments" value={upcoming.length} icon="schedule" />
      </div>

      <div className="mt-4">
        <Link
          to={{ pathname: '/dashboard/schedule', search: location.search }}
          className="cursor-pointer text-sm font-medium text-body hover:text-heading"
        >
          Manage my schedule &rarr;
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-heading">Today's appointments</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="text-left text-xs font-medium uppercase tracking-wide text-faint">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {todaysAppointments.map((appt) => (
                <tr key={appt.id} className="transition-colors hover:bg-card-strong">
                  <td className="px-4 py-3 text-heading">{appt.time}</td>
                  <td className="px-4 py-3 text-heading">{appt.patientName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
                        STATUS_STYLES[appt.status] || STATUS_STYLES.scheduled
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {appt.status === 'scheduled' && (
                      <button
                        onClick={() => setCompletingAppt(appt)}
                        className="cursor-pointer text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                      >
                        Mark completed
                      </button>
                    )}
                    {appt.status === 'completed' && (
                      <button
                        onClick={() => setViewingAppt(appt)}
                        className="cursor-pointer text-sm font-medium text-body hover:text-heading"
                      >
                        View notes
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {todaysAppointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-faint">
                    No appointments today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
