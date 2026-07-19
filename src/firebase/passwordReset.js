import { getFunctions, httpsCallable } from 'firebase/functions'
import { firebaseApp } from './config'

const functions = getFunctions(firebaseApp)

export async function updateStaffPassword(uid, newPassword) {
  const callUpdate = httpsCallable(functions, 'updateStaffPassword')
  const result = await callUpdate({ uid, newPassword })
  return result.data
}
