import { initializeApp, getApps } from 'firebase/app'
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
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

// Persistent local cache (IndexedDB, shared across tabs) means a listener
// that's torn down and re-attached (e.g. remounting a page) serves its
// initial snapshot from disk instead of re-reading every document from the
// server again — this is on top of, not instead of, deduplicating listeners
// via HospitalDataContext/FeatureContext; the cache mainly softens repeat
// reads across page refreshes/tab reopens.
export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
export const auth = getAuth(firebaseApp)

// Opt-in local dev flag — points Firestore at `firebase emulators:start
// --only firestore` instead of production, for testing rules/data changes
// safely. Off unless explicitly set in .env.local (gitignored).
if (import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
