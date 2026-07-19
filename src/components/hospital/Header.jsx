import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import LanguageSwitcher from '../common/LanguageSwitcher'
import ThemeToggle from '../common/ThemeToggle'

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

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 md:px-12">
        <div className="flex items-center gap-3">
          {branding?.logos?.smallLogo && (
            <img
              src={branding.logos.smallLogo}
              alt={`${title} logo`}
              className="h-9 w-9 rounded-full object-cover"
            />
          )}
          <span className="text-lg font-semibold text-heading">{title}</span>
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
            className="hidden cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors sm:inline-block"
            style={{ borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)' }}
          >
            {t('hospital.bookAppointment')}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="cursor-pointer rounded-lg p-2 text-body hover:bg-card-strong lg:hidden"
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

      {menuOpen && (
        <div className="border-t border-line px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-4 text-sm text-body">
            {navLinks.map((link) => (
              <a key={link.key} href={link.href} onClick={() => setMenuOpen(false)} className="hover:text-heading">
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false)
                onStatusClick()
              }}
              className="cursor-pointer text-left hover:text-heading"
            >
              {t('hospital.checkAppointmentStatus')}
            </button>
            <Link to={{ pathname: '/login', search: location.search }} className="hover:text-heading">
              {t('hospital.staffLogin')}
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false)
                onBookClick()
              }}
              className="cursor-pointer rounded-lg border px-4 py-2 text-center font-medium"
              style={{ borderColor: 'var(--tenant-primary)', color: 'var(--tenant-primary)' }}
            >
              {t('hospital.bookAppointment')}
            </button>
            <LanguageSwitcher />
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
