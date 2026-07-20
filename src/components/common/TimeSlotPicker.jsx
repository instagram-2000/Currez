import { formatTimeLabel } from '../../utils/doctorSchedule'

// Chip grid of bookable time slots for one doctor/date, shared by the
// public booking form and the staff booking/confirm modals. `slots` is the
// [{ time, taken }] shape produced by availableSlotsForDate.
// `accentColor` is optional — the public booking form passes the hospital's
// own --tenant-primary so the active chip matches their branding; staff
// screens omit it and keep the app's own indigo accent.
function TimeSlotPicker({ slots, value, onChange, allowAny = false, anyLabel = 'Any time works', emptyHint, accentColor }) {
  const hasSlots = Boolean(slots && slots.length > 0)

  // Even with no bookable slots that day (doctor's off, or fully booked),
  // `allowAny` still needs a visible way to proceed with no fixed time —
  // it must not disappear along with the (empty) slot grid.
  if (!hasSlots && !allowAny) {
    return <p className="text-xs text-amber-500">{emptyHint || 'Not available on this day.'}</p>
  }

  const chipClass = (active, disabled) =>
    `cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
      disabled
        ? 'cursor-not-allowed border-line bg-card-strong text-faint line-through opacity-60'
        : active
          ? accentColor
            ? ''
            : 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
          : 'border-line text-body hover:border-line-strong hover:bg-card-strong'
    }`

  const chipStyle = (active, disabled) =>
    accentColor && active && !disabled
      ? { borderColor: accentColor, backgroundColor: 'color-mix(in srgb, ' + accentColor + ' 12%, transparent)', color: accentColor }
      : undefined

  return (
    <div>
      {!hasSlots && <p className="mb-2 text-xs text-amber-500">{emptyHint || 'Not available on this day.'}</p>}
      <div className="flex flex-wrap gap-2">
        {allowAny && (
          <button
            type="button"
            onClick={() => onChange('')}
            className={chipClass(value === '', false)}
            style={chipStyle(value === '', false)}
          >
            {anyLabel}
          </button>
        )}
        {slots.map(({ time, taken }) => (
          <button
            key={time}
            type="button"
            disabled={taken}
            onClick={() => onChange(time)}
            className={chipClass(value === time, taken)}
            style={chipStyle(value === time, taken)}
            title={taken ? 'Already booked' : undefined}
          >
            {formatTimeLabel(time)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimeSlotPicker
