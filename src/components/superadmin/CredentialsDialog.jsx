import { useState } from 'react'
import Modal from '../common/Modal'
import NavIcon from '../common/NavIcon'

function CredentialsDialog({ email, password, onClose }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Modal onClose={onClose} className="max-w-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20">
          <NavIcon name="check" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-base font-semibold text-heading">Staff account created</h2>
      </div>
      <p className="mt-3 text-sm text-muted">
        Share these credentials with the staff member. This password won't be shown again.
      </p>

      <div className="mt-4 space-y-2 rounded-xl border border-line bg-card-strong/50 p-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Email</span>
          <span className="truncate font-mono text-heading">{email}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Password</span>
          <span className="font-mono text-heading">{password}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading"
        >
          {copied ? (
            <>
              <NavIcon name="check" className="h-3.5 w-3.5 text-emerald-500" />
              Copied
            </>
          ) : (
            'Copy'
          )}
        </button>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30"
        >
          Done
        </button>
      </div>
    </Modal>
  )
}

export default CredentialsDialog
