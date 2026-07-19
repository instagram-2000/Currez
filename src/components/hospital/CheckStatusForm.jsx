import { useState } from 'react'
import { getAppointmentByToken, getAppointmentsByPhone } from '../../firebase/appointments'
import { useLanguage } from '../../contexts/LanguageContext'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'
import NavIcon from '../common/NavIcon'

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2.5 text-base text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'
const labelClass = 'block text-sm font-medium text-body'

const STATUS_COPY_KEYS = {
  pending: ['status.pendingLabel', 'status.pendingHint'],
  scheduled: ['status.scheduledLabel', 'status.scheduledHint'],
  completed: ['status.completedLabel', 'status.completedHint'],
  cancelled: ['status.cancelledLabel', 'status.cancelledHint'],
}

// Shared by the standalone /appointment-status page and the popup modal
// triggered from the landing page header/footer.
function CheckStatusForm({ slug }) {
  const { t } = useLanguage()
  const [phone, setPhone] = useState('')
  const [token, setToken] = useState('')
  const [results, setResults] = useState(undefined)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { errors, validate, clearFieldError } = useFormValidation({
    phone: [validators.phone('Enter a valid phone number.')],
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResults(undefined)

    const trimmedToken = token.trim()
    const trimmedPhone = phone.trim()
    if (!trimmedToken && !trimmedPhone) {
      setError(t('status.missingBoth'))
      return
    }

    if (!validate({ phone })) return

    setSubmitting(true)
    try {
      let found = []
      if (trimmedToken) {
        const appointment = await getAppointmentByToken(trimmedToken, trimmedPhone)
        if (appointment && appointment.hospitalId === slug) found = [appointment]
      } else {
        found = await getAppointmentsByPhone(slug, trimmedPhone)
      }

      if (found.length === 0) {
        setError(t('status.notFound'))
      } else {
        setResults(found)
      }
    } catch {
      setError(t('status.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
        <NavIcon name="clipboard" className="h-5 w-5" />
      </span>
      <h1 className="mt-4 text-xl font-bold text-heading">{t('status.title')}</h1>
      <p className="mt-1 text-sm text-muted">{t('status.subtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className={labelClass}>{t('status.phoneNumber')}</label>
          <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); clearFieldError('phone') }} className={inputClass} />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>
        <div>
          <label className={labelClass}>{t('status.token')}</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g. K7M3Q2X"
            className={`${inputClass} font-mono uppercase`}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? t('status.submitting') : t('status.submit')}
        </button>
      </form>

      {results && (
        <div className="mt-6 space-y-3">
          {results.map((result) => {
            const [labelKey, hintKey] = STATUS_COPY_KEYS[result.status] || []
            const label = labelKey ? t(labelKey) : result.status
            const hint = hintKey ? t(hintKey) : ''
            return (
              <div key={result.id} className="rounded-lg border border-line bg-card-strong p-4 text-sm">
                <p className="text-base font-semibold text-heading">{label}</p>
                <p className="mt-1 text-muted">{hint}</p>
                <dl className="mt-3 space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-muted">{t('status.doctor')}</dt>
                    <dd className="text-heading">{result.doctorName || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">{t('status.date')}</dt>
                    <dd className="text-heading">{result.date}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">{t('status.time')}</dt>
                    <dd className="text-heading">{result.time}</dd>
                  </div>
                </dl>

                {result.status === 'completed' && (result.prescription?.length > 0 || result.tests?.length > 0) && (
                  <div className="mt-3 space-y-2 border-t border-line pt-3">
                    {result.prescription?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Prescription</p>
                        <ul className="mt-1 space-y-0.5 text-heading">
                          {result.prescription.map((row, i) => (
                            <li key={i}>
                              {row.medicine}
                              {row.dosage && ` — ${row.dosage}`}
                              {row.duration && ` (${row.duration})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.tests?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Tests advised</p>
                        <ul className="mt-1 space-y-0.5 text-heading">
                          {result.tests.map((row, i) => (
                            <li key={i}>
                              {row.name}
                              {row.notes && ` — ${row.notes}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CheckStatusForm
