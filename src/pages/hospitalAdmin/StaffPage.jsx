import { useEffect, useState } from 'react'
import { subscribeUsersByHospital, setUserStatus } from '../../firebase/users'
import { resetPassword } from '../../firebase/auth'
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
  const [resetSentFor, setResetSentFor] = useState(null)

  async function handleResetPassword(member) {
    setResetSentFor(null)
    try {
      await resetPassword(member.email)
    } finally {
      setResetSentFor(member.uid)
      setTimeout(() => setResetSentFor(null), 4000)
    }
  }

  useEffect(() => subscribeUsersByHospital(tenantSlug, setStaff), [tenantSlug])

  if (staff === null) return <Spinner />

  const visibleStaff = staff.filter((s) => s.role === ROLES.DOCTOR || s.role === ROLES.RECEPTIONIST)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-heading">Staff</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          + Add Staff
        </button>
      </div>
      <p className="mt-1 text-sm text-muted">
        Add doctors and receptionists here. Hospital admin accounts can only be created by MediDesk support.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="text-left text-xs font-medium uppercase tracking-wide text-faint">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visibleStaff.map((member) => (
              <tr key={member.uid} className="transition-colors hover:bg-card-strong">
                <td className="px-4 py-3 font-medium text-heading">
                  {member.displayName}
                  {member.role === ROLES.DOCTOR && member.specialization && (
                    <span className="block text-xs font-normal text-faint">{member.specialization}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{member.email}</td>
                <td className="px-4 py-3 text-muted">{ROLE_LABELS[member.role] || member.role}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={member.status} kind="user" />
                </td>
                <td className="px-4 py-3 text-right">
                  {member.role === ROLES.DOCTOR && (
                    <button
                      onClick={() => setScheduleDoctor(member)}
                      className="mr-4 cursor-pointer text-sm font-medium text-body hover:text-heading"
                    >
                      Schedule
                    </button>
                  )}
                  <button
                    onClick={() => handleResetPassword(member)}
                    className="mr-4 cursor-pointer text-sm font-medium text-body hover:text-heading"
                  >
                    {resetSentFor === member.uid ? 'Reset email sent' : 'Reset password'}
                  </button>
                  <button
                    onClick={() => setUserStatus(member.uid, member.status === 'active' ? 'disabled' : 'active')}
                    className="cursor-pointer text-sm font-medium text-body hover:text-heading"
                  >
                    {member.status === 'active' ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
            {visibleStaff.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-faint">
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
