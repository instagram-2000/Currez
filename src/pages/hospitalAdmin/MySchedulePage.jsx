import { useState } from 'react'
import { updateDoctorSchedule } from '../../firebase/users'
import { useAuth } from '../../contexts/AuthContext'
import { DEFAULT_SCHEDULE, SLOT_LENGTH_OPTIONS, getSlotMinutes } from '../../utils/doctorSchedule'
import ScheduleDayRows from '../../components/hospitalAdmin/ScheduleDayRows'
import NavIcon from '../../components/common/NavIcon'

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const ALL_DAYS = [...WEEKDAYS, 'saturday', 'sunday']

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

  function applyPreset(days, patch) {
    setSchedule((prev) => {
      const next = { ...prev }
      for (const day of days) next[day] = { ...next[day], ...patch }
      return next
    })
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

  const activeDays = Object.values(schedule).filter((d) => d?.available).length

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 ring-inset dark:text-amber-400">
          <NavIcon name="schedule" className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-heading">My Schedule</h1>
          <p className="text-sm text-muted">{activeDays} day{activeDays !== 1 ? 's' : ''} available this week</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Set the days, hours and appointment slot length you're available — this controls what patients,
        receptionists and admins see when booking your appointments. Changes here don't affect appointments
        already confirmed; if a confirmed visit now falls outside your new hours, reception will see it
        flagged and can reschedule it with you.
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-body">Slot length</label>
          <select
            value={getSlotMinutes(schedule)}
            onChange={(e) => {
              setSchedule((prev) => ({ ...prev, slotMinutes: Number(e.target.value) }))
              setSaved(false)
            }}
            className="cursor-pointer rounded-lg border border-line bg-card px-2 py-1 text-sm text-heading focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
          >
            {SLOT_LENGTH_OPTIONS.map((mins) => (
              <option key={mins} value={mins}>
                {mins} min
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => applyPreset(WEEKDAYS, { available: true, start: '09:00', end: '17:00' })}
            className="cursor-pointer rounded-lg border border-line px-3 py-1 text-xs font-medium text-body transition-colors hover:bg-card-strong hover:text-heading"
          >
            Weekdays 9–5
          </button>
          <button
            type="button"
            onClick={() => applyPreset(ALL_DAYS, { available: true, start: '09:00', end: '17:00' })}
            className="cursor-pointer rounded-lg border border-line px-3 py-1 text-xs font-medium text-body transition-colors hover:bg-card-strong hover:text-heading"
          >
            Every day 9–5
          </button>
        </div>

        <div className="mt-4">
          <ScheduleDayRows schedule={schedule} onChangeDay={updateDay} slotMinutes={getSlotMinutes(schedule)} />
        </div>

        <div className="mt-5 flex items-center gap-4 border-t border-line pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm"
          >
            {saving ? 'Saving…' : 'Save schedule'}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-500">
              <NavIcon name="check" className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MySchedulePage
