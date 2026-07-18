import { useEffect, useMemo, useState } from 'react'
import { subscribeAppointments, updateAppointmentStatus } from '../../firebase/appointments'
import { subscribePatients } from '../../firebase/patients'
import { subscribeUsersByHospital } from '../../firebase/users'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../utils/roles'
import BookAppointmentModal from '../../components/hospitalAdmin/BookAppointmentModal'
import Spinner from '../../components/common/Spinner'

const STATUS_STYLES = {
  scheduled: 'bg-sky-50 text-sky-700 ring-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 ring-slate-200',
}

function AppointmentStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
        STATUS_STYLES[status] || STATUS_STYLES.scheduled
      }`}
    >
      {status}
    </span>
  )
}

function AppointmentsPage({ tenantSlug }) {
  const { role, user } = useAuth()
  const isDoctor = role === ROLES.DOCTOR
  const canBook = role === ROLES.HOSPITAL_ADMIN || role === ROLES.RECEPTIONIST

  const [appointments, setAppointments] = useState(null)
  const [patients, setPatients] = useState([])
  const [staff, setStaff] = useState([])
  const [search, setSearch] = useState('')
  const [showBookModal, setShowBookModal] = useState(false)

  useEffect(() => subscribeAppointments(tenantSlug, setAppointments), [tenantSlug])
  useEffect(() => subscribePatients(tenantSlug, setPatients), [tenantSlug])
  useEffect(() => subscribeUsersByHospital(tenantSlug, setStaff), [tenantSlug])

  const doctors = staff.filter((s) => s.role === ROLES.DOCTOR && s.status === 'active')

  const visible = useMemo(() => {
    if (!appointments) return []
    let list = isDoctor ? appointments.filter((a) => a.doctorId === user.uid) : appointments
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (a) => a.patientName?.toLowerCase().includes(q) || a.patientPhone?.toLowerCase().includes(q)
      )
    }
    return list
  }, [appointments, isDoctor, user.uid, search])

  if (appointments === null) return <Spinner />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">{isDoctor ? 'My Appointments' : 'Appointments'}</h1>
        {canBook && (
          <button
            onClick={() => setShowBookModal(true)}
            className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            + Book Appointment
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search by patient name or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none sm:w-72"
      />

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Patient</th>
              {!isDoctor && <th className="px-4 py-3">Doctor</th>}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((appt) => (
              <tr key={appt.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-900">{appt.date}</td>
                <td className="px-4 py-3 text-slate-500">{appt.time}</td>
                <td className="px-4 py-3 text-slate-900">
                  {appt.patientName}
                  {appt.patientPhone && (
                    <span className="block text-xs font-normal text-slate-400">{appt.patientPhone}</span>
                  )}
                </td>
                {!isDoctor && <td className="px-4 py-3 text-slate-500">{appt.doctorName}</td>}
                <td className="px-4 py-3">
                  <AppointmentStatusBadge status={appt.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {appt.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'completed')}
                        className="mr-4 cursor-pointer text-sm font-medium text-emerald-600 hover:text-emerald-800"
                      >
                        Mark completed
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'cancelled')}
                        className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={isDoctor ? 5 : 6} className="px-4 py-8 text-center text-slate-400">
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showBookModal && (
        <BookAppointmentModal
          hospitalId={tenantSlug}
          patients={patients}
          doctors={doctors}
          onCancel={() => setShowBookModal(false)}
          onCreated={() => setShowBookModal(false)}
        />
      )}
    </div>
  )
}

export default AppointmentsPage
