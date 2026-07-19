import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

initializeApp()

export const updateStaffPassword = onCall(async (request) => {
  const auth = request.auth
  if (!auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to perform this action.')
  }

  const { uid, newPassword } = request.data

  if (!uid || !newPassword) {
    throw new HttpsError('invalid-argument', 'uid and newPassword are required.')
  }

  if (newPassword.length < 6) {
    throw new HttpsError('invalid-argument', 'Password must be at least 6 characters.')
  }

  await getAuth().updateUser(uid, { password: newPassword })

  return { success: true }
})
