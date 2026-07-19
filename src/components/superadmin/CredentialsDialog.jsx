import { useState } from 'react'

function CredentialsDialog({ email, password, title = 'Staff account created', subtitle, onClose }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <h2 className="text-base font-semibold text-heading">{title}</h2>
        <p className="mt-2 text-sm text-muted">
          {subtitle || "Share these credentials with the staff member. This password won't be shown again."}
       	</p>

        <div className="mt-4 space-y-2 rounded-lg border border-line bg-card p-4 text-sm">
          <p>
            <span className="text-muted">Email: </span>
            <span className="font-mono text-heading">{email}</span>
          </p>
          <p>
            <span className="text-muted">Password: </span>
            <span className="font-mono text-heading">{password}</span>
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleCopy}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default CredentialsDialog
