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
        <h1 className="text-xl font-semibold text-slate-900">Patients</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Add Patient
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{patient.name}</td>
                <td className="px-4 py-3 text-slate-500">{patient.phone || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{patient.email || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setBookingForPatientId(patient.id)}
                    className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Book appointment
                  </button>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
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
