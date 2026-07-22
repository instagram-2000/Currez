import { useState } from 'react'
import { updateDoctorSchedule } from '../../firebase/users'
import { DEFAULT_SCHEDULE, SLOT_LENGTH_OPTIONS, getSlotMinutes } from '../../utils/doctorSchedule'
import ScheduleDayRows from './ScheduleDayRows'
import Modal from '../common/Modal'
import NavIcon from '../common/NavIcon'

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const ALL_DAYS = [...WEEKDAYS, 'saturday', 'sunday']

// Modal used by a hospital admin to edit a doctor's schedule, or by a
// receptionist to view one (readOnly) — never both save and view rights.
function DoctorScheduleEditor({ doctor, readOnly = false, onClose }) {
  const [schedule, setSchedule] = useState(doctor.schedule || DEFAULT_SCHEDULE)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateDay(day, patch) {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
  }

  function applyPreset(days, patch) {
    setSchedule((prev) => {
      const next = { ...prev }
      for (const day of days) next[day] = { ...next[day], ...patch }
      return next
    })
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
    <Modal onClose={onClose} className="max-w-3xl">
      <div className="flex items-start gap-3 pr-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-inset ring-amber-500/20">
          <NavIcon name="schedule" className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-heading">{doctor.displayName}'s schedule</h2>
          <p className="mt-1 text-sm text-muted">
            {readOnly
              ? 'Days and hours this doctor is available for appointments.'
              : 'Toggle the days this doctor is available, and how long each appointment slot is.'}
          </p>
        </div>
      </div>

      {!readOnly && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-body">Slot length</label>
          <select
            value={getSlotMinutes(schedule)}
            onChange={(e) => setSchedule((prev) => ({ ...prev, slotMinutes: Number(e.target.value) }))}
            className="cursor-pointer rounded-lg border border-line bg-card px-2 py-1 text-sm text-heading focus:border-line-strong focus:outline-none"
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
      )}

      <div className="mt-4">
        <ScheduleDayRows
          schedule={schedule}
          onChangeDay={updateDay}
          readOnly={readOnly}
          slotMinutes={getSlotMinutes(schedule)}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex justify-end gap-3 border-t border-line bg-surface px-6 py-4 sm:-mx-8 sm:-mb-8 sm:px-8">
        {readOnly ? (
          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30"
          >
            Close
          </button>
        ) : (
          <>
            <button
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm"
            >
              {saving ? 'Saving…' : 'Save schedule'}
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}

export default DoctorScheduleEditor
