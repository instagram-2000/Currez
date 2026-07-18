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
      <h1 className="text-xl font-semibold text-slate-900">My Schedule</h1>
      <p className="mt-1 text-sm text-slate-500">
        Set the days and hours you're available — this controls what receptionists and admins see
        when booking your appointments.
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <ScheduleDayRows schedule={schedule} onChangeDay={updateDay} />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {saved && <p className="mt-3 text-sm text-emerald-600">Saved.</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 cursor-pointer rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save schedule'}
        </button>
      </div>
    </div>
  )
}

export default MySchedulePage
