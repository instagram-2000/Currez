import { useMemo, useState } from 'react'
import { confirmAppointment } from '../../firebase/appointments'
import { useAuth } from '../../contexts/AuthContext'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'
import { availableSlotsForDate, isTimeWithinSchedule, weekdayKeyForDate, DAY_LABELS } from '../../utils/doctorSchedule'
import TimeSlotPicker from '../common/TimeSlotPicker'

const todayString = () => new Date().toISOString().slice(0, 10)

// Front-desk confirmation is also where doctor availability is finally
// checked against reality: the doctor may have changed their schedule since
// the patient requested this slot, or another patient may since have been
// confirmed into it. Both cases are re-validated here rather than trusting
// whatever the patient originally picked.
function ConfirmPaymentModal({ appointment, doctors, appointments = [], onClose }) {
  const { user } = useAuth()
  const needsDoctor = !appointment.doctorId
  const [doctorId, setDoctorId] = useState(appointment.doctorId || doctors?.[0]?.uid || '')
  const [date, setDate] = useState(appointment.date)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selectedDoctor = doctors?.find((d) => d.uid === doctorId)
  const weekday = weekdayKeyForDate(date)
  const daySchedule = selectedDoctor?.schedule?.[weekday]

  const bookedTimes = useMemo(
    () =>
      appointments
        .filter((a) => a.id !== appointment.id && a.doctorId === doctorId && a.date === date && a.status === 'scheduled')
        .map((a) => a.time)
        .filter(Boolean),
    [appointments, appointment.id, doctorId, date]
  )
  const slots = selectedDoctor ? availableSlotsForDate(selectedDoctor.schedule, date, bookedTimes) : []

  // The time the patient originally asked for (if any) is only kept as the
  // pre-selection when it still fits the doctor's current schedule and
  // isn't already held by someone else's confirmed appointment.
  const originalTimeStillValid =
    appointment.time &&
    doctorId === appointment.doctorId &&
    date === appointment.date &&
    isTimeWithinSchedule(selectedDoctor?.schedule, date, appointment.time) &&
    !bookedTimes.includes(appointment.time)

  const [time, setTime] = useState(originalTimeStillValid ? appointment.time : '')
  const [timeTouched, setTimeTouched] = useState(false)

  const scheduleChanged =
    appointment.time && appointment.status === 'pending' && doctorId === appointment.doctorId && date === appointment.date && !originalTimeStillValid

  const { errors, validate, clearFieldError } = useFormValidation({
    doctorId: needsDoctor ? [validators.required('Choose a doctor to assign this appointment to.')] : [],
    time: [validators.required('Pick a time to confirm this appointment.')],
  })

  function handleDoctorChange(uid) {
    setDoctorId(uid)
    setTime('')
    setTimeTouched(false)
    clearFieldError('doctorId')
  }

  function handleDateChange(value) {
    setDate(value)
    setTime('')
    setTimeTouched(false)
  }

  function handleTimeChange(value) {
    setTime(value)
    setTimeTouched(true)
    clearFieldError('time')
  }

  async function handleConfirm() {
    setError('')
    if (!validate({ doctorId, time })) return
    setSubmitting(true)
    try {
      const assignedDoctor = doctors?.find((d) => d.uid === doctorId)
      await confirmAppointment(appointment.id, {
        paymentMethod,
        confirmedBy: user.uid,
        date,
        time,
        ...(needsDoctor ? { doctorId, doctorName: assignedDoctor?.displayName || '' } : {}),
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <h2 className="text-base font-semibold text-heading">Confirm appointment</h2>
        <p className="mt-1 text-sm text-muted">
          {appointment.patientName} — {appointment.doctorName || 'no doctor yet'}
        </p>

        {needsDoctor && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-body">Assign doctor</label>
            <select
              value={doctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="mt-1 w-full cursor-pointer rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading focus:border-line-strong focus:outline-none"
            >
              {(!doctors || doctors.length === 0) && <option value="">No doctors available</option>}
              {doctors?.map((d) => (
                <option key={d.uid} value={d.uid}>
                  {d.displayName} {d.specialization ? `— ${d.specialization}` : ''}
                </option>
              ))}
            </select>
            {errors.doctorId && <p className="mt-1 text-xs text-red-500">{errors.doctorId}</p>}
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-body">Date</label>
          <input
            type="date"
            min={todayString()}
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading focus:border-line-strong focus:outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-body">Time</label>

          {scheduleChanged && !timeTouched && (
            <p className="mt-1 mb-2 text-xs text-amber-500">
              {appointment.doctorName || 'The doctor'}'s schedule no longer covers {appointment.time} on this
              day (or it's now taken) — pick a new time below.
            </p>
          )}

          {selectedDoctor ? (
            <TimeSlotPicker
              slots={slots}
              value={time}
              onChange={handleTimeChange}
              emptyHint={
                daySchedule && !daySchedule.available
                  ? `${selectedDoctor.displayName} isn't scheduled to work on ${DAY_LABELS[weekday]}s — pick a different date.`
                  : undefined
              }
            />
          ) : (
            <p className="mt-1 text-xs text-faint">Assign a doctor to see available times.</p>
          )}
          {errors.time && <p className="mt-1 text-xs text-red-500">{errors.time}</p>}
        </div>

        <p className="mt-4 text-sm font-medium text-body">How was the visit fee collected?</p>
        <div className="mt-2 space-y-2">
          {[
            { value: 'cash', label: 'Cash' },
            { value: 'online', label: 'Online (hospital QR)' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-body has-[:checked]:border-indigo-500"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={paymentMethod === option.value}
                onChange={() => setPaymentMethod(option.value)}
                className="cursor-pointer"
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">
          For record only — online payments are made directly to the hospital's own QR, not through this app.
        </p>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Confirming…' : 'Confirm & record payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmPaymentModal
