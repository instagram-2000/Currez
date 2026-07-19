import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeHospital } from '../../firebase/hospitals'
import { subscribeActiveDoctors } from '../../firebase/users'
import { createPatient } from '../../firebase/patients'
import { createAppointment } from '../../firebase/appointments'
import { weekdayKeyForDate, availableSlotsForDate } from '../../utils/doctorSchedule'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'
import { useLanguage } from '../../contexts/LanguageContext'
import NavIcon from '../common/NavIcon'
import TimeSlotPicker from '../common/TimeSlotPicker'

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2.5 text-base text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'
const labelClass = 'block text-sm font-medium text-body'
const todayString = () => new Date().toISOString().slice(0, 10)

// Shared by the standalone /appointment page and the popup modal triggered
// from the landing page header/hero/footer — same form, same success state,
// just wrapped differently (full-page card vs. dialog).
// `onCheckStatus`, when provided (the modal case), swaps to the status
// modal in place instead of navigating to the standalone status page.
function BookAppointmentForm({ slug, onCheckStatus }) {
  const { t } = useLanguage()
  const [hospital, setHospital] = useState(undefined)
  const [doctors, setDoctors] = useState([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState(todayString())
  const [time, setTime] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const { errors, validate, clearFieldError } = useFormValidation({
    name: [validators.required('Name is required.')],
    phone: [validators.required('Phone is required.'), validators.phone('Enter a valid phone number.')],
    date: [validators.required('Date is required.')],
  })

  useEffect(() => subscribeHospital(slug, setHospital), [slug])
  useEffect(() => subscribeActiveDoctors(slug, setDoctors), [slug])

  // Time isn't required to submit — a patient can leave it as "any time"
  // and reception will pick an exact slot when they confirm at the desk.
  useEffect(() => {
    setTime('')
  }, [doctorId, date])

  const selectedDoctor = doctors.find((d) => d.uid === doctorId)
  const weekday = weekdayKeyForDate(date)
  const daySchedule = selectedDoctor?.schedule?.[weekday]
  // No visibility into other patients' bookings here (public/unauthenticated) —
  // slots reflect the doctor's working hours only; reception resolves any
  // double-booking when they confirm.
  const slots = selectedDoctor ? availableSlotsForDate(selectedDoctor.schedule, date) : []

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validate({ name, phone, date, time })) return
    setSubmitting(true)
    try {
      const patientId = await createPatient(slug, { name, phone, email: '' }, 'public')
      const token = await createAppointment(
        {
          hospitalId: slug,
          patientId,
          patientName: name.trim(),
          patientPhone: phone.trim(),
          doctorId: doctorId || null,
          doctorName: selectedDoctor?.displayName || '',
          date,
          time,
          notes: '',
          status: 'pending',
          bookedBy: 'patient',
        },
        'public'
      )
      setResult({ token, date, doctorName: selectedDoctor?.displayName })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (hospital === undefined) return null
  if (!hospital) {
    return <p className="text-center text-muted">{t('booking.hospitalNotFound')}</p>
  }

  if (result) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
          <NavIcon name="appointments" className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-heading">{t('booking.requestedTitle')}</h1>
        <p className="mt-2 text-sm text-muted">
          {result.doctorName
            ? t('booking.requestedBodyWithDoctor', { date: result.date, doctor: result.doctorName })
            : t('booking.requestedBodyNoDoctor', { date: result.date })}
        </p>
        <p
          className="mt-6 rounded-lg bg-card-strong py-4 font-mono text-2xl font-bold tracking-widest"
          style={{ color: 'var(--tenant-primary, #6366f1)' }}
        >
          {result.token}
        </p>
        <p className="mt-4 text-xs text-faint">{t('booking.saveTokenHint')}</p>
        {onCheckStatus ? (
          <button
            onClick={onCheckStatus}
            className="mt-6 cursor-pointer text-sm font-medium text-body hover:text-heading"
          >
            {t('booking.checkStatusLink')}
          </button>
        ) : (
          <Link
            to={{ pathname: '/appointment-status', search: `?tenant=${slug}` }}
            className="mt-6 inline-block text-sm font-medium text-body hover:text-heading"
          >
            {t('booking.checkStatusLink')}
          </Link>
        )}
      </div>
    )
  }

  const callPhone = hospital.emergency?.enabled && hospital.emergency?.phone ? hospital.emergency.phone : hospital.footer?.phone

  return (
    <div>
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: 'color-mix(in srgb, var(--tenant-primary) 18%, transparent)', color: 'var(--tenant-primary)' }}
      >
        <NavIcon name="appointments" className="h-5 w-5" />
      </span>
      <h1 className="mt-4 text-xl font-bold text-heading">{t('booking.title')}</h1>
      <p className="mt-1 text-sm text-muted">{t('booking.subtitle', { hospital: hospital.title })}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className={labelClass}>{t('booking.yourName')}</label>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => { setName(e.target.value); clearFieldError('name') }}
            className={inputClass}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className={labelClass}>{t('booking.phoneNumber')}</label>
          <input
            type="tel"
            placeholder="+91"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); clearFieldError('phone') }}
            className={inputClass}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label className={labelClass}>{t('booking.doctor')} (optional)</label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">{t('booking.noPreference')}</option>
            {doctors.map((d) => (
              <option key={d.uid} value={d.uid}>
                {d.displayName} {d.specialization ? `— ${d.specialization}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>{t('booking.preferredDate')}</label>
          <input
            type="date"
            min={todayString()}
            value={date}
            onChange={(e) => { setDate(e.target.value); clearFieldError('date') }}
            className={inputClass}
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
        </div>

        {selectedDoctor ? (
          <div>
            <label className={labelClass}>{t('booking.preferredTime')}</label>
            {daySchedule?.available && (
              <p className="mt-1 mb-2 text-xs text-faint">
                {t('booking.scheduleAvailable', {
                  doctor: selectedDoctor.displayName,
                  day: t(`day.${weekday}`),
                  start: daySchedule.start,
                  end: daySchedule.end,
                })}
              </p>
            )}
            <TimeSlotPicker
              slots={slots}
              value={time}
              onChange={setTime}
              allowAny
              anyLabel={t('booking.anyTime')}
              emptyHint={t('booking.scheduleUnavailable', { doctor: selectedDoctor.displayName, day: t(`day.${weekday}`) })}
            />
          </div>
        ) : (
          <p className="text-xs text-faint">{t('booking.noDoctorTimeHint')}</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)' }}
        >
          <NavIcon name="appointments" className="h-4 w-4" />
          {submitting ? t('booking.submitting') : t('booking.submit')}
        </button>

        {callPhone && (
          <p className="flex items-center justify-center gap-2 text-center text-sm text-muted">
            <NavIcon name="phone" className="h-3.5 w-3.5" />
            {t('booking.callUs')}{' '}
            <a
              href={`tel:${callPhone.replace(/\s+/g, '')}`}
              className="font-medium underline"
              style={{ color: 'var(--tenant-primary)' }}
            >
              {callPhone}
            </a>
          </p>
        )}
      </form>
    </div>
  )
}

export default BookAppointmentForm
