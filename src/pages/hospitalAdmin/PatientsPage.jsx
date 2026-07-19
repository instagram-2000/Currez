import { useEffect, useState } from 'react'
import { subscribePatients } from '../../firebase/patients'
import { subscribeUsersByHospital } from '../../firebase/users'
import { ROLES } from '../../utils/roles'
import PatientFormModal from '../../components/hospitalAdmin/PatientFormModal'
import BookAppointmentModal from '../../components/hospitalAdmin/BookAppointmentModal'
import Spinner from '../../components/common/Spinner'

function PatientsPage({ tenantSlug }) {
  const [patients, setPatients] = useState(null)
  const [staff, setStaff] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [bookingForPatientId, setBookingForPatientId] = useState(null)

  useEffect(() => subscribePatients(tenantSlug, setPatients), [tenantSlug])
  useEffect(() => subscribeUsersByHospital(tenantSlug, setStaff), [tenantSlug])

  const doctors = staff.filter((s) => s.role === ROLES.DOCTOR && s.status === 'active')

  if (patients === null) return <Spinner />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-heading">Patients</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          + Add Patient
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="text-left text-xs font-medium uppercase tracking-wide text-faint">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {patients.map((patient) => (
              <tr key={patient.id} className="transition-colors hover:bg-card-strong">
                <td className="px-4 py-3 font-medium text-heading">{patient.name}</td>
                <td className="px-4 py-3 text-muted">{patient.phone || '—'}</td>
                <td className="px-4 py-3 text-muted">{patient.email || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setBookingForPatientId(patient.id)}
                    className="cursor-pointer text-sm font-medium text-body hover:text-heading"
                  >
                    Book appointment
                  </button>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-faint">
                  No patients yet.
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
