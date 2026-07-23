import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { canViewModule } from '../../utils/permissions'

// Narrows a route within the already-authenticated /dashboard subtree to
// staff whose Super-Admin-assigned module permission isn't 'none' (see
// src/utils/permissions.js) — pairs with RequireRole/RequireFeature, which
// already gate the same route by role and hospital-wide feature flags.
// This only ever narrows further; it can never grant access those two
// don't already allow.
function RequirePermission({ moduleKey }) {
  const location = useLocation()
  const { userDoc } = useAuth()

  if (!canViewModule(userDoc, moduleKey)) {
    return <Navigate to={{ pathname: '/dashboard/overview', search: location.search }} replace />
  }

  return <Outlet />
}

export default RequirePermission
