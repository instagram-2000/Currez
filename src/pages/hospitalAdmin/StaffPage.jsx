import { useEffect, useState } from "react";
import { subscribeUsersByHospital, setUserStatus } from "../../firebase/users";
import { resetPassword } from "../../firebase/auth";
import {
  CREATABLE_STAFF_ROLES_BY_HOSPITAL_ADMIN,
  ROLES,
  ROLE_LABELS,
} from "../../utils/roles";
import StaffFormModal from "../../components/superadmin/StaffFormModal";
import CredentialsDialog from "../../components/superadmin/CredentialsDialog";
import StatusBadge from "../../components/superadmin/StatusBadge";
import DoctorScheduleEditor from "../../components/hospitalAdmin/DoctorScheduleEditor";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";

function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel} className="max-w-sm">
      <h2 className="text-base font-semibold text-heading">{title}</h2>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-line px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
            danger
              ? "bg-red-600 hover:bg-red-500"
              : "bg-indigo-600 hover:bg-indigo-500"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

function StaffPage({ tenantSlug }) {
  const [staff, setStaff] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);
  const [resetSentFor, setResetSentFor] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  // confirmation modal state
  const [confirmAction, setConfirmAction] = useState(null);
  // { type: 'deactivate' | 'reactivate' | 'resetPassword', member: {...} }

  async function executeResetPassword(member) {
    setResetSentFor(null);
    try {
      await resetPassword(member.email);
    } finally {
      setResetSentFor(member.uid);
      setTimeout(() => setResetSentFor(null), 4000);
    }
  }

  function handleConfirm() {
    if (!confirmAction) return;
    const { type, member } = confirmAction;
    if (type === "resetPassword") {
      executeResetPassword(member);
    } else if (type === "deactivate" || type === "reactivate") {
      setUserStatus(member.uid, type === "deactivate" ? "disabled" : "active");
    }
    setConfirmAction(null);
  }

  useEffect(() => subscribeUsersByHospital(tenantSlug, setStaff), [tenantSlug]);

  if (staff === null) return <Spinner />;

  const allStaff = staff.filter(
    (s) => s.role === ROLES.DOCTOR || s.role === ROLES.RECEPTIONIST,
  );

  const activeStaff = allStaff.filter((s) => s.status === "active");
  const inactiveStaff = allStaff.filter((s) => s.status !== "active");
  const visibleStaff = showInactive ? allStaff : activeStaff;

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
        Add doctors and receptionists here. Hospital admin accounts can only be
        created by Currez support.
      </p>

      {/* filter toggle */}
      {inactiveStaff.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="cursor-pointer rounded-lg border border-line px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-card-strong hover:text-heading"
          >
            {showInactive
              ? `Showing all ${allStaff.length} staff`
              : `Show ${inactiveStaff.length} deactivated`}
          </button>
        </div>
      )}

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
              <tr
                key={member.uid}
                className={`transition-colors hover:bg-card-strong ${
                  member.status !== "active" ? "opacity-60" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-heading">
                  {member.displayName}
                  {member.role === ROLES.DOCTOR && member.specialization && (
                    <span className="block text-xs font-normal text-faint">
                      {member.specialization}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{member.email}</td>
                <td className="px-4 py-3 text-muted">
                  {ROLE_LABELS[member.role] || member.role}
                </td>
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
                    onClick={() =>
                      setConfirmAction({ type: "resetPassword", member })
                    }
                    className="mr-4 cursor-pointer text-sm font-medium text-body hover:text-heading"
                  >
                    {resetSentFor === member.uid
                      ? "Reset email sent"
                      : "Reset password"}
                  </button>
                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: member.status === "active" ? "deactivate" : "reactivate",
                        member,
                      })
                    }
                    className="cursor-pointer text-sm font-medium text-body hover:text-heading"
                  >
                    {member.status === "active" ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
            {visibleStaff.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-faint">
                  {showInactive ? "No staff members." : "No active staff."}
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
            setShowAddModal(false);
            setNewCredentials(credentials);
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
        <DoctorScheduleEditor
          doctor={scheduleDoctor}
          onClose={() => setScheduleDoctor(null)}
        />
      )}

      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction.type === "deactivate"
              ? "Deactivate staff member?"
              : confirmAction.type === "reactivate"
              ? "Reactivate staff member?"
              : "Reset password?"
          }
          message={
            confirmAction.type === "deactivate"
              ? `${confirmAction.member.displayName} will lose access to the dashboard. You can reactivate them later.`
              : confirmAction.type === "reactivate"
              ? `${confirmAction.member.displayName} will regain access to the dashboard.`
              : `A password reset email will be sent to ${confirmAction.member.email}.`
          }
          confirmLabel={
            confirmAction.type === "deactivate"
              ? "Deactivate"
              : confirmAction.type === "reactivate"
              ? "Reactivate"
              : "Send reset email"
          }
          danger={confirmAction.type === "deactivate"}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

export default StaffPage;
