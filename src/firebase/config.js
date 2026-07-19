import { initializeApp, getApps } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)

// Opt-in local dev flag — points Firestore at `firebase emulators:start
// --only firestore` instead of production, for testing rules/data changes
// safely. Off unless explicitly set in .env.local (gitignored).
if (import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
