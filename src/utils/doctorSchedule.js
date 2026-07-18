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

export const DEFAULT_SCHEDULE = Object.fromEntries(
  DAYS_OF_WEEK.map((day) => [day, { available: !WEEKEND.has(day), start: '09:00', end: '17:00' }])
)

// JS Date#getDay() is 0=Sunday..6=Saturday; map onto our schedule keys.
const JS_DAY_INDEX_TO_KEY = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function weekdayKeyForDate(dateString) {
  if (!dateString) return null
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return JS_DAY_INDEX_TO_KEY[date.getDay()]
}
