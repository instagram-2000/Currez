import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { subscribeHospital } from '../../firebase/hospitals'
// subscribeDoctor is a plain users/{uid} subscription with no role filter —
// the name predates this page but it works for any staff member, not just doctors.
import { subscribeDoctor, setUserStatus, setUserModulePermission } from '../../firebase/users'
import { resetPassword } from '../../firebase/auth'
import { ROLES, ROLE_LABELS } from '../../utils/roles'
import {
  PERMISSION_MODULES,
  PERMISSION_LEVELS,
  PERMISSION_LEVEL_LABELS,
  getModulePermission,
} from '../../utils/permissions'
import StatusBadge from '../../components/superadmin/StatusBadge'
import { PageSpinner } from '../../components/common/Spinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import NavIcon from '../../components/common/NavIcon'

function StaffProfilePage() {
  const { slug, uid } = useParams()
  const [hospital, setHospital] = useState(undefined)
  const [staffMember, setStaffMember] = useState(undefined)
  const [resetSent, setResetSent] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [savingModule, setSavingModule] = useState(null)

  useEffect(() => subscribeHospital(slug, setHospital), [slug])
  useEffect(() => subscribeDoctor(uid, setStaffMember), [uid])

  if (hospital === undefined || staffMember === undefined) return <PageSpinner />

  if (hospital === null || !staffMember || staffMember.hospitalId !== slug) {
    return (
      <div className="max-w-3xl">
        <Link
          to="/superadmin/hospitals"
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-heading"
        >
          <NavIcon name="arrowLeft" className="h-4 w-4" />
          Back to hospitals
        </Link>
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-card px-5 py-16 text-center">
          <p className="text-sm font-medium text-muted">This staff member could not be found.</p>
        </div>
      </div>
    )
  }

  const isOverridable = staffMember.role === ROLES.DOCTOR || staffMember.role === ROLES.RECEPTIONIST

  async function handleSetLevel(moduleKey, level) {
    setSavingModule(moduleKey)
    try {
      await setUserModulePermission(uid, moduleKey, level)
    } finally {
      setSavingModule(null)
    }
  }

  async function handleResetPassword() {
    setResetSent(false)
    try {
      await resetPassword(staffMember.email)
    } finally {
      setResetSent(true)
      setTimeout(() => setResetSent(false), 4000)
    }
  }

  function handleConfirmStatusChange() {
    if (!confirmAction) return
    setUserStatus(uid, confirmAction === 'deactivate' ? 'disabled' : 'active')
    setConfirmAction(null)
  }

  return (
    <div className="max-w-3xl">
      <Link
        to={`/superadmin/hospitals/${slug}`}
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-heading"
      >
        <NavIcon name="arrowLeft" className="h-4 w-4" />
        Back to {hospital.title}
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-lg font-bold text-violet-600 ring-1 ring-violet-500/20 ring-inset dark:text-violet-300">
            {(staffMember.displayName || '?')[0].toUpperCase()}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-heading">{staffMember.displayName}</h1>
            <p className="text-sm text-muted">{staffMember.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-lg bg-card-strong px-2.5 py-1 text-xs font-medium text-muted">
            {ROLE_LABELS[staffMember.role] || staffMember.role}
          </span>
          <StatusBadge status={staffMember.status} kind="user" />
        </div>
      </div>

      {staffMember.role === ROLES.DOCTOR && staffMember.specialization && (
        <p className="mt-2 text-sm text-muted">{staffMember.specialization}</p>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold text-heading">Account</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={handleResetPassword}
            className="cursor-pointer rounded-xl border border-line px-3.5 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading"
          >
            {resetSent ? 'Reset email sent' : 'Send password reset'}
          </button>
          <button
            onClick={() => setConfirmAction(staffMember.status === 'active' ? 'deactivate' : 'reactivate')}
            className={`cursor-pointer rounded-xl border border-line px-3.5 py-2 text-sm font-medium transition-colors ${
              staffMember.status === 'active'
                ? 'text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400'
                : 'text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400'
            }`}
          >
            {staffMember.status === 'active' ? 'Deactivate' : 'Reactivate'}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold text-heading">Module permissions</h2>
        {!isOverridable ? (
          <p className="mt-2 text-sm text-muted">
            {ROLE_LABELS[staffMember.role] || staffMember.role} accounts always have full access to every
            module their role covers — there's nothing to restrict here.
          </p>
        ) : (
          <>
            <p className="mt-0.5 text-sm text-muted">
              Control exactly what {staffMember.displayName} can see and do in each module. This only ever
              narrows what their {ROLE_LABELS[staffMember.role]} role already allows — it can't grant access
              to a module their role, or this hospital's enabled modules, don't already cover.
            </p>
            <div className="mt-4 divide-y divide-line">
              {PERMISSION_MODULES.map((mod) => {
                const level = getModulePermission(staffMember, mod.key)
                return (
                  <div key={mod.key} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="text-sm font-medium text-heading">{mod.label}</span>
                    <div className="flex gap-1 rounded-xl bg-card-strong p-1">
                      {Object.values(PERMISSION_LEVELS).map((candidate) => (
                        <button
                          key={candidate}
                          disabled={savingModule === mod.key}
                          onClick={() => handleSetLevel(mod.key, candidate)}
                          className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                            level === candidate
                              ? 'bg-card text-heading shadow-sm'
                              : 'text-muted hover:text-heading'
                          }`}
                        >
                          {PERMISSION_LEVEL_LABELS[candidate]}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {confirmAction && (
        <ConfirmModal
          title={confirmAction === 'deactivate' ? 'Deactivate staff member?' : 'Reactivate staff member?'}
          message={
            confirmAction === 'deactivate'
              ? `${staffMember.displayName} will lose access to the dashboard. You can reactivate them later.`
              : `${staffMember.displayName} will regain access to the dashboard.`
          }
          confirmLabel={confirmAction === 'deactivate' ? 'Deactivate' : 'Reactivate'}
          danger={confirmAction === 'deactivate'}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}

export default StaffProfilePage
