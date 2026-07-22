import { useMemo, useState } from 'react'
import { confirmAppointment } from '../../firebase/appointments'
import { useAuth } from '../../contexts/AuthContext'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'
import { availableSlotsForDate, isTimeWithinSchedule, weekdayKeyForDate, DAY_LABELS } from '../../utils/doctorSchedule'
import { todayDateString } from '../../utils/dates'
import TimeSlotPicker from '../common/TimeSlotPicker'
import Modal from '../common/Modal'
import NavIcon from '../common/NavIcon'

const inputClass =
  'mt-1 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-heading focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10'
const labelClass = 'block text-sm font-medium text-body'

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
    <Modal onClose={onClose} className="max-w-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/20">
          <NavIcon name="check" className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-heading">Confirm appointment</h2>
          <p className="mt-0.5 text-xs text-faint">
            {appointment.patientName} — {appointment.doctorName || 'no doctor yet'}
          </p>
        </div>
      </div>

      {needsDoctor && (
        <div className="mt-5">
          <label className={labelClass}>Assign doctor</label>
          <select
            value={doctorId}
            onChange={(e) => handleDoctorChange(e.target.value)}
            className={`${inputClass} cursor-pointer`}
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
        <label className={labelClass}>Date</label>
        <input
          type="date"
          min={todayDateString()}
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="mt-4">
        <label className={labelClass}>Time</label>

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
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm text-body transition-colors has-checked:border-indigo-500 has-checked:bg-indigo-500/5"
          >
            <input
              type="radio"
              name="paymentMethod"
              value={option.value}
              checked={paymentMethod === option.value}
              onChange={() => setPaymentMethod(option.value)}
              className="cursor-pointer accent-indigo-600"
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
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm"
        >
          {submitting ? 'Confirming…' : 'Confirm & record payment'}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmPaymentModal
