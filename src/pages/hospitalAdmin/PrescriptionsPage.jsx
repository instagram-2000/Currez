import { useEffect, useMemo, useState } from 'react'
import { subscribeHospital } from '../../firebase/hospitals'
import { subscribeAppointments } from '../../firebase/appointments'
import { subscribeUsersByHospital } from '../../firebase/users'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../utils/roles'
import { shiftDateString } from '../../utils/dates'
import PrescriptionDocument from '../../components/hospitalAdmin/PrescriptionDocument'
import { PageSpinner } from '../../components/common/Spinner'
import NavIcon from '../../components/common/NavIcon'

// Looks back a year — a "prescription history," not a live operational
// list like Appointments, so it deliberately favors a wide window over the
// tight ±7 days that page uses.
const HISTORY_WINDOW_DAYS = 365

// Deliberately reads straight off `appointments` (via the same
// subscribeAppointments already used everywhere else) instead of a
// dedicated `prescriptions` collection — see the "why no rule" note in
// firestore.rules next to the /invoices block. This page is a presentation
// layer over the `concerns`/`prescription`/`tests` fields CompleteVisitModal
// already writes; nothing here is new data that needs protecting.
function PrescriptionsPage({ tenantSlug }) {
  const { role, user } = useAuth()
  const isDoctor = role === ROLES.DOCTOR

  const [hospital, setHospital] = useState(undefined)
  const [appointments, setAppointments] = useState(null)
  const [staff, setStaff] = useState([])
  const [search, setSearch] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('all')
  const [viewingId, setViewingId] = useState(null)

  useEffect(() => subscribeHospital(tenantSlug, setHospital), [tenantSlug])
  const windowStart = shiftDateString(-HISTORY_WINDOW_DAYS)
  useEffect(() => subscribeAppointments(tenantSlug, setAppointments, windowStart), [tenantSlug, windowStart])
  useEffect(() => subscribeUsersByHospital(tenantSlug, setStaff), [tenantSlug])

  const doctorsById = useMemo(
    () => Object.fromEntries(staff.filter((s) => s.role === ROLES.DOCTOR).map((d) => [d.uid, d])),
    [staff]
  )
  const doctors = useMemo(() => staff.filter((s) => s.role === ROLES.DOCTOR), [staff])

  const visible = useMemo(() => {
    if (!appointments) return []
    let list = appointments.filter(
      (a) => a.status === 'completed' && (a.concerns || a.prescription?.length || a.tests?.length)
    )
    if (isDoctor) {
      list = list.filter((a) => a.doctorId === user.uid)
    } else if (doctorFilter !== 'all') {
      list = list.filter((a) => a.doctorId === doctorFilter)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (a) => a.patientName?.toLowerCase().includes(q) || a.patientPhone?.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => `${b.date}T${b.time || ''}`.localeCompare(`${a.date}T${a.time || ''}`))
  }, [appointments, isDoctor, user?.uid, doctorFilter, search])

  const viewingAppointment = viewingId ? visible.find((a) => a.id === viewingId) || null : null

  if (appointments === null || hospital === undefined) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-heading">Prescriptions</h1>
        <p className="mt-0.5 text-sm text-muted">
          {isDoctor ? 'Your prescription history across every completed visit' : 'Prescription history for every doctor at this hospital'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by patient name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-heading placeholder:text-faint focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
        />
        {!isDoctor && (
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-heading focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
          >
            <option value="all">All doctors</option>
            {doctors.map((d) => (
              <option key={d.uid} value={d.uid}>
                {d.displayName}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-sm">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead>
            <tr className="border-b border-line bg-card-strong/30">
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Date</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Patient</th>
              {!isDoctor && <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Doctor</th>}
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Medicines</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Tests</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wider text-faint uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((appt) => (
              <tr key={appt.id} className="group transition-colors hover:bg-card-strong/50">
                <td className="px-5 py-3.5 whitespace-nowrap text-muted">
                  {appt.date}
                  {appt.time && <span className="ml-1 text-xs text-faint">{appt.time}</span>}
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-heading">{appt.patientName}</div>
                  {appt.patientPhone && <div className="text-xs text-faint">{appt.patientPhone}</div>}
                </td>
                {!isDoctor && <td className="px-5 py-3.5 text-muted">{appt.doctorName || 'Unassigned'}</td>}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-lg bg-card-strong px-2 py-0.5 text-xs font-medium text-muted">
                    {(appt.prescription || []).length}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-lg bg-card-strong px-2 py-0.5 text-xs font-medium text-muted">
                    {(appt.tests || []).length}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => setViewingId(appt.id)}
                    className="cursor-pointer rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={isDoctor ? 5 : 6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-strong">
                      <NavIcon name="prescription" className="h-6 w-6 text-faint" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-muted">No prescriptions found</p>
                    <p className="mt-1 text-xs text-faint">
                      These appear once a doctor completes a visit with notes, medicines or tests
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingAppointment && (
        <PrescriptionDocument
          appointment={viewingAppointment}
          hospital={hospital}
          doctor={viewingAppointment.doctorId ? doctorsById[viewingAppointment.doctorId] : null}
          onClose={() => setViewingId(null)}
        />
      )}
    </div>
  )
}

export default PrescriptionsPage
