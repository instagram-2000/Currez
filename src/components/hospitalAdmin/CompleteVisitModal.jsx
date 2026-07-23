import { useState } from 'react'
import { completeAppointmentWithNotes } from '../../firebase/appointments'
import { updateMedicineTemplates } from '../../firebase/users'
import { useAuth } from '../../contexts/AuthContext'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'
import Modal from '../common/Modal'
import NavIcon from '../common/NavIcon'

const inputClass =
  'mt-1 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-heading placeholder:text-faint focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10'
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
  const { user, userDoc } = useAuth()
  const [concerns, setConcerns] = useState(appointment.concerns || '')
  const [prescription, setPrescription] = useState(
    appointment.prescription?.length ? appointment.prescription : []
  )
  const [tests, setTests] = useState(appointment.tests?.length ? appointment.tests : [])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [savedRowIndex, setSavedRowIndex] = useState(null)
  const { errors, validate, clearFieldError } = useFormValidation({
    concerns: readOnly ? [] : [validators.required('Note the patient concerns before completing the visit.')],
  })

  const templates = userDoc?.medicineTemplates || []

  function updateMedicine(index, field, value) {
    setPrescription((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function addFromTemplate(template) {
    setPrescription((prev) => [...prev, { ...template }])
  }

  // Saves this row as a personal quick-pick for next time — deduped so
  // clicking it repeatedly doesn't pile up identical entries.
  async function saveRowAsTemplate(index) {
    const row = prescription[index]
    if (!row.medicine.trim()) return
    const entry = { medicine: row.medicine.trim(), dosage: row.dosage.trim(), duration: row.duration.trim() }
    const exists = templates.some(
      (t) => t.medicine === entry.medicine && t.dosage === entry.dosage && t.duration === entry.duration
    )
    if (exists) return
    setSavedRowIndex(index)
    try {
      await updateMedicineTemplates(user.uid, [...templates, entry])
    } finally {
      setTimeout(() => setSavedRowIndex(null), 2000)
    }
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
    <Modal onClose={onClose} className="max-w-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20">
          <NavIcon name={readOnly ? 'clipboard' : 'check'} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-heading">{readOnly ? 'Visit notes' : 'Complete visit'}</h2>
          <p className="mt-0.5 text-xs text-faint">
            {appointment.patientName} — {appointment.date} {appointment.time}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div>
          <label className={labelClass}>Patient concerns</label>
          {readOnly ? (
            <p className="mt-1 rounded-xl border border-line bg-card p-3 text-sm whitespace-pre-wrap text-heading">
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

          {!readOnly && templates.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const template = templates[Number(e.target.value)]
                if (template) addFromTemplate(template)
                e.target.value = ''
              }}
              className="mt-2 w-full cursor-pointer rounded-xl border border-dashed border-line bg-card-strong/40 px-3 py-2 text-xs text-muted focus:border-indigo-500/50 focus:outline-none"
            >
              <option value="">+ Quick-add a saved medicine…</option>
              {templates.map((t, i) => (
                <option key={`${t.medicine}-${t.dosage}-${t.duration}`} value={i}>
                  {t.medicine}{t.dosage ? ` — ${t.dosage}` : ''}{t.duration ? ` — ${t.duration}` : ''}
                </option>
              ))}
            </select>
          )}

          <div className="mt-2 space-y-2">
            {prescription.map((row, index) => (
              <div key={index} className="flex items-start gap-2 rounded-xl border border-line bg-card-strong/50 p-3">
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
                {!readOnly && row.medicine.trim() && (
                  <button
                    type="button"
                    onClick={() => saveRowAsTemplate(index)}
                    title="Save as a quick-pick for next time"
                    className="mt-1 cursor-pointer rounded-lg p-1 text-faint transition-colors hover:bg-indigo-500/10 hover:text-indigo-500"
                  >
                    {savedRowIndex === index ? (
                      <NavIcon name="check" className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <NavIcon name="star" className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => setPrescription((prev) => prev.filter((_, i) => i !== index))}
                    title="Remove"
                    className="mt-1 cursor-pointer rounded-lg p-1 text-faint transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <NavIcon name="close" className="h-3.5 w-3.5" />
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
              <div key={index} className="flex items-start gap-2 rounded-xl border border-line bg-card-strong/50 p-3">
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
                    className="mt-1 cursor-pointer rounded-lg p-1 text-faint transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <NavIcon name="close" className="h-3.5 w-3.5" />
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
            className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
          >
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm"
            >
              {submitting ? 'Saving…' : 'Complete visit'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default CompleteVisitModal
