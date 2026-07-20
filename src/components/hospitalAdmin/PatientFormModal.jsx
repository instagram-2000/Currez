import { useState } from 'react'
import { createPatient } from '../../firebase/patients'
import { useAuth } from '../../contexts/AuthContext'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'
const labelClass = 'block text-sm font-medium text-body'

function PatientFormModal({ hospitalId, onCreated, onCancel }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { errors, validate, clearFieldError } = useFormValidation({
    name: [validators.required('Patient name is required.'), validators.name('Name should not contain numbers.')],
    phone: [validators.phone('Enter a valid phone number.')],
    email: [validators.email('Enter a valid email address.')],
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validate({ name, phone, email })) return
    setSubmitting(true)
    try {
      await createPatient(hospitalId, { name, phone, email }, user.uid)
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <h2 className="text-base font-semibold text-heading">Add patient</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); clearFieldError('name') }} className={inputClass} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="text" value={phone} onChange={(e) => { setPhone(e.target.value); clearFieldError('phone') }} className={inputClass} />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
          <div>
            <label className={labelClass}>Email (optional)</label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }} className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
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
              {submitting ? 'Adding…' : 'Add patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PatientFormModal
