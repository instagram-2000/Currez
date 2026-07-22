import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from './config'

const INVOICES_COLLECTION = 'invoices'

export const INVOICE_STATUS = {
  DUE: 'due',
  PAID: 'paid',
  VOID: 'void',
}

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
  { hospitalId, appointmentId, patientId, patientName, patientPhone, doctorId, doctorName, date, time, lineItems, discount },
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

  const subtotal = round2(cleanItems.reduce((sum, item) => sum + item.amount, 0))
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

  await setDoc(ref, {
    hospitalId,
    appointmentId,
    patientId: patientId || null,
    patientName: patientName || '',
    patientPhone: patientPhone || '',
    doctorId: doctorId || null,
    doctorName: doctorName || '',
    date: date || '',
    time: time || '',
    lineItems: cleanItems,
    subtotal,
    discount: cleanDiscount,
    total,
    status: INVOICE_STATUS.DUE,
    paymentMethod: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy,
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

// Front-desk/admin recording how the invoice total was actually collected —
// same cash/online record-keeping-only fields as appointment confirmation
// (see confirmAppointment in firebase/appointments.js). Not payment
// processing: no money moves through this app either way.
export function recordInvoicePayment(invoiceId, { paymentMethod, paidBy }) {
  return updateDoc(doc(db, INVOICES_COLLECTION, invoiceId), {
    status: INVOICE_STATUS.PAID,
    paymentMethod,
    paidAt: serverTimestamp(),
    paidBy,
    updatedAt: serverTimestamp(),
  })
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
