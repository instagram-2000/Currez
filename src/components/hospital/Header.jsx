import { Link, useLocation } from 'react-router-dom'

function Header({ config }) {
  const { title, branding } = config
  const location = useLocation()

  return (
    <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 md:px-12">
      <div className="flex items-center gap-3">
        {branding?.logos?.smallLogo && (
          <img
            src={branding.logos.smallLogo}
            alt={`${title} logo`}
            className="h-9 w-9 rounded-full object-cover"
          />
        )}
        <span className="text-lg font-semibold text-slate-800">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to={{ pathname: '/login', search: location.search }}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Staff Login
        </Link>
        <a
          href="#contact"
          className="rounded-full bg-[var(--tenant-primary)] px-5 py-2 text-sm font-medium text-white shadow-sm"
        >
          Book Appointment
        </a>
      </div>
    </header>
  )
}

export default Header
