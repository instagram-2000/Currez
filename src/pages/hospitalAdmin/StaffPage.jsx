import { useEffect, useState } from 'react'
import { subscribeUsersByHospital, setUserStatus } from '../../firebase/users'
import { CREATABLE_STAFF_ROLES_BY_HOSPITAL_ADMIN, ROLES, ROLE_LABELS } from '../../utils/roles'
import StaffFormModal from '../../components/superadmin/StaffFormModal'
import CredentialsDialog from '../../components/superadmin/CredentialsDialog'
import StatusBadge from '../../components/superadmin/StatusBadge'
import DoctorScheduleEditor from '../../components/hospitalAdmin/DoctorScheduleEditor'
import Spinner from '../../components/common/Spinner'

function StaffPage({ tenantSlug }) {
  const [staff, setStaff] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCredentials, setNewCredentials] = useState(null)
  const [scheduleDoctor, setScheduleDoctor] = useState(null)

  useEffect(() => subscribeUsersByHospital(tenantSlug, setStaff), [tenantSlug])

  if (staff === null) return <Spinner />

  const visibleStaff = staff.filter((s) => s.role === ROLES.DOCTOR || s.role === ROLES.RECEPTIONIST)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">Staff</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Add Staff
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Add doctors and receptionists here. Hospital admin accounts can only be created by MediDesk support.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleStaff.map((member) => (
              <tr key={member.uid} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {member.displayName}
                  {member.role === ROLES.DOCTOR && member.specialization && (
                    <span className="block text-xs font-normal text-slate-400">{member.specialization}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">{member.email}</td>
                <td className="px-4 py-3 text-slate-500">{ROLE_LABELS[member.role] || member.role}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={member.status} kind="user" />
                </td>
                <td className="px-4 py-3 text-right">
                  {member.role === ROLES.DOCTOR && (
                    <button
                      onClick={() => setScheduleDoctor(member)}
                      className="mr-4 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Schedule
                    </button>
                  )}
                  <button
                    onClick={() => setUserStatus(member.uid, member.status === 'active' ? 'disabled' : 'active')}
                    className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    {member.status === 'active' ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
            {visibleStaff.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No staff added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <StaffFormModal
          hospitalId={tenantSlug}
          allowedRoles={CREATABLE_STAFF_ROLES_BY_HOSPITAL_ADMIN}
          onCancel={() => setShowAddModal(false)}
          onCreated={(credentials) => {
            setShowAddModal(false)
            setNewCredentials(credentials)
          }}
        />
      )}

      {newCredentials && (
        <CredentialsDialog
          email={newCredentials.email}
          password={newCredentials.password}
          onClose={() => setNewCredentials(null)}
        />
      )}

      {scheduleDoctor && (
        <DoctorScheduleEditor doctor={scheduleDoctor} onClose={() => setScheduleDoctor(null)} />
      )}
    </div>
  )
}

export default StaffPage
