import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './config'
import { ROLES } from '../utils/roles'

const USERS_COLLECTION = 'users'

// `extra` carries role-specific fields (e.g. a doctor's specialization
// and weekly schedule) without forcing every caller to know about them.
export function createUserDoc(uid, { email, displayName, role, hospitalId, createdBy, ...extra }) {
  return setDoc(doc(db, USERS_COLLECTION, uid), {
    email,
    displayName,
    role,
    hospitalId,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy,
    ...extra,
  })
}

export function updateDoctorSchedule(uid, schedule) {
  return updateDoc(doc(db, USERS_COLLECTION, uid), { schedule, updatedAt: serverTimestamp() })
}

export function updateDoctorProfile(uid, profile) {
  return updateDoc(doc(db, USERS_COLLECTION, uid), { ...profile, updatedAt: serverTimestamp() })
}

export function getDoctor(uid) {
  return getDoc(doc(db, USERS_COLLECTION, uid)).then((snap) => (snap.exists() ? { uid: snap.id, ...snap.data() } : null))
}

export function subscribeDoctor(uid, callback) {
  return onSnapshot(doc(db, USERS_COLLECTION, uid), (snap) => {
    callback(snap.exists() ? { uid: snap.id, ...snap.data() } : null)
  })
}

export function upsertSuperAdminDoc(uid, { email, displayName }) {
  return setDoc(
    doc(db, USERS_COLLECTION, uid),
    {
      email,
      displayName: displayName || email,
      role: ROLES.SUPERADMIN,
      hospitalId: null,
      status: 'active',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export function subscribeUsersByHospital(hospitalId, callback) {
  const q = query(collection(db, USERS_COLLECTION), where('hospitalId', '==', hospitalId))
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ uid: d.id, ...d.data() })))
  })
}

// Narrower than subscribeUsersByHospital — matches the public Firestore
// rule that only exposes active doctors (never receptionists/admins) to
// unauthenticated visitors, for the public booking page's doctor picker.
export function subscribeActiveDoctors(hospitalId, callback) {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('hospitalId', '==', hospitalId),
    where('role', '==', ROLES.DOCTOR),
    where('status', '==', 'active')
  )
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ uid: d.id, ...d.data() })))
  })
}

export async function getStaffCount() {
  const q = query(collection(db, USERS_COLLECTION), where('role', '!=', ROLES.SUPERADMIN))
  const snapshot = await getCountFromServer(q)
  return snapshot.data().count
}

export function setUserStatus(uid, status) {
  return updateDoc(doc(db, USERS_COLLECTION, uid), { status, updatedAt: serverTimestamp() })
}

// Hospital Admin-only, Receptionist-only toggle: lets an admin trust some
// receptionists with Billing (create invoices, record payments) and not
// others, independent of the blanket RECEPTIONIST role. Missing/undefined
// on a user doc means allowed — see firestore.rules' isBillingStaffOf —
// so every receptionist that existed before this flag was added keeps its
// current access; only an explicit `false` here takes it away.
export function setUserBillingAccess(uid, enabled) {
  return updateDoc(doc(db, USERS_COLLECTION, uid), { billingAccess: enabled, updatedAt: serverTimestamp() })
}

export async function hasActiveStaffForHospital(hospitalId) {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('hospitalId', '==', hospitalId),
    where('status', '==', 'active')
  )
  const snapshot = await getCountFromServer(q)
  return snapshot.data().count > 0
}
