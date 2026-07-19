import { useState } from 'react'
import Modal from '../common/Modal'
import NavIcon from '../common/NavIcon'
import { sendLeadEmail } from '../../utils/emailjs'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'
const labelClass = 'block text-sm font-medium text-body'

// One shared form behind every lead-capture CTA on the company site
// (Contact us / Talk to sales / Book a demo / Get onboarded) — only the
// title/subtitle/intent differ, so callers just pass those and this owns
// the form, validation, EmailJS send, and success/error states.
function LeadCaptureModal({ title, subtitle, intent, onClose }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const { errors, validate, clearFieldError } = useFormValidation({
    name: [validators.required('Name is required.')],
    phone: [validators.required('Mobile number is required.'), validators.phone('Enter a valid mobile number.')],
    email: [validators.email('Enter a valid email address.')],
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validate({ name, phone, email })) return
    setSubmitting(true)
    try {
      await sendLeadEmail({ name: name.trim(), phone: phone.trim(), email: email.trim(), message: message.trim(), intent })
      setSent(true)
    } catch {
      setError("Something went wrong sending this — please try again, or call us directly.")
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
            <NavIcon name="check" className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-heading">Thanks, {name.trim().split(' ')[0]}!</h2>
          <p className="mt-2 text-sm text-muted">We've got your details — we'll get back to you soon.</p>
          <button
            onClick={onClose}
            className="mt-6 cursor-pointer rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Close
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold text-heading">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => { setName(e.target.value); clearFieldError('name') }}
            className={inputClass}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className={labelClass}>Mobile number</label>
          <input
            type="tel"
            placeholder="+91"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); clearFieldError('phone') }}
            className={inputClass}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label className={labelClass}>Email (optional)</label>
          <input
            type="email"
            placeholder="you@hospital.in"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
            className={inputClass}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className={labelClass}>Message (optional)</label>
          <textarea
            rows={3}
            placeholder="Tell us a bit about your hospital…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full cursor-pointer rounded-full bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Send'}
        </button>
      </form>
    </Modal>
  )
}

export default LeadCaptureModal
