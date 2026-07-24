import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './config'

const INVOICES_COLLECTION = 'invoices'
const INVOICE_COUNTERS_COLLECTION = 'invoiceCounters'
const INVOICE_PAYMENTS_COLLECTION = 'invoicePayments'

export const INVOICE_STATUS = {
  DUE: 'due',
  PAID: 'paid',
  VOID: 'void',
}

// Common Indian GST slabs — a simple preset list for CreateInvoiceModal's
// tax dropdown rather than a free-text rate field.
export const TAX_RATE_OPTIONS = [0, 5, 12, 18]

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function subscribeInvoices(hospitalId, callback) {
  const q = query(collection(db, INVOICES_COLLECTION), where('hospitalId', '==', hospitalId))
  return onSnapshot(q, (snapshot) => {
    const invoices = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    invoices.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
    callback(invoices)
  })
}

// Payment history for one invoice — only ever subscribed on-demand while
// InvoiceDetailModal is open for that specific invoice, not as a page-wide
// listener (see the comment on the /invoices update rule in firestore.rules
// for why this is a separate collection rather than a field on the invoice).
export function subscribeInvoicePayments(invoiceId, callback) {
  const q = query(collection(db, INVOICE_PAYMENTS_COLLECTION), where('invoiceId', '==', invoiceId))
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    payments.sort((a, b) => (a.paidAt?.toMillis?.() ?? 0) - (b.paidAt?.toMillis?.() ?? 0))
    callback(payments)
  })
}

// One invoice per appointment — the appointment's own id doubles as the
// invoice's doc id (same "doc id as the uniqueness constraint" pattern
// firebase/hospitals.js uses for slugs). Deliberately does NOT getDoc()
// first to check for an existing invoice: Firestore rules can't safely
// authorize a `get` on a possibly-nonexistent doc by that doc's own data
// (resource is null before it exists, so referencing resource.data errors
// out as "permission denied" — a classic Firestore rules trap), so instead
// this relies on Firestore's own create-vs-update dispatch: a write to an
// id that already exists is evaluated as an `update`, and firestore.rules'
// update rule for /invoices requires lineItems/subtotal/discount/total to
// stay byte-identical to what's stored — so a genuine duplicate attempt
// (different line items) is rejected server-side on its own. The primary,
// friendlier prevention is still BillingPage only ever offering
// not-yet-invoiced appointments in the picker.
export async function createInvoice(
  {
    hospitalId,
    appointmentId,
    patientId,
    patientName,
    patientPhone,
    doctorId,
    doctorName,
    date,
    time,
    lineItems,
    discount,
    taxRate,
  },
  createdBy
) {
  if (!hospitalId || !appointmentId) {
    throw new Error('An appointment is required to create an invoice.')
  }

  const cleanItems = (lineItems || [])
    .map((item) => ({ label: (item.label || '').trim(), amount: round2(Number(item.amount) || 0) }))
    .filter((item) => item.label && item.amount > 0)
  if (cleanItems.length === 0) {
    throw new Error('Add at least one line item with a label and an amount greater than 0.')
  }

  // Tax is modeled as its own line item (not a separate arithmetic term) so
  // `subtotal` stays literally "sum of lineItems" — the exact invariant
  // firestore.rules already enforces, meaning tax support needed zero rule
  // changes. Computed on the pre-discount subtotal; a simplified choice
  // appropriate for a small-hospital billing tool, not a full GST ledger.
  const cleanTaxRate = Math.max(Number(taxRate) || 0, 0)
  const preTaxSubtotal = round2(cleanItems.reduce((sum, item) => sum + item.amount, 0))
  const taxAmount = cleanTaxRate > 0 ? round2(preTaxSubtotal * (cleanTaxRate / 100)) : 0
  const allItems =
    taxAmount > 0 ? [...cleanItems, { label: `GST (${cleanTaxRate}%)`, amount: taxAmount, isTax: true }] : cleanItems

  const subtotal = round2(allItems.reduce((sum, item) => sum + item.amount, 0))
  const cleanDiscount = round2(Math.min(Math.max(Number(discount) || 0, 0), subtotal))
  // Deliberately NOT round2(subtotal - cleanDiscount) — the Firestore create
  // rule independently re-derives total as subtotal - discount from these
  // same two stored numbers to make sure a client can't forge one. Rounding
  // this subtraction again here could land on a different double than that
  // recomputation (classic float subtraction noise), which would make the
  // rule reject a perfectly legitimate invoice. Subtracting two values that
  // are already clean to 2dp needs no further rounding for storage — only
  // display (formatMoney's toFixed(2)) ever needs to hide float noise, and
  // it already does.
  const total = subtotal - cleanDiscount

  const ref = doc(db, INVOICES_COLLECTION, appointmentId)
  const counterRef = doc(db, INVOICE_COUNTERS_COLLECTION, hospitalId)

  // Transactional so two invoices created back-to-back for the same
  // hospital can never be assigned the same sequential number.
  await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef)
    const nextNumber = (counterSnap.exists() ? counterSnap.data().count : 0) + 1

    transaction.set(counterRef, { count: nextNumber, updatedAt: serverTimestamp() }, { merge: true })
    transaction.set(ref, {
      hospitalId,
      appointmentId,
      invoiceNumber: `INV-${String(nextNumber).padStart(6, '0')}`,
      patientId: patientId || null,
      patientName: patientName || '',
      patientPhone: patientPhone || '',
      doctorId: doctorId || null,
      doctorName: doctorName || '',
      date: date || '',
      time: time || '',
      lineItems: allItems,
      subtotal,
      discount: cleanDiscount,
      total,
      taxRate: cleanTaxRate,
      amountPaid: 0,
      status: INVOICE_STATUS.DUE,
      paymentMethod: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy,
    })
  })

  return appointmentId
}

// Appends one charge (room, dressing, a test, etc.) to a still-open ('due')
// invoice — for a patient whose stay/visit accumulates cost beyond the
// initial consultation, so front desk doesn't need to void and re-create an
// invoice every time something new gets added before the bill is settled.
// Takes the invoice's CURRENT lineItems/discount (the caller already has
// them live via subscribeInvoices) and writes the full new array — not
// arrayUnion, which dedupes exactly-equal items and would silently merge
// two genuinely separate "Dressing — ₹50" charges into one.
export async function addInvoiceCharge(invoiceId, { currentLineItems, currentDiscount, label, amount }) {
  const newItem = { label: (label || '').trim(), amount: round2(Number(amount) || 0) }
  if (!newItem.label || newItem.amount <= 0) {
    throw new Error('Enter a charge label and an amount greater than 0.')
  }

  const lineItems = [...(currentLineItems || []), newItem]
  const subtotal = round2(lineItems.reduce((sum, item) => sum + item.amount, 0))
  const cleanDiscount = round2(Math.min(Math.max(Number(currentDiscount) || 0, 0), subtotal))
  const total = subtotal - cleanDiscount // see createInvoice's comment — no extra round2() here

  await updateDoc(doc(db, INVOICES_COLLECTION, invoiceId), {
    lineItems,
    subtotal,
    discount: cleanDiscount,
    total,
    updatedAt: serverTimestamp(),
  })
}

// Best-effort convenience run right after an appointment is booked/confirmed
// with a doctor assigned — starts a `due` invoice with a Consultation line
// at that doctor's rate, so front desk doesn't have to remember a separate
// "create invoice" step for the common case. Silently does nothing (never
// throws) if billing isn't enabled, the doctor has no consultation fee on
// file, or the write is rejected for any other reason (e.g. an invoice
// already exists) — this must never block the appointment action that
// triggered it.
export async function autoCreateConsultationInvoice({
  billingEnabled,
  hospitalId,
  appointmentId,
  patientId,
  patientName,
  patientPhone,
  doctorId,
  doctorName,
  date,
  time,
  consultationFee,
  createdBy,
}) {
  if (!billingEnabled) return
  const fee = Number(consultationFee)
  if (!(fee > 0)) return
  try {
    await createInvoice(
      {
        hospitalId,
        appointmentId,
        patientId,
        patientName,
        patientPhone,
        doctorId,
        doctorName,
        date,
        time,
        lineItems: [{ label: `Consultation — ${doctorName || 'Doctor'}`, amount: fee }],
        discount: 0,
      },
      createdBy
    )
  } catch {
    // Best-effort — see doc comment above.
  }
}

// Records a payment against a 'due' invoice — full or partial. `total` and
// `currentAmountPaid` come from the caller's already-subscribed invoice (no
// extra read). Writes a payment-history record and the invoice's own
// running `amountPaid`/`status` atomically, so the two can never end up out
// of sync even if one write were to fail independently.
export async function recordInvoicePayment(
  invoiceId,
  { hospitalId, amount, total, currentAmountPaid, paymentMethod, paidBy }
) {
  const paymentAmount = round2(Number(amount))
  if (!(paymentAmount > 0)) {
    throw new Error('Enter a payment amount greater than 0.')
  }

  const previousAmountPaid = Number(currentAmountPaid) || 0
  const remaining = round2(total - previousAmountPaid)
  if (paymentAmount > remaining + 0.01) {
    throw new Error(`That's more than the ₹${remaining.toFixed(2)} still outstanding on this invoice.`)
  }

  const newAmountPaid = round2(Math.min(previousAmountPaid + paymentAmount, total))
  const newStatus = newAmountPaid >= total - 0.01 ? INVOICE_STATUS.PAID : INVOICE_STATUS.DUE

  const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId)
  // Auto-generated id, created up front so it can be included in the same
  // atomic batch as the invoice update below.
  const paymentRef = doc(collection(db, INVOICE_PAYMENTS_COLLECTION))

  const batch = writeBatch(db)
  batch.set(paymentRef, {
    hospitalId,
    invoiceId,
    amount: paymentAmount,
    method: paymentMethod,
    paidAt: serverTimestamp(),
    paidBy,
  })
  batch.update(invoiceRef, {
    amountPaid: newAmountPaid,
    status: newStatus,
    paymentMethod,
    ...(newStatus === INVOICE_STATUS.PAID ? { paidAt: serverTimestamp(), paidBy } : {}),
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}

// Admin-only correction path (wrong amount, duplicate, refund) — voids
// instead of deleting so the record stays for audit. Firestore rules are
// what actually restrict this to Hospital Admin (see firestore.rules); this
// function has no role check of its own, same division of responsibility
// as every other accessor in this codebase.
export function voidInvoice(invoiceId, { voidedBy, reason }) {
  return updateDoc(doc(db, INVOICES_COLLECTION, invoiceId), {
    status: INVOICE_STATUS.VOID,
    voidedAt: serverTimestamp(),
    voidedBy,
    voidReason: reason || '',
    updatedAt: serverTimestamp(),
  })
}

// Best-effort convenience run on discharge when the user opts in — adds bed
// charges to billing. If the admission has a linked appointment that already
// has a 'due' invoice, appends bed charges as a new line item. Otherwise
// creates a fresh standalone invoice keyed on the admission id. Never throws
// and must never block the discharge action that triggered it.
export async function autoCreateDischargeInvoice({
  billingEnabled,
  hospitalId,
  admissionId,
  patientId,
  patientName,
  patientPhone,
  doctorId,
  doctorName,
  bedType,
  wardName,
  roomName,
  dailyRate,
  totalDays,
  totalCharges,
  linkedAppointmentId,
  createdBy,
}) {
  if (!billingEnabled) return
  const amount = Number(totalCharges)
  if (!(amount > 0)) return

  const label = `Bed Charges — ${bedType || 'General'}${wardName ? ' (' + wardName + ')' : ''}${roomName ? ', ' + roomName : ''} × ${totalDays} days @ ₹${Number(dailyRate) || 0}/day`

  try {
    // If the admission is linked to an appointment that already has a due
    // invoice, append bed charges to it instead of creating a duplicate.
    if (linkedAppointmentId) {
      const existingSnap = await getDoc(doc(db, INVOICES_COLLECTION, linkedAppointmentId))
      if (existingSnap.exists()) {
        const existing = existingSnap.data()
        if (existing.status === INVOICE_STATUS.DUE) {
          await addInvoiceCharge(linkedAppointmentId, {
            currentLineItems: existing.lineItems,
            currentDiscount: existing.discount,
            label,
            amount,
          })
          return linkedAppointmentId
        }
      }
    }

    // No existing due invoice — create a standalone one keyed on admission id.
    const today = new Date()
    const date = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const time = today.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

    await createInvoice(
      {
        hospitalId,
        appointmentId: admissionId,
        patientId,
        patientName,
        patientPhone,
        doctorId: doctorId || null,
        doctorName: doctorName || '',
        date,
        time,
        lineItems: [{ label, amount }],
        discount: 0,
      },
      createdBy
    )
    return admissionId
  } catch {
    // Best-effort — see doc comment above.
  }
}
