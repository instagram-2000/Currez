import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useFeatures } from '../../contexts/FeatureContext'
import Spinner from '../common/Spinner'

// Narrows a route within the already-authenticated /dashboard subtree to
// hospitals that have this module enabled (Super Admin > Hospital > Modules).
// Pairs with RequireRole — a route can require both a role and a feature.
function RequireFeature({ featureKey }) {
  const location = useLocation()
  const { isFeatureEnabled, loading } = useFeatures()

  if (loading) return <Spinner />

  if (!isFeatureEnabled(featureKey)) {
    return <Navigate to={{ pathname: '/dashboard/overview', search: location.search }} replace />
  }

  return <Outlet />
}

export default RequireFeature
