import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { subscribeAppointments, updateAppointmentStatus } from '../../firebase/appointments'
import { useAuth } from '../../contexts/AuthContext'
import StatCard from '../../components/superadmin/StatCard'

const todayString = () => new Date().toISOString().slice(0, 10)

const STATUS_STYLES = {
  scheduled: 'bg-sky-50 text-sky-700 ring-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 ring-slate-200',
}

function DoctorOverviewPage({ tenantSlug }) {
  const location = useLocation()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])

  useEffect(() => subscribeAppointments(tenantSlug, setAppointments), [tenantSlug])

  const mine = appointments.filter((a) => a.doctorId === user.uid)
  const today = todayString()
  const todaysAppointments = mine.filter((a) => a.date === today)
  const upcoming = mine.filter((a) => a.date > today && a.status === 'scheduled')

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
      <p className="mt-1 text-sm text-slate-500">Your day at a glance.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Today's Appointments" value={todaysAppointments.length} />
        <StatCard label="Upcoming Appointments" value={upcoming.length} />
      </div>

      <div className="mt-4">
        <Link
          to={{ pathname: '/dashboard/schedule', search: location.search }}
          className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Manage my schedule &rarr;
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-900">Today's appointments</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todaysAppointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">{appt.time}</td>
                  <td className="px-4 py-3 text-slate-900">{appt.patientName}</td>
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
                        onClick={() => updateAppointmentStatus(appt.id, 'completed')}
                        className="cursor-pointer text-sm font-medium text-emerald-600 hover:text-emerald-800"
                      >
                        Mark completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {todaysAppointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No appointments today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DoctorOverviewPage
