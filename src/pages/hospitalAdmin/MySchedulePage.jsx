import { useState } from 'react'
import { updateDoctorSchedule } from '../../firebase/users'
import { useAuth } from '../../contexts/AuthContext'
import { DEFAULT_SCHEDULE } from '../../utils/doctorSchedule'
import ScheduleDayRows from '../../components/hospitalAdmin/ScheduleDayRows'

function MySchedulePage() {
  const { user, userDoc } = useAuth()
  const [schedule, setSchedule] = useState(userDoc?.schedule || DEFAULT_SCHEDULE)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function updateDay(day, patch) {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await updateDoctorSchedule(user.uid, schedule)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-heading">My Schedule</h1>
      <p className="mt-1 text-sm text-muted">
        Set the days and hours you're available — this controls what receptionists and admins see
        when booking your appointments.
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-card p-5">
        <ScheduleDayRows schedule={schedule} onChangeDay={updateDay} />

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        {saved && <p className="mt-3 text-sm text-emerald-500">Saved.</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 cursor-pointer rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save schedule'}
        </button>
      </div>
    </div>
  )
}

export default MySchedulePage
