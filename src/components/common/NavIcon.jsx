// Small stroke-icon set shared by the superadmin and hospital-portal sidebars,
// keyed by nav item so both layouts can request icons by name instead of
// duplicating SVG paths.
const PATHS = {
  dashboard: 'M4 4h7v9H4V4zm9 0h7v5h-7V4zm0 9h7v7h-7v-7zM4 17h7v3H4v-3z',
  hospitals: 'M4 21V7l8-4 8 4v14M9 21v-6h6v6M9 11h.01M15 11h.01M12 11h.01M9 15h.01M15 15h.01',
  overview: 'M4 4h7v9H4V4zm9 0h7v5h-7V4zm0 9h7v7h-7v-7zM4 17h7v3H4v-3z',
  appointments: 'M8 3v3M16 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
  patients: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 21v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M17 11a3 3 0 1 0 0-6M21 21v-1a5 5 0 0 0-3.5-4.77',
  staff: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  doctors: 'M6 3v6a4 4 0 0 0 8 0V3M10 15v2a4 4 0 0 0 8 0v-1M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  schedule: 'M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  pulse: 'M3 12h4l2-7 4 14 2-7h6',
  star: 'M12 3l2.6 5.6 6.1.6-4.5 4.2 1.3 6-5.5-3.1-5.5 3.1 1.3-6-4.5-4.2 6.1-.6L12 3z',
  clipboard: 'M9 3h6a1 1 0 0 1 1 1v1h1a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1V4a1 1 0 0 1 1-1zM9 12h6M9 16h6M9 8h6',
  lock: 'M6 11V8a6 6 0 1 1 12 0v3M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z',
  close: 'M6 18L18 6M6 6l12 12',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  eye: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff:
    'M3 3l18 18 M10.6 5.2A11 11 0 0 1 12 5c7 0 11 7 11 7a13.5 13.5 0 0 1-3.1 3.8 M6.5 6.7A13.6 13.6 0 0 0 1 12s4 7 11 7a10.4 10.4 0 0 0 5-1.3 M9.5 9.8a3 3 0 0 0 4.2 4.2',
  arrowLeft: 'M19 12H5 M11 18l-6-6 6-6',
  check: 'M20 6L9 17l-5-5',
  chat: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
}

function NavIcon({ name, className = 'h-4.5 w-4.5' }) {
  const d = PATHS[name]
  if (!d) return null
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

export default NavIcon
