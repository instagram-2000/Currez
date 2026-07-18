import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../utils/roles'
import Spinner from '../common/Spinner'

const STAFF_ROLES = [ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]

// Gate for the whole /dashboard subtree: any active staff role of THIS
// hospital may enter. Which tabs/pages they see once inside is further
// narrowed by RequireRole on individual routes.
function RequireHospitalStaff({ tenantSlug }) {
  const location = useLocation()
  const { loading, user, role, hospitalId, status } = useAuth()

  if (loading) return <Spinner />

  const authorized =
    user && STAFF_ROLES.includes(role) && hospitalId === tenantSlug && status !== 'disabled'

  if (!authorized) {
    return <Navigate to={{ pathname: '/login', search: location.search }} replace />
  }

  return <Outlet />
}

export default RequireHospitalStaff
