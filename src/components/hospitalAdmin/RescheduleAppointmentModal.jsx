import { useMemo, useState } from 'react'
import { rescheduleAppointment } from '../../firebase/appointments'
import { useAuth } from '../../contexts/AuthContext'
import { availableSlotsForDate, weekdayKeyForDate, DAY_LABELS } from '../../utils/doctorSchedule'
import { todayDateString } from '../../utils/dates'
import TimeSlotPicker from '../common/TimeSlotPicker'
import Modal from '../common/Modal'
import NavIcon from '../common/NavIcon'

const inputClass =
  'mt-1 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-heading focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10'
const labelClass = 'block text-sm font-medium text-body'

// Opened from the appointments list (usually via the "Schedule changed"
// warning) to move an already-confirmed appointment to a slot that actually
// fits the doctor's current schedule, or to a different doctor entirely.
function RescheduleAppointmentModal({ appointment, doctors, appointments = [], onClose }) {
  const { user } = useAuth()
  const [doctorId, setDoctorId] = useState(appointment.doctorId || doctors?.[0]?.uid || '')
  const [date, setDate] = useState(appointment.date)
  const [time, setTime] = useState('')
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

  function handleDoctorChange(uid) {
    setDoctorId(uid)
    setTime('')
  }

  function handleDateChange(value) {
    setDate(value)
    setTime('')
  }

  async function handleSave() {
    setError('')
    if (!time) {
      setError('Pick a new time to reschedule this appointment.')
      return
    }
    setSubmitting(true)
    try {
      await rescheduleAppointment(appointment.id, {
        date,
        time,
        ...(doctorId !== appointment.doctorId ? { doctorId, doctorName: selectedDoctor?.displayName || '' } : {}),
        rescheduledBy: user.uid,
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-inset ring-amber-500/20">
          <NavIcon name="schedule" className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-heading">Reschedule appointment</h2>
          <p className="mt-0.5 text-xs text-faint">
            {appointment.patientName} — currently {appointment.date} {appointment.time || '(no time set)'}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label className={labelClass}>Doctor</label>
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
      </div>

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
        <label className={labelClass}>New time</label>
        {selectedDoctor ? (
          <TimeSlotPicker
            slots={slots}
            value={time}
            onChange={setTime}
            emptyHint={
              daySchedule && !daySchedule.available
                ? `${selectedDoctor.displayName} isn't scheduled to work on ${DAY_LABELS[weekday]}s — pick a different date.`
                : undefined
            }
          />
        ) : (
          <p className="mt-1 text-xs text-faint">Choose a doctor to see available times.</p>
        )}
      </div>

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
          onClick={handleSave}
          disabled={submitting}
          className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm"
        >
          {submitting ? 'Saving…' : 'Save new time'}
        </button>
      </div>
    </Modal>
  )
}

export default RescheduleAppointmentModal
