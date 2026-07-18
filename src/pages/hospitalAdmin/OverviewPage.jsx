import { useEffect, useState } from 'react'
import { subscribeHospital } from '../../firebase/hospitals'
import { subscribeAppointments } from '../../firebase/appointments'
import { subscribePatients } from '../../firebase/patients'
import { subscribeUsersByHospital } from '../../firebase/users'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../utils/roles'
import StatCard from '../../components/superadmin/StatCard'
import StatusBadge from '../../components/superadmin/StatusBadge'
import Spinner from '../../components/common/Spinner'
import DoctorOverviewPage from './DoctorOverviewPage'

const todayString = () => new Date().toISOString().slice(0, 10)

// Dispatches to a doctor-specific view — a doctor's "overview" is their
// own day, not hospital-wide numbers.
function OverviewPage({ tenantSlug }) {
  const { role } = useAuth()
  if (role === ROLES.DOCTOR) return <DoctorOverviewPage tenantSlug={tenantSlug} />
  return <HospitalOverview tenantSlug={tenantSlug} />
}

function HospitalOverview({ tenantSlug }) {
  const [hospital, setHospital] = useState(undefined)
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [staff, setStaff] = useState([])

  useEffect(() => subscribeHospital(tenantSlug, setHospital), [tenantSlug])
  useEffect(() => subscribeAppointments(tenantSlug, setAppointments), [tenantSlug])
  useEffect(() => subscribePatients(tenantSlug, setPatients), [tenantSlug])
  useEffect(() => subscribeUsersByHospital(tenantSlug, setStaff), [tenantSlug])

  if (hospital === undefined) return <Spinner />

  const today = todayString()
  const todaysAppointments = appointments.filter((a) => a.date === today).length
  const doctorCount = staff.filter((s) => s.role === ROLES.DOCTOR && s.status === 'active').length

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
      <p className="mt-1 text-sm text-slate-500">Today's snapshot for {hospital?.title}.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Today's Appointments" value={todaysAppointments} />
        <StatCard label="Doctors" value={doctorCount} />
        <StatCard label="Patients" value={patients.length} />
      </div>

      {hospital && (
        <div className="mt-8 max-w-lg rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Hospital details</h2>
            <StatusBadge status={hospital.status} />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Name</dt>
              <dd className="text-right text-slate-900">{hospital.title}</dd>
            </div>
            {hospital.footer?.address && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Address</dt>
                <dd className="text-right text-slate-900">{hospital.footer.address}</dd>
              </div>
            )}
            {hospital.footer?.phone && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Phone</dt>
                <dd className="text-right text-slate-900">{hospital.footer.phone}</dd>
              </div>
            )}
            {hospital.footer?.email && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Email</dt>
                <dd className="text-right text-slate-900">{hospital.footer.email}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  )
}

export default OverviewPage
