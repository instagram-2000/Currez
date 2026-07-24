import { useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useHospitalData } from '../../contexts/HospitalDataContext'
import { ROLES } from '../../utils/roles'
import PrescriptionDocument from '../../components/hospitalAdmin/PrescriptionDocument'
import NavIcon from '../../components/common/NavIcon'
import Pagination from '../../components/common/Pagination'

// Deliberately reads straight off `appointments` (via the same shared
// HospitalDataContext window used everywhere else) instead of a dedicated
// `prescriptions` collection — see the "why no rule" note in firestore.rules
// next to the /invoices block. This page is a presentation layer over the
// `concerns`/`prescription`/`tests` fields CompleteVisitModal already
// writes; nothing here is new data that needs protecting.
function PrescriptionsPage() {
  const { role, user } = useAuth()
  const isDoctor = role === ROLES.DOCTOR
  const { hospital, appointments, staff } = useHospitalData()

  const [search, setSearch] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('all')
  const [viewingId, setViewingId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_SIZE = 10

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

  const paginatedVisible = useMemo(
    () => visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [visible, currentPage]
  )

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }
  const handleDoctorFilterChange = (e) => {
    setDoctorFilter(e.target.value)
    setCurrentPage(1)
  }

  const viewingAppointment = viewingId ? visible.find((a) => a.id === viewingId) || null : null

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
          onChange={handleSearchChange}
          className="w-full max-w-sm rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-heading placeholder:text-faint focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
        />
        {!isDoctor && (
          <select
            value={doctorFilter}
            onChange={handleDoctorFilterChange}
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

      {/* Mobile: stacked cards instead of a horizontally-scrolling table. */}
      <div className="space-y-3 md:hidden">
        {paginatedVisible.map((appt) => (
          <div key={appt.id} className="rounded-2xl border border-line bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-heading">{appt.patientName}</p>
                {appt.patientPhone && <p className="text-xs text-faint">{appt.patientPhone}</p>}
              </div>
              <p className="shrink-0 text-right text-xs text-muted">
                {appt.date}
                {appt.time && <span className="block text-faint">{appt.time}</span>}
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs">
              {!isDoctor && <span className="text-muted">{appt.doctorName || 'Unassigned'}</span>}
              <span className="inline-flex items-center rounded-lg bg-card-strong px-2 py-0.5 font-medium text-muted">
                {(appt.prescription || []).length} medicine{(appt.prescription || []).length === 1 ? '' : 's'}
              </span>
              <span className="inline-flex items-center rounded-lg bg-card-strong px-2 py-0.5 font-medium text-muted">
                {(appt.tests || []).length} test{(appt.tests || []).length === 1 ? '' : 's'}
              </span>
            </div>

            <button
              onClick={() => setViewingId(appt.id)}
              className="mt-3 w-full cursor-pointer rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
            >
              View
            </button>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-line bg-card px-5 py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-strong">
                <NavIcon name="prescription" className="h-6 w-6 text-faint" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted">No prescriptions found</p>
              <p className="mt-1 text-xs text-faint">
                These appear once a doctor completes a visit with notes, medicines or tests
              </p>
            </div>
          </div>
        )}
      </div>

      {visible.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={visible.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Desktop: full table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-card shadow-sm md:block">
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
            {paginatedVisible.map((appt) => (
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
