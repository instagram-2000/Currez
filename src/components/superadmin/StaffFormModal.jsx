import { useState } from 'react'
import { createStaffAuthAccount } from '../../firebase/secondaryAuth'
import { createUserDoc } from '../../firebase/users'
import { useAuth } from '../../contexts/AuthContext'
import { CREATABLE_STAFF_ROLES, ROLES, ROLE_LABELS } from '../../utils/roles'
import { generatePassword } from '../../utils/generatePassword'
import { DEFAULT_SCHEDULE } from '../../utils/doctorSchedule'

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'
const labelClass = 'block text-sm font-medium text-body'

// Reused by both the superadmin (any creatable role) and hospital-admin
// (doctors/receptionists only, via `allowedRoles`) staff-creation flows.
function StaffFormModal({ hospitalId, allowedRoles = CREATABLE_STAFF_ROLES, onCreated, onCancel }) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState(generatePassword())
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState(allowedRoles[0])
  const [specialization, setSpecialization] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const trimmedEmail = email.trim()
      const uid = await createStaffAuthAccount(trimmedEmail, password)
      await createUserDoc(uid, {
        email: trimmedEmail,
        displayName: displayName.trim() || trimmedEmail,
        role,
        hospitalId,
        createdBy: user.uid,
        ...(role === ROLES.DOCTOR
          ? { specialization: specialization.trim(), schedule: DEFAULT_SCHEDULE }
          : {}),
      })
      onCreated({ email: trimmedEmail, password })
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'That email is already in use.' : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <h2 className="text-base font-semibold text-heading">Add staff member</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              {allowedRoles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {role === ROLES.DOCTOR && (
            <div>
              <label className={labelClass}>Specialization</label>
              <input
                type="text"
                placeholder="e.g. Cardiologist"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-faint">
                A default Mon–Fri, 9am–5pm schedule is created — edit it after adding this doctor.
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>Initial password</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} mt-0 font-mono`}
              />
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="shrink-0 cursor-pointer rounded-lg border border-line px-3 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading"
              >
                Generate
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StaffFormModal
