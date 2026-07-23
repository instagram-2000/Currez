import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import LanguageSwitcher from '../common/LanguageSwitcher'
import ThemeToggle from '../common/ThemeToggle'
import { SITE_CONTAINER } from '../../utils/layout'

// Primary links shown directly in the desktop nav bar — keep this short
// so the header never feels crowded. Everything else lives in the "More"
// dropdown or the mobile hamburger menu.
const PRIMARY_NAV = [
  { key: 'services', href: '#services', labelKey: 'hospital.navServices' },
  { key: 'doctors', href: '#doctors', labelKey: 'hospital.navDoctors' },
  { key: 'contact', href: '#contact', labelKey: 'hospital.navContact' },
]

// Secondary links tucked behind the "More" dropdown on desktop and shown
// in the mobile menu alongside the primary ones.
const SECONDARY_NAV = [
  { key: 'departments', href: '#departments', labelKey: 'hospital.navDepartments' },
  { key: 'testimonials', href: '#testimonials', labelKey: 'hospital.navTestimonials' },
]

function Header({ config, onBookClick, onStatusClick }) {
  const { title, branding, optionals } = config
  const location = useLocation()
  const { t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef(null)

  // Build visible nav lists — only show sections the hospital has enabled.
  const primaryLinks = PRIMARY_NAV
    .filter((item) => item.key === 'contact' || optionals?.[item.key]?.enabled === 'on')
    .map((item) => ({ ...item, label: t(item.labelKey) }))

  const secondaryLinks = SECONDARY_NAV
    .filter((item) => optionals?.[item.key]?.enabled === 'on')
    .map((item) => ({ ...item, label: t(item.labelKey) }))

  const hasMore = secondaryLinks.length > 0

  // Close the "More" dropdown when clicking outside.
  useEffect(() => {
    if (!moreOpen) return
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [moreOpen])

  // Lock background scroll while the mobile menu is open, and let Escape
  // close it — same interaction contract as the site's Modal component.
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
        {/* Left — logo + name */}
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

        {/* Center — primary nav links + More dropdown */}
        <nav className="hidden items-center gap-6 text-sm text-body lg:flex">
          {primaryLinks.map((link) => (
            <a key={link.key} href={link.href} className="transition-colors hover:text-heading">
              {link.label}
            </a>
          ))}
          {hasMore && (
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className="flex cursor-pointer items-center gap-1 transition-colors hover:text-heading"
              >
                {t('hospital.navMore') || 'More'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {moreOpen && (
                <div className="animate-fade-in-up absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-xl">
                  {secondaryLinks.map((link) => (
                    <a
                      key={link.key}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2.5 text-sm text-body transition-colors hover:bg-card-strong hover:text-heading"
                    >
                      {link.label}
                    </a>
                  ))}
                  <button
                    onClick={() => { setMoreOpen(false); onStatusClick() }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-body transition-colors hover:bg-card-strong hover:text-heading"
                  >
                    {t('hospital.checkAppointmentStatus')}
                  </button>
                </div>
              )}
            </div>
          )}
          {!hasMore && (
            <button onClick={onStatusClick} className="cursor-pointer transition-colors hover:text-heading">
              {t('hospital.checkAppointmentStatus')}
            </button>
          )}
        </nav>

        {/* Right — CTA + utilities */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <Link
            to={{ pathname: '/login', search: location.search }}
            className="hidden rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-card-strong hover:text-heading lg:inline-block"
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

      {/* Mobile nav panel — CTA leads, links follow. Body scroll is locked
          while open (see the effect above) so the panel reads as a real
          overlay, not just content pushing the page down. */}
      {menuOpen && (
        <div className="animate-fade-in-up border-t border-line bg-surface px-6 py-5 lg:hidden">
          <button
            onClick={() => { setMenuOpen(false); onBookClick() }}
            className="block w-full cursor-pointer rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--tenant-primary)' }}
          >
            {t('hospital.bookAppointment')}
          </button>

          <nav className="mt-5 flex flex-col divide-y divide-line text-sm text-body">
            {primaryLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 transition-colors hover:text-heading"
              >
                {link.label}
              </a>
            ))}
            {secondaryLinks.map((link) => (
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
              onClick={() => { setMenuOpen(false); onStatusClick() }}
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
