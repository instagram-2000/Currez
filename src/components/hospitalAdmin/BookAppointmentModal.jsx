import { useMemo, useState } from 'react'
import { createAppointment } from '../../firebase/appointments'
import { createPatient } from '../../firebase/patients'
import { useAuth } from '../../contexts/AuthContext'
import { DAY_LABELS, weekdayKeyForDate } from '../../utils/doctorSchedule'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'

const todayString = () => new Date().toISOString().slice(0, 10)

function BookAppointmentModal({ hospitalId, patients, doctors, preselectedPatientId, onCreated, onCancel }) {
  const { user } = useAuth()
  const [isNewPatient, setIsNewPatient] = useState(false)
  const [patientId, setPatientId] = useState(preselectedPatientId || patients[0]?.id || '')
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientPhone, setNewPatientPhone] = useState('')
  const [newPatientEmail, setNewPatientEmail] = useState('')
  const [doctorId, setDoctorId] = useState(doctors[0]?.uid || '')
  const [date, setDate] = useState(todayString())
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!doctorId) {
      setError('Add a doctor before booking appointments.')
      return
    }
    if (isNewPatient && !newPatientName.trim()) {
      setError('Patient name is required.')
      return
    }
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
          doctorId,
          doctorName: selectedDoctor?.displayName || '',
          date,
          time,
          notes: notes.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-base font-semibold text-slate-900">Book appointment</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Patient</label>
              <button
                type="button"
                onClick={() => setIsNewPatient((v) => !v)}
                className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                {isNewPatient ? 'Choose existing patient' : '+ New patient'}
              </button>
            </div>

            {isNewPatient ? (
              <div className="mt-2 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className={inputClass + ' mt-0'}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newPatientPhone}
                  onChange={(e) => setNewPatientPhone(e.target.value)}
                  className={inputClass + ' mt-0'}
                />
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
            <label className="block text-sm font-medium text-slate-700">Doctor</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              {doctors.length === 0 && <option value="">No doctors yet</option>}
              {doctors.map((d) => (
                <option key={d.uid} value={d.uid}>
                  {d.displayName} {d.specialization ? `— ${d.specialization}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                required
                min={todayString()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {scheduleHint && (
            <p className={`text-xs ${daySchedule?.available ? 'text-slate-400' : 'text-amber-600'}`}>
              {scheduleHint}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Booking…' : 'Book appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookAppointmentModal
