import { useState } from 'react'
import { completeAppointmentWithNotes } from '../../firebase/appointments'
import { useAuth } from '../../contexts/AuthContext'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'
const labelClass = 'block text-sm font-medium text-body'

function emptyMedicine() {
  return { medicine: '', dosage: '', duration: '' }
}

function emptyTest() {
  return { name: '', notes: '' }
}

// Doctor's visit-completion flow: instead of a bare status flip, they
// record what the visit was actually for. Also reused read-only to look
// back at a past visit's notes (no editing, no submit).
function CompleteVisitModal({ appointment, readOnly = false, onClose, onCompleted }) {
  const { user } = useAuth()
  const [concerns, setConcerns] = useState(appointment.concerns || '')
  const [prescription, setPrescription] = useState(
    appointment.prescription?.length ? appointment.prescription : []
  )
  const [tests, setTests] = useState(appointment.tests?.length ? appointment.tests : [])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { errors, validate, clearFieldError } = useFormValidation({
    concerns: readOnly ? [] : [validators.required('Note the patient concerns before completing the visit.')],
  })

  function updateMedicine(index, field, value) {
    setPrescription((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function updateTest(index, field, value) {
    setTests((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validate({ concerns })) return
    setSubmitting(true)
    try {
      await completeAppointmentWithNotes(appointment.id, {
        concerns: concerns.trim(),
        prescription: prescription
          .filter((row) => row.medicine.trim())
          .map((row) => ({ medicine: row.medicine.trim(), dosage: row.dosage.trim(), duration: row.duration.trim() })),
        tests: tests.filter((row) => row.name.trim()).map((row) => ({ name: row.name.trim(), notes: row.notes.trim() })),
        completedBy: user.uid,
      })
      onCompleted?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <h2 className="text-base font-semibold text-heading">{readOnly ? 'Visit notes' : 'Complete visit'}</h2>
        <p className="mt-1 text-sm text-muted">
          {appointment.patientName} — {appointment.date} {appointment.time}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div>
            <label className={labelClass}>Patient concerns</label>
            {readOnly ? (
              <p className="mt-1 rounded-lg border border-line bg-card p-3 text-sm text-heading whitespace-pre-wrap">
                {concerns || '—'}
              </p>
            ) : (
              <>
                <textarea
                  rows={3}
                  placeholder="What the patient came in for, symptoms, examination notes…"
                  value={concerns}
                  onChange={(e) => { setConcerns(e.target.value); clearFieldError('concerns') }}
                  className={inputClass}
                />
                {errors.concerns && <p className="mt-1 text-xs text-red-500">{errors.concerns}</p>}
              </>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className={labelClass}>Prescription</label>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setPrescription((prev) => [...prev, emptyMedicine()])}
                  className="cursor-pointer text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  + Add medicine
                </button>
              )}
            </div>

            <div className="mt-2 space-y-2">
              {prescription.map((row, index) => (
                <div key={index} className="flex items-start gap-2 rounded-lg border border-line bg-card-strong p-3">
                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Medicine"
                      disabled={readOnly}
                      value={row.medicine}
                      onChange={(e) => updateMedicine(index, 'medicine', e.target.value)}
                      className={`${inputClass} mt-0 disabled:opacity-70`}
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg twice daily)"
                      disabled={readOnly}
                      value={row.dosage}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      className={`${inputClass} mt-0 disabled:opacity-70`}
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 5 days)"
                      disabled={readOnly}
                      value={row.duration}
                      onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                      className={`${inputClass} mt-0 disabled:opacity-70`}
                    />
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => setPrescription((prev) => prev.filter((_, i) => i !== index))}
                      title="Remove"
                      className="mt-1 cursor-pointer text-xs text-red-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {prescription.length === 0 && <p className="text-sm text-faint">No medicines prescribed.</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className={labelClass}>Tests / diagnostics needed</label>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setTests((prev) => [...prev, emptyTest()])}
                  className="cursor-pointer text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  + Add test
                </button>
              )}
            </div>

            <div className="mt-2 space-y-2">
              {tests.map((row, index) => (
                <div key={index} className="flex items-start gap-2 rounded-lg border border-line bg-card-strong p-3">
                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Test (e.g. CBC, X-ray chest)"
                      disabled={readOnly}
                      value={row.name}
                      onChange={(e) => updateTest(index, 'name', e.target.value)}
                      className={`${inputClass} mt-0 disabled:opacity-70`}
                    />
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      disabled={readOnly}
                      value={row.notes}
                      onChange={(e) => updateTest(index, 'notes', e.target.value)}
                      className={`${inputClass} mt-0 disabled:opacity-70`}
                    />
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => setTests((prev) => prev.filter((_, i) => i !== index))}
                      title="Remove"
                      className="mt-1 cursor-pointer text-xs text-red-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {tests.length === 0 && <p className="text-sm text-faint">No tests needed.</p>}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
            >
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Saving…' : 'Complete visit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompleteVisitModal
