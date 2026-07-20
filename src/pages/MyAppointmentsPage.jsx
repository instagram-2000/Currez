import { useState } from 'react'
import { getAppointmentsByPhone } from '../firebase/appointments'
import { categorizeAppointments, TABS, TAB_TODAY } from '../utils/appointmentFilters'
import { validators } from '../utils/validations'
import { useFormValidation } from '../hooks/useFormValidation'
import LanguageSwitcher from '../components/common/LanguageSwitcher'
import ThemeToggle from '../components/common/ThemeToggle'
import NavIcon from '../components/common/NavIcon'

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2.5 text-base text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-600 ring-amber-500/30 dark:text-amber-400',
  scheduled: 'bg-sky-500/10 text-sky-600 ring-sky-500/30 dark:text-sky-400',
  completed: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400',
  cancelled: 'bg-card-strong text-muted ring-line',
}

const STATUS_LABELS = {
  pending: 'Pending',
  scheduled: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function MyAppointmentsPage({ slug }) {
  const [phone, setPhone] = useState('')
  const [appointments, setAppointments] = useState(null)
  const [activeTab, setActiveTab] = useState(TAB_TODAY)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { errors, validate, clearFieldError } = useFormValidation({
    phone: [validators.phone('Enter a valid phone number.')],
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setAppointments(null)
    if (!validate({ phone })) return

    setSubmitting(true)
    try {
      const found = await getAppointmentsByPhone(slug, phone.trim())
      if (found.length === 0) {
        setError('No appointments found for this phone number.')
      } else {
        setAppointments(found)
        setActiveTab(TAB_TODAY)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const categorized = appointments ? categorizeAppointments(appointments) : {}

  return (
    <div className="flex min-h-screen items-start justify-center bg-page px-6 py-10 text-heading">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-8 shadow-xl">
        <div className="flex justify-end">
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        <div className="mt-2">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--tenant-primary, #6366f1) 18%, transparent)', color: 'var(--tenant-primary, #6366f1)' }}
          >
            <NavIcon name="calendar" className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-heading">My Appointments</h1>
          <p className="mt-1 text-sm text-muted">Enter your phone number to view your appointments.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-body">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); clearFieldError('phone') }}
                className={inputClass}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: 'var(--tenant-primary, #6366f1)' }}
            >
              <NavIcon name="calendar" className="h-4 w-4" />
              {submitting ? 'Looking up...' : 'View My Appointments'}
            </button>
          </form>
        </div>

        {appointments && (
          <div className="mt-6">
            <div className="flex gap-1 rounded-xl bg-card-strong p-1">
              {TABS.map((tab) => {
                const count = (categorized[tab.key] || []).length
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-card text-heading shadow-sm'
                        : 'text-muted hover:text-heading'
                    }`}
                  >
                    {tab.label} ({count})
                  </button>
                )
              })}
            </div>

            <div className="mt-4 space-y-3">
              {(categorized[activeTab] || []).length === 0 && (
                <p className="py-8 text-center text-sm text-faint">No {activeTab} appointments.</p>
              )}
              {(categorized[activeTab] || []).map((appt) => (
                <div
                  key={appt.id}
                  className="rounded-lg border border-line bg-card-strong p-4 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        STATUS_STYLES[appt.status] || STATUS_STYLES.scheduled
                      }`}
                    >
                      {STATUS_LABELS[appt.status] || appt.status}
                    </span>
                    <span className="text-xs text-faint">{appt.token}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-heading">{appt.patientName}</p>
                    <p className="text-muted">
                      {appt.date}
                      {appt.time && <span> at {appt.time}</span>}
                    </p>
                    {appt.doctorName && (
                      <p className="text-muted">Dr. {appt.doctorName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyAppointmentsPage
