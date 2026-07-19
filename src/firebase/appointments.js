import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  query,
  collection,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './config'
import { generateToken } from '../utils/appointmentToken'

const APPOINTMENTS_COLLECTION = 'appointments'
const PHONE_LOOKUP_COLLECTION = 'phoneLookup'

function normalizePhone(phone) {
  return (phone || '').replace(/\D/g, '')
}

function phoneLookupId(hospitalId, phone) {
  return `${hospitalId}::${normalizePhone(phone)}`
}

export function subscribeAppointments(hospitalId, callback) {
  const q = query(collection(db, APPOINTMENTS_COLLECTION), where('hospitalId', '==', hospitalId))
  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    appointments.sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
    callback(appointments)
  })
}

// The appointment's doc ID doubles as its public lookup token (see
// getAppointmentByToken) — short, unguessable, and readable off a screen.
// Collisions are practically impossible at this scale but we check anyway,
// the same way hospital slugs are checked before creation.
export async function createAppointment(data, createdBy) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generateToken()
    const ref = doc(db, APPOINTMENTS_COLLECTION, token)
    const existing = await getDoc(ref)
    if (existing.exists()) continue

    await setDoc(ref, {
      ...data,
      token,
      status: data.status || 'scheduled',
      paymentMethod: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy,
    })

    // Lets the public status page look someone up by phone alone (see
    // getAppointmentsByPhone) without ever allowing an open query across
    // all appointments — the phone number is the doc ID here too, so a
    // lookup only ever returns that one patient's own token list.
    if (data.patientPhone) {
      await setDoc(
        doc(db, PHONE_LOOKUP_COLLECTION, phoneLookupId(data.hospitalId, data.patientPhone)),
        { hospitalId: data.hospitalId, tokens: arrayUnion(token), updatedAt: serverTimestamp() },
        { merge: true }
      )
    }

    return token
  }
  throw new Error('Could not generate a unique appointment token, please try again.')
}

export function updateAppointmentStatus(appointmentId, status) {
  return updateDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId), { status, updatedAt: serverTimestamp() })
}

// A doctor completes a visit by recording what it was for — reception/admin
// can still force-complete via updateAppointmentStatus above with no notes,
// but this is the path the doctor's own "Mark completed" goes through.
export function completeAppointmentWithNotes(appointmentId, { concerns, prescription, tests, completedBy }) {
  return updateDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId), {
    status: 'completed',
    concerns: concerns || '',
    prescription: prescription || [],
    tests: tests || [],
    consultedAt: serverTimestamp(),
    consultedBy: completedBy,
    updatedAt: serverTimestamp(),
  })
}

// Front-desk confirms a patient-booked (pending) appointment on arrival —
// this is what makes it visible to the doctor, and records how the visit
// fee was collected (cash in hand, or online via the hospital's own QR —
// neither is processed by this app, it's a record-keeping field only).
// If the appointment was booked without a doctor preference, confirming it
// is also the point where reception assigns one — pass doctorId/doctorName
// only when actually assigning (leave unset if it already has one).
export function confirmAppointment(appointmentId, { paymentMethod, confirmedBy, doctorId, doctorName }) {
  return updateDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId), {
    status: 'scheduled',
    paymentMethod,
    paymentConfirmedAt: serverTimestamp(),
    paymentConfirmedBy: confirmedBy,
    updatedAt: serverTimestamp(),
    ...(doctorId ? { doctorId, doctorName } : {}),
  })
}

// Public status-check lookup by token (the doc ID). If a phone is also
// supplied it's cross-checked, but the token alone is already the real
// access-control boundary (see the collection's Firestore rule).
export async function getAppointmentByToken(token, phone) {
  const snapshot = await getDoc(doc(db, APPOINTMENTS_COLLECTION, token.trim().toUpperCase()))
  if (!snapshot.exists()) return null
  const appointment = { id: snapshot.id, ...snapshot.data() }
  if (phone && normalizePhone(appointment.patientPhone) !== normalizePhone(phone)) return null
  return appointment
}

// Public status-check lookup by phone alone (no token) — resolves every
// token booked under that phone number at this hospital, then fetches
// each appointment. Returns [] if nothing matches.
export async function getAppointmentsByPhone(hospitalId, phone) {
  const lookupSnap = await getDoc(doc(db, PHONE_LOOKUP_COLLECTION, phoneLookupId(hospitalId, phone)))
  if (!lookupSnap.exists()) return []

  const tokens = lookupSnap.data().tokens || []
  const appointments = await Promise.all(
    tokens.map(async (token) => {
      const snap = await getDoc(doc(db, APPOINTMENTS_COLLECTION, token))
      return snap.exists() ? { id: snap.id, ...snap.data() } : null
    })
  )

  return appointments
    .filter((a) => a && a.hospitalId === hospitalId)
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
}
