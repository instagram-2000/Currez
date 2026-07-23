import { useState } from 'react'
import { useHospitalData } from '../../contexts/HospitalDataContext'
import { ROLES } from '../../utils/roles'
import DoctorScheduleEditor from '../../components/hospitalAdmin/DoctorScheduleEditor'
import StatusBadge from '../../components/superadmin/StatusBadge'
import NavIcon from '../../components/common/NavIcon'

function DoctorsPage() {
  const { staff } = useHospitalData()
  const [scheduleDoctor, setScheduleDoctor] = useState(null)

  const doctors = staff.filter((s) => s.role === ROLES.DOCTOR)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-heading">Doctors</h1>
        <p className="mt-0.5 text-sm text-muted">View doctor availability before booking an appointment</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <div
            key={doctor.uid}
            className="group rounded-2xl border border-line bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-line-strong"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-lg font-bold text-violet-600 ring-1 ring-inset ring-violet-500/20 dark:text-violet-300">
                {(doctor.displayName || '?')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-heading">{doctor.displayName}</h3>
                  <StatusBadge status={doctor.status} kind="user" />
                </div>
                {doctor.specialization && (
                  <p className="mt-0.5 text-xs text-muted">{doctor.specialization}</p>
                )}
                {doctor.email && (
                  <p className="mt-0.5 truncate text-xs text-faint">{doctor.email}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end border-t border-line pt-3">
              <button
                onClick={() => setScheduleDoctor(doctor)}
                className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-muted transition-colors hover:text-heading"
              >
                <NavIcon name="schedule" className="h-3.5 w-3.5" />
                View schedule
              </button>
            </div>
          </div>
        ))}
        {doctors.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-line bg-card px-5 py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-strong">
                <NavIcon name="doctors" className="h-6 w-6 text-faint" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted">No doctors added yet</p>
              <p className="mt-1 text-xs text-faint">Add doctors through the Staff page</p>
            </div>
          </div>
        )}
      </div>

      {scheduleDoctor && (
        <DoctorScheduleEditor doctor={scheduleDoctor} readOnly onClose={() => setScheduleDoctor(null)} />
      )}
    </div>
  )
}

export default DoctorsPage
