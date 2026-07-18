import { useState } from 'react'
import { updateDoctorSchedule } from '../../firebase/users'
import { DEFAULT_SCHEDULE } from '../../utils/doctorSchedule'
import ScheduleDayRows from './ScheduleDayRows'

// Modal used by a hospital admin to edit a doctor's schedule, or by a
// receptionist to view one (readOnly) — never both save and view rights.
function DoctorScheduleEditor({ doctor, readOnly = false, onClose }) {
  const [schedule, setSchedule] = useState(doctor.schedule || DEFAULT_SCHEDULE)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateDay(day, patch) {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await updateDoctorSchedule(doctor.uid, schedule)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-base font-semibold text-slate-900">{doctor.displayName}'s schedule</h2>
        <p className="mt-1 text-sm text-slate-500">
          {readOnly
            ? 'Days and hours this doctor is available for appointments.'
            : 'Toggle the days this doctor is available for appointments.'}
        </p>

        <div className="mt-4">
          <ScheduleDayRows schedule={schedule} onChangeDay={updateDay} readOnly={readOnly} />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          {readOnly ? (
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={saving}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save schedule'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorScheduleEditor
