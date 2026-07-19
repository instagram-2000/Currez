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
