export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

const WEEKEND = new Set(['saturday', 'sunday'])

// Minutes per bookable slot — a single value for the whole week (not
// per-day) so the slot grid a patient sees stays predictable regardless of
// which day they pick.
export const DEFAULT_SLOT_MINUTES = 30
export const SLOT_LENGTH_OPTIONS = [15, 20, 30, 45, 60]

export const DEFAULT_SCHEDULE = {
  ...Object.fromEntries(
    DAYS_OF_WEEK.map((day) => [day, { available: !WEEKEND.has(day), start: '09:00', end: '17:00' }])
  ),
  slotMinutes: DEFAULT_SLOT_MINUTES,
}

export function getSlotMinutes(schedule) {
  return schedule?.slotMinutes || DEFAULT_SLOT_MINUTES
}

// JS Date#getDay() is 0=Sunday..6=Saturday; map onto our schedule keys.
const JS_DAY_INDEX_TO_KEY = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function weekdayKeyForDate(dateString) {
  if (!dateString) return null
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return JS_DAY_INDEX_TO_KEY[date.getDay()]
}

export const DAY_LABELS_SHORT = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

export function isAvailableToday(schedule) {
  const today = JS_DAY_INDEX_TO_KEY[new Date().getDay()]
  return Boolean(schedule?.[today]?.available)
}

// "Mon, Wed, Fri" — used as the fallback badge on a public doctor card when
// they aren't in today. Empty string if they have no available days at all.
export function availableDaysShortLabel(schedule) {
  if (!schedule) return ''
  return DAYS_OF_WEEK.filter((day) => schedule[day]?.available)
    .map((day) => DAY_LABELS_SHORT[day])
    .join(', ')
}

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

// "09:00" -> "9:00 AM" — slot chips and schedule hints read better in
// 12-hour time than the raw <input type="time"> value.
export function formatTimeLabel(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

// Every bookable start time for one day, `slotMinutes` apart, that still
// leaves a full slot before the day's end time.
export function slotsForDaySchedule(daySchedule, slotMinutes = DEFAULT_SLOT_MINUTES) {
  if (!daySchedule?.available || !daySchedule.start || !daySchedule.end) return []
  const start = timeToMinutes(daySchedule.start)
  const end = timeToMinutes(daySchedule.end)
  const slots = []
  for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
    slots.push(minutesToTime(t))
  }
  return slots
}

// The doctor's bookable slots for a specific date, each flagged `taken` if
// it appears in `bookedTimes` (times already held by another appointment
// with this doctor on this date — pass [] where that isn't knowable, e.g.
// the public booking form, which can't query other patients' bookings).
export function availableSlotsForDate(schedule, dateString, bookedTimes = []) {
  const weekday = weekdayKeyForDate(dateString)
  const daySchedule = schedule?.[weekday]
  const slots = slotsForDaySchedule(daySchedule, getSlotMinutes(schedule))
  const taken = new Set(bookedTimes)
  return slots.map((time) => ({ time, taken: taken.has(time) }))
}

// Whether `time` falls inside the doctor's working hours for that date —
// used to flag appointments that no longer match the doctor's schedule
// after it's been edited post-confirmation.
export function isTimeWithinSchedule(schedule, dateString, time) {
  if (!time) return false
  const weekday = weekdayKeyForDate(dateString)
  const daySchedule = schedule?.[weekday]
  if (!daySchedule?.available) return false
  return time >= daySchedule.start && time < daySchedule.end
}
