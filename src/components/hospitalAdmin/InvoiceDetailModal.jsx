import { useState } from 'react'
import { addInvoiceCharge, recordInvoicePayment, voidInvoice } from '../../firebase/billing'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../common/Modal'
import ConfirmModal from '../common/ConfirmModal'
import PrintPortal from '../common/PrintPortal'
import NavIcon from '../common/NavIcon'

function formatMoney(n) {
  return `₹${(Number(n) || 0).toFixed(2)}`
}

function formatTimestamp(ts) {
  const date = ts?.toDate?.()
  return date ? date.toLocaleString() : '—'
}

const STATUS_STYLES = {
  due: 'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400',
  paid: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400',
  void: 'bg-card-strong text-muted ring-line',
}

const PAYMENT_LABELS = { cash: 'Cash', online: 'Online' }

// The letterhead document itself — rendered twice by InvoiceDetailModal:
// once inline for on-screen viewing, once inside a PrintPortal for
// printing. Keeping it as one component means the two views can never
// silently drift apart.
function InvoiceContent({ invoice, hospital }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-faint uppercase">Invoice</p>
          <h2 className="mt-1 text-lg font-bold text-heading">{hospital?.title || 'Hospital'}</h2>
          {hospital?.footer?.address && <p className="mt-0.5 text-xs text-muted">{hospital.footer.address}</p>}
          <p className="text-xs text-muted">
            {[hospital?.footer?.phone, hospital?.footer?.email].filter(Boolean).join(' · ')}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${
            STATUS_STYLES[invoice.status] || STATUS_STYLES.due
          }`}
        >
          {invoice.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-line bg-card-strong/50 p-4 text-sm">
        <div>
          <p className="text-xs text-faint">Patient</p>
          <p className="font-medium text-heading">{invoice.patientName || '—'}</p>
          {invoice.patientPhone && <p className="text-xs text-muted">{invoice.patientPhone}</p>}
        </div>
        <div>
          <p className="text-xs text-faint">Doctor</p>
          <p className="font-medium text-heading">{invoice.doctorName || 'Unassigned'}</p>
        </div>
        <div>
          <p className="text-xs text-faint">Invoice date</p>
          <p className="font-medium text-heading">{formatTimestamp(invoice.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-faint">Visit date</p>
          <p className="font-medium text-heading">
            {invoice.date ? `${invoice.date}${invoice.time ? ` ${invoice.time}` : ''}` : '—'}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead>
            <tr className="bg-card-strong/50 text-left text-xs font-semibold tracking-wide text-faint uppercase">
              <th className="px-4 py-2.5">Item</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(invoice.lineItems || []).map((item, i) => (
              <tr key={i}>
                <td className="px-4 py-2.5 text-heading">{item.label}</td>
                <td className="px-4 py-2.5 text-right text-heading">{formatMoney(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatMoney(invoice.subtotal)}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-muted">
            <span>Discount</span>
            <span>-{formatMoney(invoice.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-1.5 text-base font-semibold text-heading">
          <span>Total</span>
          <span>{formatMoney(invoice.total)}</span>
        </div>
        {invoice.status === 'paid' && (
          <p className="pt-1 text-xs text-emerald-600 dark:text-emerald-400">
            Paid via {PAYMENT_LABELS[invoice.paymentMethod] || invoice.paymentMethod} on {formatTimestamp(invoice.paidAt)}
          </p>
        )}
        {invoice.status === 'void' && (
          <p className="pt-1 text-xs text-muted">Voided on {formatTimestamp(invoice.voidedAt)}</p>
        )}
      </div>
    </div>
  )
}

// Viewing, adding charges, paying and voiding all live in one modal — an
// invoice has so little state (due/paid/void) that splitting this into
// separate modals would just be repeated copies of the same layout.
function InvoiceDetailModal({ invoice, hospital, canRecordPayment, canVoid, onClose }) {
  const { user } = useAuth()
  const [chargeLabel, setChargeLabel] = useState('')
  const [chargeAmount, setChargeAmount] = useState('')
  const [addingCharge, setAddingCharge] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [recording, setRecording] = useState(false)
  const [showVoidConfirm, setShowVoidConfirm] = useState(false)
  const [voiding, setVoiding] = useState(false)
  const [error, setError] = useState('')

  async function handleAddCharge(e) {
    e.preventDefault()
    setError('')
    setAddingCharge(true)
    try {
      await addInvoiceCharge(invoice.id, {
        currentLineItems: invoice.lineItems,
        currentDiscount: invoice.discount,
        label: chargeLabel,
        amount: chargeAmount,
      })
      setChargeLabel('')
      setChargeAmount('')
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingCharge(false)
    }
  }

  async function handleRecordPayment() {
    setError('')
    setRecording(true)
    try {
      await recordInvoicePayment(invoice.id, { paymentMethod, paidBy: user.uid })
    } catch (err) {
      setError(err.message)
    } finally {
      setRecording(false)
    }
  }

  async function handleVoid() {
    setVoiding(true)
    try {
      await voidInvoice(invoice.id, { voidedBy: user.uid, reason: 'Voided from Billing' })
      setShowVoidConfirm(false)
    } catch (err) {
      setError(err.message)
      setShowVoidConfirm(false)
    } finally {
      setVoiding(false)
    }
  }

  return (
    <Modal onClose={onClose} className="max-w-lg">
      <InvoiceContent invoice={invoice} hospital={hospital} />
      <PrintPortal>
        <InvoiceContent invoice={invoice} hospital={hospital} />
      </PrintPortal>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {canRecordPayment && invoice.status === 'due' && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-sm font-medium text-body">Add a charge</p>
          <p className="mt-0.5 text-xs text-faint">Room, dressing, tests, or anything else added to this visit's bill.</p>
          <form onSubmit={handleAddCharge} className="mt-2 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="e.g. Room charges"
              value={chargeLabel}
              onChange={(e) => setChargeLabel(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-line bg-card px-3 py-2 text-sm text-heading placeholder:text-faint focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              value={chargeAmount}
              onChange={(e) => setChargeAmount(e.target.value)}
              className="w-28 rounded-xl border border-line bg-card px-3 py-2 text-sm text-heading placeholder:text-faint focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
            <button
              type="submit"
              disabled={addingCharge}
              className="cursor-pointer rounded-xl border border-line px-3.5 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addingCharge ? 'Adding…' : 'Add'}
            </button>
          </form>
        </div>
      )}

      {canRecordPayment && invoice.status === 'due' && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-sm font-medium text-body">How was this collected?</p>
          <div className="mt-2 flex gap-2">
            {[
              { value: 'cash', label: 'Cash' },
              { value: 'online', label: 'Online' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm text-body transition-colors has-checked:border-indigo-500 has-checked:bg-indigo-500/5"
              >
                <input
                  type="radio"
                  name="invoicePaymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value)}
                  className="cursor-pointer accent-indigo-600"
                />
                {option.label}
              </label>
            ))}
          </div>
          <button
            onClick={handleRecordPayment}
            disabled={recording}
            className="mt-3 w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-500/25 transition-all hover:bg-emerald-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {recording ? 'Recording…' : `Record payment — ${formatMoney(invoice.total)}`}
          </button>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <div>
          {canVoid && invoice.status !== 'void' && (
            <button
              onClick={() => setShowVoidConfirm(true)}
              className="cursor-pointer rounded-xl px-3.5 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
            >
              Void invoice
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-line px-3.5 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading"
          >
            <NavIcon name="billing" className="h-3.5 w-3.5" />
            Print / Save as PDF
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>

      {showVoidConfirm && (
        <ConfirmModal
          title="Void this invoice?"
          message={`This marks the ${formatMoney(invoice.total)} invoice for ${invoice.patientName || 'this patient'} as void. It stays on record but no longer counts toward collections or dues.`}
          confirmLabel="Void invoice"
          danger
          busy={voiding}
          onConfirm={handleVoid}
          onCancel={() => setShowVoidConfirm(false)}
        />
      )}
    </Modal>
  )
}

export default InvoiceDetailModal
