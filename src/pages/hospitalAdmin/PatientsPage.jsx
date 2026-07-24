import { useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useHospitalData } from '../../contexts/HospitalDataContext'
import { ROLES } from '../../utils/roles'
import { canEditModule } from '../../utils/permissions'
import PatientFormModal from '../../components/hospitalAdmin/PatientFormModal'
import BookAppointmentModal from '../../components/hospitalAdmin/BookAppointmentModal'
import NavIcon from '../../components/common/NavIcon'
import Pagination from '../../components/common/Pagination'

function PatientsPage({ tenantSlug }) {
  const { userDoc } = useAuth()
  const canEdit = canEditModule(userDoc, 'patients')
  const { patients, staff } = useHospitalData()
  const [showAddModal, setShowAddModal] = useState(false)
  const [bookingForPatientId, setBookingForPatientId] = useState(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_SIZE = 10

  const doctors = staff.filter((s) => s.role === ROLES.DOCTOR && s.status === 'active')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.phone?.toLowerCase().includes(q)
    )
  }, [patients, search])

  const paginatedPatients = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-heading">Patients</h1>
          <p className="mt-0.5 text-sm text-muted">{patients.length} registered patient{patients.length !== 1 ? 's' : ''}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <NavIcon name="patients" className="h-4 w-4" />
            Add Patient
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search by patient name or phone..."
        value={search}
        onChange={handleSearchChange}
        className="w-full max-w-sm rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-heading placeholder:text-faint focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
      />

      {/* Mobile: stacked cards instead of a horizontally-scrolling table. */}
      <div className="space-y-3 md:hidden">
        {paginatedPatients.map((patient) => (
          <div key={patient.id} className="rounded-2xl border border-line bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 ring-1 ring-inset ring-indigo-500/20 dark:text-indigo-300">
                {(patient.name || '?')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-heading">{patient.name}</p>
                <p className="truncate text-xs text-faint">{patient.phone || '—'}{patient.email ? ` · ${patient.email}` : ''}</p>
              </div>
            </div>
            {canEdit && (
              <button
                onClick={() => setBookingForPatientId(patient.id)}
                className="mt-3 w-full cursor-pointer rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
              >
                Book appointment
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-line bg-card px-5 py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-strong">
                <NavIcon name="patients" className="h-6 w-6 text-faint" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted">No patients found</p>
            </div>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Desktop: full table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-card shadow-sm md:block">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead>
            <tr className="border-b border-line bg-card-strong/30">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-faint">Name</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-faint">Phone</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-faint">Email</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-faint">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {paginatedPatients.map((patient) => (
              <tr key={patient.id} className="group transition-colors hover:bg-card-strong/50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 ring-1 ring-inset ring-indigo-500/20 dark:text-indigo-300">
                      {(patient.name || '?')[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-heading">{patient.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted">{patient.phone || '—'}</td>
                <td className="px-5 py-3.5 text-muted">{patient.email || '—'}</td>
                <td className="px-5 py-3.5 text-right">
                  {canEdit && (
                    <button
                      onClick={() => setBookingForPatientId(patient.id)}
                      className="cursor-pointer rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
                    >
                      Book appointment
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-strong">
                      <NavIcon name="patients" className="h-6 w-6 text-faint" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-muted">
                      {patients.length === 0 ? 'No patients yet' : 'No patients found'}
                    </p>
                    <p className="mt-1 text-xs text-faint">
                      {patients.length === 0
                        ? canEdit
                          ? 'Add your first patient to get started'
                          : 'You have view-only access to patients'
                        : 'Try a different search'}
                    </p>
                    {canEdit && patients.length === 0 && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500"
                      >
                        + Add Patient
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <PatientFormModal
          hospitalId={tenantSlug}
          onCancel={() => setShowAddModal(false)}
          onCreated={() => setShowAddModal(false)}
        />
      )}

      {bookingForPatientId && (
        <BookAppointmentModal
          hospitalId={tenantSlug}
          patients={patients}
          doctors={doctors}
          preselectedPatientId={bookingForPatientId}
          onCancel={() => setBookingForPatientId(null)}
          onCreated={() => setBookingForPatientId(null)}
        />
      )}
    </div>
  )
}

export default PatientsPage
