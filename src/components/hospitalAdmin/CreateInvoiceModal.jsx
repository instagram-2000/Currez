import { useMemo, useState } from 'react'
import { createInvoice } from '../../firebase/billing'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../common/Modal'
import NavIcon from '../common/NavIcon'

const inputClass =
  'mt-1 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-heading placeholder:text-faint focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10'
const labelClass = 'block text-sm font-medium text-body'

function emptyLineItem() {
  return { label: '', amount: '' }
}

function formatMoney(n) {
  return `₹${(Number(n) || 0).toFixed(2)}`
}

// `eligibleAppointments` — completed visits at this hospital that don't
// already have an invoice — and `doctorsById` are computed once by
// BillingPage (it already subscribes both appointments and staff), so this
// modal stays a pure form over data it's handed rather than opening its own
// Firestore listeners.
function CreateInvoiceModal({ hospitalId, eligibleAppointments, doctorsById, onCreated, onCancel }) {
  const { user } = useAuth()
  const [appointmentId, setAppointmentId] = useState('')
  const [lineItems, setLineItems] = useState([])
  const [discount, setDiscount] = useState('0')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedAppointment = eligibleAppointments.find((a) => a.id === appointmentId) || null

  function handleAppointmentChange(id) {
    setAppointmentId(id)
    setError('')
    const appt = eligibleAppointments.find((a) => a.id === id)
    if (!appt) {
      setLineItems([])
      return
    }
    const doctor = appt.doctorId ? doctorsById[appt.doctorId] : null
    const fee = doctor?.consultationFee
    setLineItems([
      {
        label: `Consultation${appt.doctorName ? ` — ${appt.doctorName}` : ''}`,
        amount: fee != null ? String(fee) : '',
      },
    ])
    setDiscount('0')
  }

  function updateLineItem(index, field, value) {
    setLineItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function removeLineItem(index) {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [lineItems]
  )
  const clampedDiscount = Math.min(Math.max(Number(discount) || 0, 0), subtotal)
  const total = Math.max(subtotal - clampedDiscount, 0)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!selectedAppointment) {
      setError('Choose a visit to invoice.')
      return
    }
    const hasValidItem = lineItems.some((item) => item.label.trim() && Number(item.amount) > 0)
    if (!hasValidItem) {
      setError('Add at least one line item with a label and an amount greater than 0.')
      return
    }

    setSubmitting(true)
    try {
      await createInvoice(
        {
          hospitalId,
          appointmentId: selectedAppointment.id,
          patientId: selectedAppointment.patientId,
          patientName: selectedAppointment.patientName,
          patientPhone: selectedAppointment.patientPhone,
          doctorId: selectedAppointment.doctorId,
          doctorName: selectedAppointment.doctorName,
          date: selectedAppointment.date,
          time: selectedAppointment.time,
          lineItems,
          discount: clampedDiscount,
        },
        user.uid
      )
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal onClose={onCancel} className="max-w-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20 ring-inset">
          <NavIcon name="billing" className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
        </div>
        <h2 className="text-base font-semibold text-heading">Create invoice</h2>
      </div>

      {eligibleAppointments.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-line bg-card-strong/50 p-4 text-sm text-muted">
          No completed visits are waiting for an invoice. An invoice can be created once a doctor marks
          a visit as completed.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>Visit</label>
            <select
              value={appointmentId}
              onChange={(e) => handleAppointmentChange(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Select a completed visit…</option>
              {eligibleAppointments.map((appt) => (
                <option key={appt.id} value={appt.id}>
                  {appt.patientName} — {appt.date} {appt.time || ''} {appt.doctorName ? `— ${appt.doctorName}` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedAppointment && (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Line items</label>
                  <button
                    type="button"
                    onClick={() => setLineItems((prev) => [...prev, emptyLineItem()])}
                    className="cursor-pointer text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    + Add line item
                  </button>
                </div>

                <div className="mt-2 space-y-2">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 rounded-xl border border-line bg-card-strong/50 p-3">
                      <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                        <input
                          type="text"
                          placeholder="e.g. Consultation, Dressing, Injection"
                          value={item.label}
                          onChange={(e) => updateLineItem(index, 'label', e.target.value)}
                          className={`${inputClass} mt-0`}
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                          className={`${inputClass} mt-0 sm:w-32`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        title="Remove"
                        className="mt-1 cursor-pointer rounded-lg p-1 text-faint transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <NavIcon name="close" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {lineItems.length === 0 && <p className="text-sm text-faint">No line items yet.</p>}
                </div>
              </div>

              <div>
                <label className={labelClass}>Discount (flat amount)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className={`${inputClass} max-w-[10rem]`}
                />
              </div>

              <div className="space-y-1.5 rounded-xl border border-line bg-card-strong/50 p-4 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Discount</span>
                  <span>-{formatMoney(clampedDiscount)}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-1.5 text-base font-semibold text-heading">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedAppointment}
              className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm"
            >
              {submitting ? 'Creating…' : 'Create invoice'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default CreateInvoiceModal
