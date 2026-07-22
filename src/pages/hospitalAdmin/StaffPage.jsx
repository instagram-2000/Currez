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
import { PageSpinner } from "../../components/common/Spinner";
import ConfirmModal from "../../components/common/ConfirmModal";
import NavIcon from "../../components/common/NavIcon";

function StaffPage({ tenantSlug }) {
  const [staff, setStaff] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);
  const [resetSentFor, setResetSentFor] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

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

  if (staff === null) return <PageSpinner />;

  const allStaff = staff.filter(
    (s) => s.role === ROLES.DOCTOR || s.role === ROLES.RECEPTIONIST,
  );

  const activeStaff = allStaff.filter((s) => s.status === "active");
  const inactiveStaff = allStaff.filter((s) => s.status !== "active");
  const visibleStaff = showInactive ? allStaff : activeStaff;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-heading">Staff</h1>
          <p className="mt-0.5 text-sm text-muted">
            {activeStaff.length} active staff member{activeStaff.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 active:scale-[0.98]"
        >
          <NavIcon name="staff" className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {inactiveStaff.length > 0 && (
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl border border-line px-3.5 py-2 text-xs font-medium text-muted transition-all hover:bg-card-strong hover:text-heading"
        >
          <NavIcon name={showInactive ? "eye" : "eyeOff"} className="h-3.5 w-3.5" />
          {showInactive
            ? `Showing all ${allStaff.length} staff`
            : `Show ${inactiveStaff.length} deactivated`}
        </button>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-sm">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead>
            <tr className="border-b border-line bg-card-strong/30">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-faint">Name</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-faint">Email</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-faint">Role</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-faint">Status</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-faint">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visibleStaff.map((member) => (
              <tr
                key={member.uid}
                className={`group transition-colors hover:bg-card-strong/50 ${
                  member.status !== "active" ? "opacity-60" : ""
                }`}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 ring-1 ring-inset ring-violet-500/20 dark:text-violet-300">
                      {(member.displayName || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-heading">{member.displayName}</span>
                      {member.role === ROLES.DOCTOR && member.specialization && (
                        <span className="block text-xs text-faint">{member.specialization}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted">{member.email}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-lg bg-card-strong px-2.5 py-1 text-xs font-medium text-muted">
                    {ROLE_LABELS[member.role] || member.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={member.status} kind="user" />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {member.role === ROLES.DOCTOR && (
                      <button
                        onClick={() => setScheduleDoctor(member)}
                        className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-card-strong hover:text-heading"
                      >
                        Schedule
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setConfirmAction({ type: "resetPassword", member })
                      }
                      className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-card-strong hover:text-heading"
                    >
                      {resetSentFor === member.uid ? "Sent" : "Reset password"}
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({
                          type: member.status === "active" ? "deactivate" : "reactivate",
                          member,
                        })
                      }
                      className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        member.status === "active"
                          ? "text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                          : "text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                      }`}
                    >
                      {member.status === "active" ? "Deactivate" : "Reactivate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleStaff.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-strong">
                      <NavIcon name="staff" className="h-6 w-6 text-faint" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-muted">
                      {showInactive ? "No staff members." : "No active staff."}
                    </p>
                  </div>
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
