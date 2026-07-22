import { useMemo, useState } from 'react'
import { createAppointment } from '../../firebase/appointments'
import { createPatient } from '../../firebase/patients'
import { useAuth } from '../../contexts/AuthContext'
import { validators } from '../../utils/validations'
import { useFormValidation } from '../../hooks/useFormValidation'
import { DAY_LABELS, weekdayKeyForDate, availableSlotsForDate } from '../../utils/doctorSchedule'
import { todayDateString } from '../../utils/dates'
import TimeSlotPicker from '../common/TimeSlotPicker'
import Modal from '../common/Modal'
import NavIcon from '../common/NavIcon'

const inputClass =
  'mt-1 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-heading placeholder:text-faint focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10'
const labelClass = 'block text-sm font-medium text-body'

// `appointments` (the hospital's full list, already loaded by the calling
// page) lets this modal grey out times already held by another confirmed
// appointment with the same doctor on the same date — the public booking
// form can't do this (no query access), but staff already have the data.
function BookAppointmentModal({ hospitalId, patients, doctors, appointments = [], preselectedPatientId, onCreated, onCancel }) {
  const { user } = useAuth()
  const [isNewPatient, setIsNewPatient] = useState(false)
  const [patientId, setPatientId] = useState(preselectedPatientId || patients[0]?.id || '')
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientPhone, setNewPatientPhone] = useState('')
  const [newPatientEmail, setNewPatientEmail] = useState('')
  const [doctorId, setDoctorId] = useState(doctors[0]?.uid || '')
  const [date, setDate] = useState(todayDateString())
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { errors, validate, clearFieldError } = useFormValidation({
    newPatientName: isNewPatient ? [validators.required('Patient name is required.')] : [],
    newPatientPhone: [validators.phone('Enter a valid phone number.')],
    date: [validators.required('Date is required.')],
  })

  const selectedDoctor = doctors.find((d) => d.uid === doctorId)
  const weekday = weekdayKeyForDate(date)
  const daySchedule = selectedDoctor?.schedule?.[weekday]

  const scheduleHint = useMemo(() => {
    if (!selectedDoctor || !weekday) return null
    if (!daySchedule || !daySchedule.available) {
      return `${selectedDoctor.displayName} isn't scheduled to work on ${DAY_LABELS[weekday]}s.`
    }
    return `${selectedDoctor.displayName} is available ${DAY_LABELS[weekday]}s ${daySchedule.start}–${daySchedule.end}.`
  }, [selectedDoctor, weekday, daySchedule])

  const bookedTimes = useMemo(
    () =>
      appointments
        .filter((a) => a.doctorId === doctorId && a.date === date && a.status === 'scheduled')
        .map((a) => a.time)
        .filter(Boolean),
    [appointments, doctorId, date]
  )
  const slots = selectedDoctor ? availableSlotsForDate(selectedDoctor.schedule, date, bookedTimes) : []

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!validate({ newPatientName, newPatientPhone, date, time })) return
    if (!isNewPatient && !patientId) {
      setError('Add a patient before booking appointments.')
      return
    }

    setSubmitting(true)
    try {
      let finalPatientId = patientId
      const existingPatient = patients.find((p) => p.id === patientId)
      let patientName = existingPatient?.name
      let patientPhone = existingPatient?.phone || ''

      if (isNewPatient) {
        finalPatientId = await createPatient(
          hospitalId,
          { name: newPatientName, phone: newPatientPhone, email: newPatientEmail },
          user.uid
        )
        patientName = newPatientName.trim()
        patientPhone = newPatientPhone.trim()
      }

      await createAppointment(
        {
          hospitalId,
          patientId: finalPatientId,
          patientName,
          patientPhone,
          doctorId: doctorId || null,
          doctorName: selectedDoctor?.displayName || '',
          date,
          time,
          notes: notes.trim(),
          // No doctor picked yet — goes to Pending so reception assigns one
          // (and records payment) at confirmation, same as a patient booking.
          status: doctorId ? 'scheduled' : 'pending',
        },
        user.uid
      )
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal onClose={onCancel} className="max-w-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/20">
          <NavIcon name="appointments" className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
        </div>
        <h2 className="text-base font-semibold text-heading">Book appointment</h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <label className={labelClass}>Patient</label>
            <button
              type="button"
              onClick={() => setIsNewPatient((v) => !v)}
              className="cursor-pointer text-xs font-medium text-muted hover:text-heading"
            >
              {isNewPatient ? 'Choose existing patient' : '+ New patient'}
            </button>
          </div>

          {isNewPatient ? (
            <div className="mt-2 space-y-2 rounded-xl border border-line bg-card-strong/50 p-3">
              <input
                type="text"
                placeholder="Name"
                value={newPatientName}
                onChange={(e) => { setNewPatientName(e.target.value); clearFieldError('newPatientName') }}
                className={inputClass + ' mt-0'}
              />
              {errors.newPatientName && <p className="mt-1 text-xs text-red-500">{errors.newPatientName}</p>}
              <input
                type="text"
                placeholder="Phone"
                value={newPatientPhone}
                onChange={(e) => { setNewPatientPhone(e.target.value); clearFieldError('newPatientPhone') }}
                className={inputClass + ' mt-0'}
              />
              {errors.newPatientPhone && <p className="mt-1 text-xs text-red-500">{errors.newPatientPhone}</p>}
              <input
                type="email"
                placeholder="Email (optional)"
                value={newPatientEmail}
                onChange={(e) => setNewPatientEmail(e.target.value)}
                className={inputClass + ' mt-0'}
              />
            </div>
          ) : (
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className={`${inputClass} cursor-pointer`}>
              {patients.length === 0 && <option value="">No patients yet</option>}
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.phone ? `— ${p.phone}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className={labelClass}>Doctor</label>
          <select
            value={doctorId}
            onChange={(e) => { setDoctorId(e.target.value); setTime('') }}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">No preference — reception will assign</option>
            {doctors.map((d) => (
              <option key={d.uid} value={d.uid}>
                {d.displayName} {d.specialization ? `— ${d.specialization}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            min={todayDateString()}
            value={date}
            onChange={(e) => { setDate(e.target.value); setTime(''); clearFieldError('date') }}
            className={inputClass}
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
        </div>

        {selectedDoctor ? (
          <div>
            <label className={labelClass}>Time</label>
            {scheduleHint && daySchedule?.available && (
              <p className="mt-1 mb-2 text-xs text-faint">{scheduleHint}</p>
            )}
            <TimeSlotPicker
              slots={slots}
              value={time}
              onChange={setTime}
              allowAny
              anyLabel="No preference — reception will assign"
              emptyHint={scheduleHint}
            />
          </div>
        ) : (
          <div>
            <label className={labelClass}>Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-faint">Pick a doctor to see their available time slots.</p>
          </div>
        )}

        <div>
          <label className={labelClass}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm"
          >
            {submitting ? 'Booking…' : 'Book appointment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default BookAppointmentModal
