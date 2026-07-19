import { useEffect, useMemo, useState } from 'react'
import { subscribeAppointments, updateAppointmentStatus } from '../../firebase/appointments'
import { subscribePatients } from '../../firebase/patients'
import { subscribeUsersByHospital } from '../../firebase/users'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../utils/roles'
import BookAppointmentModal from '../../components/hospitalAdmin/BookAppointmentModal'
import ConfirmPaymentModal from '../../components/hospitalAdmin/ConfirmPaymentModal'
import CompleteVisitModal from '../../components/hospitalAdmin/CompleteVisitModal'
import Spinner from '../../components/common/Spinner'

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-600 ring-amber-500/30 dark:text-amber-400',
  scheduled: 'bg-sky-500/10 text-sky-600 ring-sky-500/30 dark:text-sky-400',
  completed: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400',
  cancelled: 'bg-card-strong text-muted ring-line',
}

const STATUS_LABELS = {
  pending: 'Pending confirmation',
  scheduled: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const PAYMENT_LABELS = { cash: 'Cash', online: 'Online' }

function AppointmentStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        STATUS_STYLES[status] || STATUS_STYLES.scheduled
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function AppointmentsPage({ tenantSlug }) {
  const { role, user } = useAuth()
  const isDoctor = role === ROLES.DOCTOR
  const canBook = role === ROLES.HOSPITAL_ADMIN || role === ROLES.RECEPTIONIST
  const canConfirm = canBook
  // Notes are clinical — visible to the doctor who wrote them and to the
  // hospital admin for oversight, but not to reception.
  const canViewNotes = isDoctor || role === ROLES.HOSPITAL_ADMIN

  const [appointments, setAppointments] = useState(null)
  const [patients, setPatients] = useState([])
  const [staff, setStaff] = useState([])
  const [search, setSearch] = useState('')
  const [showBookModal, setShowBookModal] = useState(false)
  const [confirmingAppointment, setConfirmingAppointment] = useState(null)
  const [completingAppt, setCompletingAppt] = useState(null)
  const [viewingAppt, setViewingAppt] = useState(null)

  useEffect(() => subscribeAppointments(tenantSlug, setAppointments), [tenantSlug])
  useEffect(() => subscribePatients(tenantSlug, setPatients), [tenantSlug])
  useEffect(() => subscribeUsersByHospital(tenantSlug, setStaff), [tenantSlug])

  const doctors = staff.filter((s) => s.role === ROLES.DOCTOR && s.status === 'active')

  const visible = useMemo(() => {
    if (!appointments) return []
    let list = isDoctor
      ? appointments.filter((a) => a.doctorId === user.uid && a.status !== 'pending')
      : appointments
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
        <h1 className="text-xl font-semibold text-heading">{isDoctor ? 'My Appointments' : 'Appointments'}</h1>
        {canBook && (
          <button
            onClick={() => setShowBookModal(true)}
            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
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
        className="mt-4 w-full max-w-sm rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading placeholder:text-faint focus:border-line-strong focus:outline-none sm:w-72"
      />

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="text-left text-xs font-medium uppercase tracking-wide text-faint">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Patient</th>
              {!isDoctor && <th className="px-4 py-3">Doctor</th>}
              <th className="px-4 py-3">Status</th>
              {!isDoctor && <th className="px-4 py-3">Payment</th>}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((appt) => (
              <tr key={appt.id} className="transition-colors hover:bg-card-strong">
                <td className="px-4 py-3 text-heading">{appt.date}</td>
                <td className="px-4 py-3 text-muted">{appt.time}</td>
                <td className="px-4 py-3 text-heading">
                  {appt.patientName}
                  {appt.patientPhone && (
                    <span className="block text-xs font-normal text-faint">{appt.patientPhone}</span>
                  )}
                </td>
                {!isDoctor && (
                  <td className="px-4 py-3 text-muted">{appt.doctorName || 'Unassigned'}</td>
                )}
                <td className="px-4 py-3">
                  <AppointmentStatusBadge status={appt.status} />
                </td>
                {!isDoctor && (
                  <td className="px-4 py-3 text-muted">{PAYMENT_LABELS[appt.paymentMethod] || '—'}</td>
                )}
                <td className="px-4 py-3 text-right">
                  {appt.status === 'pending' && canConfirm && (
                    <button
                      onClick={() => setConfirmingAppointment(appt)}
                      className="cursor-pointer text-sm font-medium text-heading hover:underline"
                    >
                      Confirm
                    </button>
                  )}
                  {appt.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() =>
                          isDoctor ? setCompletingAppt(appt) : updateAppointmentStatus(appt.id, 'completed')
                        }
                        className="mr-4 cursor-pointer text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                      >
                        Mark completed
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'cancelled')}
                        className="cursor-pointer text-sm font-medium text-red-500 hover:text-red-400"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {appt.status === 'completed' && canViewNotes && (
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
            {visible.length === 0 && (
              <tr>
                <td colSpan={isDoctor ? 5 : 7} className="px-4 py-8 text-center text-faint">
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

      {confirmingAppointment && (
        <ConfirmPaymentModal
          appointment={confirmingAppointment}
          doctors={doctors}
          onClose={() => setConfirmingAppointment(null)}
        />
      )}

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

export default AppointmentsPage
