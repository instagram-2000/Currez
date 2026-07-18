import {
  collection,
  doc,
  getCountFromServer,
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

export async function getStaffCount() {
  const q = query(collection(db, USERS_COLLECTION), where('role', '!=', ROLES.SUPERADMIN))
  const snapshot = await getCountFromServer(q)
  return snapshot.data().count
}

export function setUserStatus(uid, status) {
  return updateDoc(doc(db, USERS_COLLECTION, uid), { status, updatedAt: serverTimestamp() })
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
