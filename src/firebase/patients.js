import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from './config'

const PATIENTS_COLLECTION = 'patients'

export function subscribePatients(hospitalId, callback) {
  const q = query(collection(db, PATIENTS_COLLECTION), where('hospitalId', '==', hospitalId))
  return onSnapshot(q, (snapshot) => {
    const patients = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    patients.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
    callback(patients)
  })
}

export async function createPatient(hospitalId, { name, phone, email }, createdBy) {
  const ref = await addDoc(collection(db, PATIENTS_COLLECTION), {
    hospitalId,
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy,
  })
  return ref.id
}

export function updatePatient(patientId, patch) {
  return updateDoc(doc(db, PATIENTS_COLLECTION, patientId), { ...patch, updatedAt: serverTimestamp() })
}
