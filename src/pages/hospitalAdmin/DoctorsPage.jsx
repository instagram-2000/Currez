import { useEffect, useState } from 'react'
import { subscribeUsersByHospital } from '../../firebase/users'
import { ROLES } from '../../utils/roles'
import DoctorScheduleEditor from '../../components/hospitalAdmin/DoctorScheduleEditor'
import StatusBadge from '../../components/superadmin/StatusBadge'
import Spinner from '../../components/common/Spinner'

function DoctorsPage({ tenantSlug }) {
  const [staff, setStaff] = useState(null)
  const [scheduleDoctor, setScheduleDoctor] = useState(null)

  useEffect(() => subscribeUsersByHospital(tenantSlug, setStaff), [tenantSlug])

  if (staff === null) return <Spinner />

  const doctors = staff.filter((s) => s.role === ROLES.DOCTOR)

  return (
    <div>
      <h1 className="text-xl font-semibold text-heading">Doctors</h1>
      <p className="mt-1 text-sm text-muted">View doctor availability before booking an appointment.</p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="text-left text-xs font-medium uppercase tracking-wide text-faint">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Specialization</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {doctors.map((doctor) => (
              <tr key={doctor.uid} className="transition-colors hover:bg-card-strong">
                <td className="px-4 py-3 font-medium text-heading">{doctor.displayName}</td>
                <td className="px-4 py-3 text-muted">{doctor.specialization || '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={doctor.status} kind="user" />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setScheduleDoctor(doctor)}
                    className="cursor-pointer text-sm font-medium text-body hover:text-heading"
                  >
                    View schedule
                  </button>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-faint">
                  No doctors added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {scheduleDoctor && (
        <DoctorScheduleEditor doctor={scheduleDoctor} readOnly onClose={() => setScheduleDoctor(null)} />
      )}
    </div>
  )
}

export default DoctorsPage
