import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { signIn, signOutUser, resetPassword } from '../../firebase/auth'
import { subscribeHospital } from '../../firebase/hospitals'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../utils/roles'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'
import Spinner from '../../components/common/Spinner'
import ThemeToggle from '../../components/common/ThemeToggle'
import NavIcon from '../../components/common/NavIcon'
import PasswordInput from '../../components/common/PasswordInput'

const STAFF_ROLES = [ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'
const labelClass = 'block text-sm font-medium text-body'

function CenteredCard({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-6 text-heading">
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
      />
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface/60 p-8 backdrop-blur">
        {children}
      </div>
    </div>
  )
}

function HospitalLoginPage({ tenantSlug }) {
  const location = useLocation()
  const { loading, user, role, hospitalId, status } = useAuth()
  const [hospitalTitle, setHospitalTitle] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetting, setResetting] = useState(false)
  const { errors, validate, clearFieldError } = useFormValidation({
    email: [validators.required('Email is required.'), validators.email('Enter a valid email address.')],
    password: [validators.required('Password is required.')],
  })

  useEffect(
    () => subscribeHospital(tenantSlug, (config) => setHospitalTitle(config?.title || '')),
    [tenantSlug]
  )

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
      <CenteredCard>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-heading">Not available</h1>
          <p className="mt-2 text-sm text-muted">{message}</p>
          <button
            onClick={() => signOutUser()}
            className="mt-6 w-full cursor-pointer rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Sign out
          </button>
        </div>
      </CenteredCard>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validate({ email, password })) return
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
    } catch {
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgotPassword() {
    setError('')
    setResetSent(false)
    if (!email.trim() || validators.email('invalid')(email.trim())) {
      setError('Enter a valid email above first, then click "Forgot password?" again.')
      return
    }
    setResetting(true)
    try {
      await resetPassword(email.trim())
      setResetSent(true)
    } catch {
      // Don't reveal whether the email exists — same message either way.
      setResetSent(true)
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-6 py-10 text-heading">
      <ThemeToggle className="absolute top-4 right-4" />
      <Link
        to={{ pathname: '/', search: location.search }}
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-heading"
      >
        <NavIcon name="arrowLeft" className="h-4 w-4" />
        Back to site
      </Link>
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-surface shadow-xl md:flex">
        {/* Branding panel */}
        <div
          className="relative flex flex-col justify-between overflow-hidden p-8 md:w-2/5"
          style={{ background: 'linear-gradient(160deg, color-mix(in srgb, #6366f1 20%, transparent), transparent 60%)' }}
        >
          <div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-sm font-bold text-indigo-600 dark:text-indigo-300">
              {(hospitalTitle || 'H').charAt(0).toUpperCase()}
            </span>
            <p className="mt-6 text-xs font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-300">
              Staff Portal
            </p>
            <h1 className="mt-2 text-2xl font-bold text-heading">{hospitalTitle || 'Hospital Dashboard'}</h1>
            <p className="mt-3 text-sm text-muted">
              One sign-in for every role — consults, records and front-desk, all in sync.
            </p>
          </div>

          <svg viewBox="0 0 220 60" className="my-8 h-14 w-full text-line-strong" fill="none">
            <polyline
              points="0,40 45,40 60,10 78,52 95,32 130,32 220,32"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="60" cy="10" r="3" fill="currentColor" />
          </svg>

          <div className="border-t border-line pt-4">
            <p className="flex items-center gap-2 text-xs text-muted">
              <NavIcon name="lock" className="h-3.5 w-3.5 shrink-0" />
              Access is role-based and logged for audit.
            </p>
          </div>
        </div>

        {/* Sign-in panel */}
        <div className="p-8 md:w-3/5">
          <h2 className="text-xl font-bold text-heading">Sign in</h2>
          <p className="mt-1 text-sm text-muted">Your role is detected automatically after you sign in.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="you@hospital.in"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); setResetSent(false) }}
                className={inputClass}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
                className={inputClass}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {resetSent && (
              <p className="text-sm text-emerald-500">
                If an account exists for that email, a password reset link has been sent.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-center text-sm">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetting}
                className="cursor-pointer text-indigo-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-400"
              >
                {resetting ? 'Sending reset link…' : 'Forgot password?'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default HospitalLoginPage
