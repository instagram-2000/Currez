import { useState } from 'react'
import { confirmAppointment } from '../../firebase/appointments'
import { useAuth } from '../../contexts/AuthContext'

function ConfirmPaymentModal({ appointment, doctors, onClose }) {
  const { user } = useAuth()
  const needsDoctor = !appointment.doctorId
  const [doctorId, setDoctorId] = useState(doctors?.[0]?.uid || '')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    if (needsDoctor && !doctorId) {
      setError('Choose a doctor to assign this appointment to.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const assignedDoctor = doctors?.find((d) => d.uid === doctorId)
      await confirmAppointment(appointment.id, {
        paymentMethod,
        confirmedBy: user.uid,
        ...(needsDoctor ? { doctorId, doctorName: assignedDoctor?.displayName || '' } : {}),
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <h2 className="text-base font-semibold text-heading">Confirm appointment</h2>
        <p className="mt-1 text-sm text-muted">
          {appointment.patientName} — {appointment.doctorName || 'no doctor yet'}, {appointment.date}{' '}
          {appointment.time}
        </p>

        {needsDoctor && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-body">Assign doctor</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="mt-1 w-full cursor-pointer rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading focus:border-line-strong focus:outline-none"
            >
              {(!doctors || doctors.length === 0) && <option value="">No doctors available</option>}
              {doctors?.map((d) => (
                <option key={d.uid} value={d.uid}>
                  {d.displayName} {d.specialization ? `— ${d.specialization}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <p className="mt-4 text-sm font-medium text-body">How was the visit fee collected?</p>
        <div className="mt-2 space-y-2">
          {[
            { value: 'cash', label: 'Cash' },
            { value: 'online', label: 'Online (hospital QR)' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-body has-[:checked]:border-indigo-500"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={paymentMethod === option.value}
                onChange={() => setPaymentMethod(option.value)}
                className="cursor-pointer"
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">
          For record only — online payments are made directly to the hospital's own QR, not through this app.
        </p>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Confirming…' : 'Confirm & record payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmPaymentModal
