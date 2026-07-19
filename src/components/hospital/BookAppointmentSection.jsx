import { useState } from 'react'
import { createPatient } from '../../firebase/patients'
import { createAppointment } from '../../firebase/appointments'
import { useLanguage } from '../../contexts/LanguageContext'
import SectionEyebrow from './SectionEyebrow'
import Reveal from '../common/Reveal'

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'
const labelClass = 'block text-sm font-medium text-body'
const todayString = () => new Date().toISOString().slice(0, 10)

// A lighter, no-account-needed request form — unlike the full /appointment
// page it doesn't ask for a doctor or exact time; reception calls back to
// confirm and schedule, so it still flows into the same pending-appointment
// pipeline the rest of the app already uses (token, front-desk confirm, etc).
function BookAppointmentSection({ config }) {
  const { t } = useLanguage()
  const departments = config.optionals?.departments?.items ?? []
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState(departments[0]?.name || '')
  const [date, setDate] = useState(todayString())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const patientId = await createPatient(config.slug, { name, phone, email: '' }, 'public')
      const token = await createAppointment(
        {
          hospitalId: config.slug,
          patientId,
          patientName: name.trim(),
          patientPhone: phone.trim(),
          doctorId: null,
          doctorName: '',
          date,
          time: '',
          notes: department ? `Department preference: ${department}` : '',
          status: 'pending',
          bookedBy: 'patient',
        },
        'public'
      )
      setSubmitted({ token })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="px-6 py-20 md:px-12">
      <Reveal>
        <SectionEyebrow>{t('booking.sectionEyebrow')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold text-heading">{t('booking.sectionTitle')}</h2>
        <p className="mt-2 max-w-md text-sm text-body">{t('booking.sectionSubtitle')}</p>
      </Reveal>

      <Reveal delay={100} className="mt-8 max-w-2xl">
        {submitted ? (
          <div className="rounded-xl border border-line bg-card p-6">
            <p className="text-heading">{t('booking.sectionReceived')}</p>
            <p
              className="mt-3 inline-block rounded-lg bg-card-strong px-4 py-2 font-mono text-lg font-bold tracking-widest"
              style={{ color: 'var(--tenant-primary)' }}
            >
              {submitted.token}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>{t('booking.fullName')}</label>
              <input
                type="text"
                required
                placeholder={t('booking.yourName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('booking.phoneNumber')}</label>
              <input
                type="tel"
                required
                placeholder="+91"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
            {departments.length > 0 && (
              <div>
                <label className={labelClass}>{t('booking.department')}</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  {departments.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={labelClass}>{t('booking.preferredDate')}</label>
              <input
                type="date"
                required
                min={todayString()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-red-500 sm:col-span-3">{error}</p>}

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer rounded-lg border px-6 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)' }}
              >
                {submitting ? t('booking.sectionSubmitting') : t('booking.sectionSubmit')}
              </button>
            </div>
          </form>
        )}
      </Reveal>
    </section>
  )
}

export default BookAppointmentSection
