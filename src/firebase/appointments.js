import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from './config'

const APPOINTMENTS_COLLECTION = 'appointments'

export function subscribeAppointments(hospitalId, callback) {
  const q = query(collection(db, APPOINTMENTS_COLLECTION), where('hospitalId', '==', hospitalId))
  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    appointments.sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
    callback(appointments)
  })
}

export function createAppointment(data, createdBy) {
  return addDoc(collection(db, APPOINTMENTS_COLLECTION), {
    ...data,
    status: 'scheduled',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy,
  })
}

export function updateAppointmentStatus(appointmentId, status) {
  return updateDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId), { status, updatedAt: serverTimestamp() })
}
