import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

// Narrows a route within the already-authenticated /dashboard subtree to
// specific staff roles (e.g. only HOSPITAL_ADMIN sees Staff management).
function RequireRole({ allowedRoles }) {
  const location = useLocation()
  const { role } = useAuth()

  if (!allowedRoles.includes(role)) {
    return <Navigate to={{ pathname: '/dashboard/overview', search: location.search }} replace />
  }

  return <Outlet />
}

export default RequireRole
