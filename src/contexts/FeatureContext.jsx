import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { subscribeToHospitalFeatures, isFeatureEnabled as checkFeatureEnabled } from '../firebase/hospitalFeatures'

const FeatureContext = createContext(null)

const EMPTY_STATE = { features: {}, loading: true }

// Lives inside the /dashboard subtree (mounted after RequireHospitalStaff,
// so hospitalId from useAuth() is already resolved). One onSnapshot
// subscription per session, shared by the whole portal via context — this
// is the client-side cache: components call useFeature()/useFeatures()
// instead of ever reading hospitalFeatures from Firestore directly.
export function FeatureProvider({ children }) {
  const { hospitalId } = useAuth()
  const [state, setState] = useState(EMPTY_STATE)

  useEffect(() => {
    if (!hospitalId) {
      setState(EMPTY_STATE)
      return
    }
    setState((prev) => ({ ...prev, loading: true }))
    return subscribeToHospitalFeatures(hospitalId, (features) => setState({ features, loading: false }))
  }, [hospitalId])

  const value = useMemo(
    () => ({
      ...state,
      isFeatureEnabled: (key) => checkFeatureEnabled(state.features, key),
    }),
    [state]
  )

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>
}

export function useFeatures() {
  const context = useContext(FeatureContext)
  if (!context) throw new Error('useFeatures must be used within a FeatureProvider')
  return context
}
