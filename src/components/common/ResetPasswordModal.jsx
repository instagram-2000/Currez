import { useState } from 'react'
import { generatePassword } from '../../utils/generatePassword'
import { updateStaffPassword } from '../../firebase/passwordReset'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'
const labelClass = 'block text-sm font-medium text-body'

function ResetPasswordModal({ staff, onClose }) {
  const [newPassword, setNewPassword] = useState(generatePassword())
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { errors, validate, clearFieldError } = useFormValidation({
    newPassword: [validators.required('Password is required.'), validators.minLength(6, 'Password must be at least 6 characters.')],
  })

  async function handleSave() {
    setError('')
    if (!validate({ newPassword })) return
    setSubmitting(true)
    try {
      await updateStaffPassword(staff.uid, newPassword)
      onClose({ email: staff.email, password: newPassword })
    } catch (err) {
      setError(err.message || 'Failed to update password.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(`Email: ${staff.email}\nNew Password: ${newPassword}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <h2 className="text-base font-semibold text-heading">Reset password</h2>
        <p className="mt-1 text-sm text-muted">
          {staff.displayName} &mdash; {staff.email}
        </p>

        <div className="mt-4">
          <label className={labelClass}>New password</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); clearFieldError('newPassword') }}
              className={`${inputClass} mt-0 font-mono`}
            />
            <button
              type="button"
              onClick={() => { setNewPassword(generatePassword()); clearFieldError('newPassword') }}
              className="shrink-0 cursor-pointer rounded-lg border border-line px-3 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading"
            >
              Generate
            </button>
          </div>
          {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 cursor-pointer rounded-lg border border-line px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading"
          >
            {copied ? 'Copied!' : 'Copy password'}
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex-1 cursor-pointer rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save & show'}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onClose(null)}
            className="cursor-pointer text-sm font-medium text-muted hover:text-heading"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordModal
