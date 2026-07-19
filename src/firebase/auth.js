import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from './config'

// Shared by both the superadmin and hospital-admin login pages — role is
// resolved afterwards by AuthContext, not by which login form was used.
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

// Used both for a staff member's own "Forgot password?" link and for an
// admin/superadmin triggering a reset on someone else's behalf (Staff page)
// — Firebase Auth sends the email either way without requiring the target
// account to be signed in.
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email)
}

export function signOutUser() {
  return signOut(auth)
}

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback)
}
