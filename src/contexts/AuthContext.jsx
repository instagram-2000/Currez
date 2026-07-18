import { createContext, useContext, useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { subscribeToAuthState } from '../firebase/auth'
import { upsertSuperAdminDoc } from '../firebase/users'
import { isSuperAdminEmail, ROLES } from '../utils/roles'

const AuthContext = createContext(null)

const EMPTY_SESSION = { user: null, role: null, hospitalId: null, status: null, userDoc: null, loading: false }

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ ...EMPTY_SESSION, loading: true })

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (!firebaseUser) {
        setSession(EMPTY_SESSION)
        return
      }

      if (isSuperAdminEmail(firebaseUser.email)) {
        // Best-effort defense-in-depth record; login must not fail if this write fails.
        upsertSuperAdminDoc(firebaseUser.uid, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        }).catch(() => {})

        setSession({
          user: firebaseUser,
          role: ROLES.SUPERADMIN,
          hospitalId: null,
          status: 'active',
          userDoc: null,
          loading: false,
        })
        return
      }

      try {
        const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (snapshot.exists()) {
          const data = snapshot.data()
          setSession({
            user: firebaseUser,
            role: data.role,
            hospitalId: data.hospitalId ?? null,
            status: data.status,
            userDoc: data,
            loading: false,
          })
        } else {
          setSession({ user: firebaseUser, role: null, hospitalId: null, status: null, userDoc: null, loading: false })
        }
      } catch {
        setSession({ user: firebaseUser, role: null, hospitalId: null, status: null, userDoc: null, loading: false })
      }
    })

    return unsubscribe
  }, [])

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
