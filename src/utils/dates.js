// Local calendar date as "YYYY-MM-DD". Deliberately NOT `date.toISOString()`
// — that formats in UTC, so for any timezone ahead of UTC (e.g. India,
// UTC+5:30) it returns *yesterday's* date for the first few hours of the
// local day (12:00am-5:30am IST). Every "today" computation in this app
// must go through here, not toISOString(), or booking/scheduling screens
// silently show the wrong day overnight.
export function todayDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// A "YYYY-MM-DD" date string `days` away from `from` (negative for the
// past), still expressed as a local calendar date.
export function shiftDateString(days, from = new Date()) {
  const date = new Date(from)
  date.setDate(date.getDate() + days)
  return todayDateString(date)
}
