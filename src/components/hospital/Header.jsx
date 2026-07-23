import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import LanguageSwitcher from '../common/LanguageSwitcher'
import ThemeToggle from '../common/ThemeToggle'
import { SITE_CONTAINER } from '../../utils/layout'

const SECTION_NAV = [
  { key: 'services', href: '#services', labelKey: 'hospital.navServices' },
  { key: 'departments', href: '#departments', labelKey: 'hospital.navDepartments' },
  { key: 'doctors', href: '#doctors', labelKey: 'hospital.navDoctors' },
  { key: 'testimonials', href: '#testimonials', labelKey: 'hospital.navTestimonials' },
]

function Header({ config, onBookClick, onStatusClick }) {
  const { title, branding, optionals } = config
  const location = useLocation()
  const { t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    ...SECTION_NAV.filter((item) => optionals?.[item.key]?.enabled === 'on'),
    { key: 'contact', href: '#contact', labelKey: 'hospital.navContact' },
  ].map((item) => ({ ...item, label: t(item.labelKey) }))

  // Lock background scroll while the mobile menu is open, and let Escape
  // close it — same interaction contract as the site's Modal component, so
  // the mobile nav doesn't feel like a second-class citizen next to it.
  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-lg backdrop-saturate-150">
      <div className={`flex items-center justify-between py-3.5 ${SITE_CONTAINER}`}>
        <div className="flex min-w-0 items-center gap-3">
          {branding?.logos?.smallLogo ? (
            <img
              src={branding.logos.smallLogo}
              alt={`${title} logo`}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-line"
            />
          ) : (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: 'var(--tenant-primary)' }}
            >
              {(title || '?')[0]}
            </span>
          )}
          <span className="truncate text-lg font-semibold text-heading">{title}</span>
        </div>

        <nav className="hidden items-center gap-7 text-sm text-body lg:flex">
          {navLinks.map((link) => (
            <a key={link.key} href={link.href} className="transition-colors hover:text-heading">
              {link.label}
            </a>
          ))}
          <button onClick={onStatusClick} className="cursor-pointer transition-colors hover:text-heading">
            {t('hospital.checkAppointmentStatus')}
          </button>
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle />
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <Link
            to={{ pathname: '/login', search: location.search }}
            className="hidden text-sm text-muted hover:text-heading lg:inline-block"
          >
            {t('hospital.staffLogin')}
          </Link>
          <button
            onClick={onBookClick}
            className="hidden cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:inline-block"
            style={{ backgroundColor: 'var(--tenant-primary)' }}
          >
            {t('hospital.bookAppointment')}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="cursor-pointer rounded-lg p-2 text-body transition-colors hover:bg-card-strong lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav panel — CTA leads (the thing most patients open this
          menu to do), links follow. Body scroll is locked while open (see
          the effect above) so the panel reads as a real overlay, not just
          content pushing the page down. */}
      {menuOpen && (
        <div className="animate-fade-in-up border-t border-line bg-surface px-6 py-5 lg:hidden">
          <button
            onClick={() => {
              setMenuOpen(false)
              onBookClick()
            }}
            className="block w-full cursor-pointer rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--tenant-primary)' }}
          >
            {t('hospital.bookAppointment')}
          </button>

          <nav className="mt-5 flex flex-col divide-y divide-line text-sm text-body">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 transition-colors hover:text-heading"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false)
                onStatusClick()
              }}
              className="cursor-pointer py-3 text-left transition-colors hover:text-heading"
            >
              {t('hospital.checkAppointmentStatus')}
            </button>
            <Link
              to={{ pathname: '/login', search: location.search }}
              className="py-3 transition-colors hover:text-heading"
            >
              {t('hospital.staffLogin')}
            </Link>
          </nav>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-xs font-medium uppercase tracking-wide text-faint">Language</span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
