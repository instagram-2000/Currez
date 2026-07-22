import { todayDateString } from './dates'

function dateStringToDate(s) {
  return new Date(`${s}T00:00:00`)
}

function daysBetween(a, b) {
  const ms = dateStringToDate(a).getTime() - dateStringToDate(b).getTime()
  return Math.round(ms / 86400000)
}

export const TAB_PAST = 'past'
export const TAB_TODAY = 'today'
export const TAB_UPCOMING = 'upcoming'

export const TABS = [
  { key: TAB_PAST, label: 'Past' },
  { key: TAB_TODAY, label: 'Today' },
  { key: TAB_UPCOMING, label: 'Upcoming' },
]

export function categorizeAppointments(appointments, todayStr = todayDateString()) {
  const past = []
  const today = []
  const upcoming = []

  for (const appt of appointments) {
    const diff = daysBetween(appt.date, todayStr)

    if (diff < 0) {
      const absDiff = Math.abs(diff)
      if (absDiff >= 1 && absDiff <= 7) {
        past.push(appt)
      }
      continue
    }

    if (diff === 0) {
      today.push(appt)
      continue
    }

    if (diff >= 1 && diff <= 7) {
      upcoming.push(appt)
    }
  }

  past.sort((a, b) => `${b.date}T${b.time || '00:00'}`.localeCompare(`${a.date}T${a.time || '00:00'}`))
  today.sort((a, b) => `${a.time || '00:00'}`.localeCompare(`${b.time || '00:00'}`))
  upcoming.sort((a, b) => `${a.date}T${a.time || '00:00'}`.localeCompare(`${b.date}T${b.time || '00:00'}`))

  return { [TAB_PAST]: past, [TAB_TODAY]: today, [TAB_UPCOMING]: upcoming }
}
