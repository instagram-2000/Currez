import { DAYS_OF_WEEK, DAY_LABELS, slotsForDaySchedule } from '../../utils/doctorSchedule'

// Shared weekly-availability row editor — used both by the hospital-admin
// (and receptionist read-only) view of a doctor's schedule, and by a
// doctor editing their own. Shows a live slot-count per day so changing
// hours or slot length immediately shows its effect on booking capacity.
function ScheduleDayRows({ schedule, onChangeDay, readOnly = false, slotMinutes }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {DAYS_OF_WEEK.map((day) => {
        const daySchedule = schedule[day] || { available: false, start: '09:00', end: '17:00' }
        const slotCount = slotsForDaySchedule(daySchedule, slotMinutes).length
        return (
          <div
            key={day}
            className={`flex flex-wrap items-center gap-2 rounded-xl border p-2.5 transition-colors sm:p-3 ${
              daySchedule.available ? 'border-line bg-card' : 'border-line bg-card-strong/40'
            }`}
          >
            <label
              className={`flex w-24 shrink-0 items-center gap-2 text-sm font-medium text-body ${
                readOnly ? '' : 'cursor-pointer'
              }`}
            >
              <input
                type="checkbox"
                checked={daySchedule.available}
                disabled={readOnly}
                onChange={(e) => onChangeDay(day, { available: e.target.checked })}
                className={`h-4 w-4 rounded border-line-strong bg-card accent-indigo-600 ${readOnly ? '' : 'cursor-pointer'}`}
              />
              {DAY_LABELS[day]}
            </label>
            <input
              type="time"
              disabled={readOnly || !daySchedule.available}
              value={daySchedule.start}
              onChange={(e) => onChangeDay(day, { start: e.target.value })}
              className="rounded-lg border border-line bg-card px-2 py-1 text-sm text-heading focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            />
            <span className="text-xs text-faint">to</span>
            <input
              type="time"
              disabled={readOnly || !daySchedule.available}
              value={daySchedule.end}
              onChange={(e) => onChangeDay(day, { end: e.target.value })}
              className="rounded-lg border border-line bg-card px-2 py-1 text-sm text-heading focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            />
            <span
              className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                daySchedule.available
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-card-strong text-faint'
              }`}
            >
              {daySchedule.available ? `${slotCount} slot${slotCount === 1 ? '' : 's'}` : 'Off'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default ScheduleDayRows
