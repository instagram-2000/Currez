import { DAYS_OF_WEEK, DAY_LABELS } from '../../utils/doctorSchedule'

// Shared weekly-availability row editor — used both by the hospital-admin
// (and receptionist read-only) view of a doctor's schedule, and by a
// doctor editing their own.
function ScheduleDayRows({ schedule, onChangeDay, readOnly = false }) {
  return (
    <div className="space-y-2">
      {DAYS_OF_WEEK.map((day) => {
        const daySchedule = schedule[day] || { available: false, start: '09:00', end: '17:00' }
        return (
          <div
            key={day}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-card p-3"
          >
            <label
              className={`flex w-28 shrink-0 items-center gap-2 text-sm font-medium text-body ${
                readOnly ? '' : 'cursor-pointer'
              }`}
            >
              <input
                type="checkbox"
                checked={daySchedule.available}
                disabled={readOnly}
                onChange={(e) => onChangeDay(day, { available: e.target.checked })}
                className={`h-4 w-4 rounded border-line-strong bg-card ${readOnly ? '' : 'cursor-pointer'}`}
              />
              {DAY_LABELS[day]}
            </label>
            <input
              type="time"
              disabled={readOnly || !daySchedule.available}
              value={daySchedule.start}
              onChange={(e) => onChangeDay(day, { start: e.target.value })}
              className="rounded-lg border border-line bg-card px-2 py-1 text-sm text-heading focus:border-line-strong focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            />
            <span className="text-sm text-faint">to</span>
            <input
              type="time"
              disabled={readOnly || !daySchedule.available}
              value={daySchedule.end}
              onChange={(e) => onChangeDay(day, { end: e.target.value })}
              className="rounded-lg border border-line bg-card px-2 py-1 text-sm text-heading focus:border-line-strong focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>
        )
      })}
    </div>
  )
}

export default ScheduleDayRows
