import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { signIn, signOutUser, resetPassword } from '../../firebase/auth'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../utils/roles'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'
import Spinner from '../../components/common/Spinner'
import ThemeToggle from '../../components/common/ThemeToggle'
import NavIcon from '../../components/common/NavIcon'
import PasswordInput from '../../components/common/PasswordInput'

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'
const labelClass = 'block text-sm font-medium text-body'

function AuthCard({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-6 text-heading">
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
      />
      <ThemeToggle className="absolute top-4 right-4" />
      <Link
        to="/"
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-heading"
      >
        <NavIcon name="arrowLeft" className="h-4 w-4" />
        Back to site
      </Link>
      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface/60 p-8 backdrop-blur">
        {children}
      </div>
    </div>
  )
}

function SuperAdminLoginPage() {
  const { loading, user, role } = useAuth()
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

  if (loading) return <Spinner />
  if (user && role === ROLES.SUPERADMIN) return <Navigate to="/superadmin/dashboard" replace />

  if (user && role !== ROLES.SUPERADMIN) {
    return (
      <AuthCard>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-heading">Not authorized</h1>
          <p className="mt-2 text-sm text-muted">{user.email} does not have super admin access.</p>
          <button
            onClick={() => signOutUser()}
            className="mt-6 w-full cursor-pointer rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Sign out
          </button>
        </div>
      </AuthCard>
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
      setResetSent(true)
    } finally {
      setResetting(false)
    }
  }

  return (
    <AuthCard>
      <h1 className="text-xl font-semibold text-heading">Super Admin</h1>
      <p className="mt-1 text-sm text-muted">Sign in to manage hospitals and staff.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
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
          className="w-full cursor-pointer rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
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
    </AuthCard>
  )
}

export default SuperAdminLoginPage
