import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { signIn, signOutUser } from '../../firebase/auth'
import { resolveHospitalConfig } from '../../utils/hospitalConfig'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../utils/roles'
import Spinner from '../../components/common/Spinner'

const STAFF_ROLES = [ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]

function HospitalLoginPage({ tenantSlug }) {
  const location = useLocation()
  const { loading, user, role, hospitalId, status } = useAuth()
  const [hospitalTitle, setHospitalTitle] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    resolveHospitalConfig(tenantSlug).then((config) => setHospitalTitle(config?.title || ''))
  }, [tenantSlug])

  if (loading) return <Spinner />

  const isAuthorizedStaff =
    user && STAFF_ROLES.includes(role) && hospitalId === tenantSlug && status !== 'disabled'

  if (isAuthorizedStaff) {
    return <Navigate to={{ pathname: '/dashboard/overview', search: location.search }} replace />
  }

  if (user) {
    const message =
      status === 'disabled'
        ? 'Your account has been deactivated. Contact your hospital admin.'
        : `${user.email} does not have access to this hospital's dashboard.`
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Not available</h1>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
          <button
            onClick={() => signOutUser()}
            className="mt-6 w-full cursor-pointer rounded-lg bg-slate-900 py-2 text-sm font-medium text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
    } catch {
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Staff Login</h1>
        <p className="mt-1 text-sm text-slate-500">
          {hospitalTitle ? `Sign in to manage ${hospitalTitle}.` : 'Sign in to your hospital dashboard.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full cursor-pointer rounded-lg bg-slate-900 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default HospitalLoginPage
