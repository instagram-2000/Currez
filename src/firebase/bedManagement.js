import {
  arrayUnion,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './config'

const BED_CONFIG_COLLECTION = 'bedConfig'
const ADMISSIONS_COLLECTION = 'admissions'

// ─── Bed Config ──────────────────────────────────────────────────────────────

export function subscribeBedConfig(hospitalId, callback) {
  return onSnapshot(doc(db, BED_CONFIG_COLLECTION, hospitalId), (snap) => {
    callback(snap.exists() ? { hospitalId: snap.id, ...snap.data() } : null)
  })
}

export async function getBedConfig(hospitalId) {
  const snap = await getDoc(doc(db, BED_CONFIG_COLLECTION, hospitalId))
  return snap.exists() ? { hospitalId: snap.id, ...snap.data() } : null
}

export function updateBedConfig(hospitalId, config, updatedBy) {
  return updateDoc(doc(db, BED_CONFIG_COLLECTION, hospitalId), {
    ...config,
    updatedAt: serverTimestamp(),
    updatedBy,
  })
}

export async function createBedConfig(hospitalId, config, createdBy) {
  return setDoc(doc(db, BED_CONFIG_COLLECTION, hospitalId), {
    ...config,
    hospitalId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy,
  })
}

// ─── Admissions ──────────────────────────────────────────────────────────────

export function subscribeActiveAdmissions(hospitalId, callback) {
  const q = query(
    collection(db, ADMISSIONS_COLLECTION),
    where('hospitalId', '==', hospitalId),
    where('status', '==', 'active')
  )
  return onSnapshot(q, (snap) => {
    const admissions = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    admissions.sort((a, b) => (b.admittedAt?.toMillis?.() ?? 0) - (a.admittedAt?.toMillis?.() ?? 0))
    callback(admissions)
  })
}

export function subscribeAllAdmissions(hospitalId, callback) {
  const q = query(
    collection(db, ADMISSIONS_COLLECTION),
    where('hospitalId', '==', hospitalId)
  )
  return onSnapshot(q, (snap) => {
    const admissions = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    admissions.sort((a, b) => (b.admittedAt?.toMillis?.() ?? 0) - (a.admittedAt?.toMillis?.() ?? 0))
    callback(admissions)
  })
}

export async function admitPatient(
  {
    hospitalId,
    patientId,
    patientName,
    patientPhone,
    floorId,
    floorName,
    wardId,
    wardName,
    roomId,
    roomName,
    bedId,
    bedType,
    dailyRate,
    attendingDoctor,
    attendingDoctorId,
    diagnosis,
    notes,
    linkedAppointmentId,
  },
  admittedBy
) {
  if (!hospitalId || !bedId) {
    throw new Error('Hospital ID and Bed ID are required.')
  }
  if (!patientId && !patientName) {
    throw new Error('A patient is required for admission.')
  }
  if (!diagnosis?.trim()) {
    throw new Error('Diagnosis is required.')
  }

  const existingQuery = query(
    collection(db, ADMISSIONS_COLLECTION),
    where('hospitalId', '==', hospitalId),
    where('bedId', '==', bedId),
    where('status', '==', 'active')
  )
  const existingSnap = await getDocs(existingQuery)
  const conflicting = existingSnap.docs.find((d) => {
    const data = d.data()
    return data.floorId === floorId && data.wardId === wardId && data.roomId === roomId
  })
  if (conflicting) {
    throw new Error('This bed is already occupied.')
  }

  const ref = await addDoc(collection(db, ADMISSIONS_COLLECTION), {
    hospitalId,
    patientId: patientId || null,
    patientName: (patientName || '').trim(),
    patientPhone: (patientPhone || '').trim(),
    floorId,
    floorName,
    wardId,
    wardName,
    roomId,
    roomName,
    bedId,
    bedType,
    dailyRate: Number(dailyRate) || 0,
    status: 'active',
    admittedAt: serverTimestamp(),
    dischargedAt: null,
    dischargedBy: null,
    dischargeSummary: '',
    admittedBy,
    attendingDoctor: attendingDoctor || '',
    attendingDoctorId: attendingDoctorId || null,
    diagnosis: diagnosis.trim(),
    notes: (notes || '').trim(),
    totalDays: 0,
    totalCharges: 0,
    linkedAppointmentId: linkedAppointmentId || null,
    linkedInvoiceId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}

// Moves an active admission to a different bed WITHOUT discharging it — same
// admission doc, same admittedAt, same eventual invoice. This is the fix for
// "moving a patient to another room creates a second invoice": that used to
// require discharge + a brand-new admitPatient() call, which fragmented one
// continuous stay into two separate admission docs (and, since the invoice
// doc id is literally the admission id — see createInvoice in billing.js —
// two separate invoices). A lateral move now just rewrites the location
// fields in place, so there's only ever one admission, and therefore only
// one invoice, for the whole stay.
export async function transferAdmission(admission, destination, transferredBy) {
  const { id: admissionId, hospitalId } = admission || {}
  if (!admissionId || !destination?.bedId) {
    throw new Error('Admission and destination bed are required.')
  }

  const existingQuery = query(
    collection(db, ADMISSIONS_COLLECTION),
    where('hospitalId', '==', hospitalId),
    where('bedId', '==', destination.bedId),
    where('status', '==', 'active')
  )
  const existingSnap = await getDocs(existingQuery)
  const conflicting = existingSnap.docs.find((d) => {
    if (d.id === admissionId) return false
    const data = d.data()
    return (
      data.floorId === destination.floorId &&
      (data.wardId || null) === (destination.wardId || null) &&
      (data.roomId || null) === (destination.roomId || null)
    )
  })
  if (conflicting) {
    throw new Error('The destination bed is already occupied.')
  }

  await updateDoc(doc(db, ADMISSIONS_COLLECTION, admissionId), {
    floorId: destination.floorId,
    floorName: destination.floorName,
    wardId: destination.wardId || null,
    wardName: destination.wardName || null,
    roomId: destination.roomId || null,
    roomName: destination.roomName || null,
    bedId: destination.bedId,
    bedType: destination.bedType,
    dailyRate: Number(destination.dailyRate) || 0,
    transferHistory: arrayUnion({
      fromBedId: admission.bedId,
      fromFloorName: admission.floorName || null,
      fromWardName: admission.wardName || null,
      fromRoomName: admission.roomName || null,
      toBedId: destination.bedId,
      toFloorName: destination.floorName,
      toWardName: destination.wardName || null,
      toRoomName: destination.roomName || null,
      transferredAt: new Date(),
      transferredBy,
    }),
    updatedAt: serverTimestamp(),
  })
}

export async function dischargePatient(admissionId, { dischargeSummary, dischargedBy, totalDays, totalCharges }) {
  await updateDoc(doc(db, ADMISSIONS_COLLECTION, admissionId), {
    status: 'discharged',
    dischargedAt: serverTimestamp(),
    dischargedBy,
    dischargeSummary: (dischargeSummary || '').trim(),
    totalDays,
    totalCharges,
    updatedAt: serverTimestamp(),
  })
}
