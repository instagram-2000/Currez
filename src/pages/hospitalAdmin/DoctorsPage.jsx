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
      <h1 className="text-xl font-semibold text-slate-900">Doctors</h1>
      <p className="mt-1 text-sm text-slate-500">View doctor availability before booking an appointment.</p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Specialization</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doctors.map((doctor) => (
              <tr key={doctor.uid} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{doctor.displayName}</td>
                <td className="px-4 py-3 text-slate-500">{doctor.specialization || '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={doctor.status} kind="user" />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setScheduleDoctor(doctor)}
                    className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    View schedule
                  </button>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
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
