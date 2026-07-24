import { useState } from 'react'
import Modal from '../common/Modal'
import { computeDaysSince, computeRunningCharges } from '../../utils/bedManagement'
import { useFeature } from '../../hooks/useFeature'

function DischargeModal({ admission, onDischarge, onClose }) {
  const [dischargeSummary, setDischargeSummary] = useState('')
  const [createInvoice, setCreateInvoice] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { enabled: billingEnabled } = useFeature('billing')

  const days = computeDaysSince(admission.admittedAt)
  const totalCharges = computeRunningCharges(admission.dailyRate, admission.admittedAt)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onDischarge(admission.id, {
        dischargeSummary: dischargeSummary.trim(),
        totalDays: days,
        totalCharges,
        createInvoice: billingEnabled && createInvoice,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to discharge patient.')
    } finally {
      setLoading(false)
    }
  }

  const admittedDate = admission.admittedAt?.toDate
    ? admission.admittedAt.toDate()
    : new Date(admission.admittedAt)

  return (
    <Modal onClose={onClose} className="max-w-lg">
      <h2 className="mb-4 text-lg font-bold text-heading">Discharge Patient</h2>

      <div className="mb-5 rounded-xl border border-line/80 bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-bold text-indigo-600">
            {(admission.patientName || '?')[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-heading">{admission.patientName}</div>
            <div className="text-xs text-muted">
              {admission.bedId} — {admission.wardName}, {admission.roomName}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-surface p-2">
            <div className="text-xs text-faint">Admitted</div>
            <div className="mt-0.5 text-sm font-medium text-heading">
              {admittedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div className="rounded-lg bg-surface p-2">
            <div className="text-xs text-faint">Duration</div>
            <div className="mt-0.5 text-sm font-semibold text-heading">{days} days</div>
          </div>
          <div className="rounded-lg bg-surface p-2">
            <div className="text-xs text-faint">Charges</div>
            <div className="mt-0.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
              ₹{totalCharges.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-muted">
          ₹{admission.dailyRate?.toLocaleString('en-IN')}/day × {days} days = ₹{totalCharges.toLocaleString('en-IN')}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-heading">Discharge Summary</label>
          <textarea
            value={dischargeSummary}
            onChange={(e) => setDischargeSummary(e.target.value)}
            placeholder="Enter discharge notes, follow-up instructions, etc."
            rows={3}
            className="w-full resize-none rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-heading placeholder-faint outline-none transition-colors focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>

        {billingEnabled && totalCharges > 0 && (
          <label className="flex items-center gap-3 rounded-xl border border-line/80 bg-surface p-3 transition-colors hover:bg-surface-strong cursor-pointer">
            <input
              type="checkbox"
              checked={createInvoice}
              onChange={(e) => setCreateInvoice(e.target.checked)}
              className="h-4 w-4 rounded border-line text-indigo-600 focus:ring-indigo-500/20"
            />
            <div>
              <div className="text-sm font-medium text-heading">Add to billing invoice</div>
              <div className="text-xs text-muted">
                Auto-create an invoice with ₹{totalCharges.toLocaleString('en-IN')} bed charges
              </div>
            </div>
          </label>
        )}

        {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-card-strong hover:text-heading"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Discharging...' : 'Discharge Patient'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default DischargeModal
