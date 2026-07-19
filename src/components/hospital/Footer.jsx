import { useLanguage } from '../../contexts/LanguageContext'

function Footer({ config, onStatusClick }) {
  const { title } = config
  const { t } = useLanguage()

  const links = [
    config.optionals?.services?.enabled === 'on' && { href: '#services', label: t('hospital.navServices') },
    config.optionals?.doctors?.enabled === 'on' && { href: '#doctors', label: t('hospital.navDoctors') },
    { href: '#contact', label: t('hospital.navContact') },
  ].filter(Boolean)

  return (
    <footer className="border-t border-line px-6 py-8 md:px-12">
      <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {title}. {t('hospital.allRightsReserved')}
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-body">
              {link.label}
            </a>
          ))}
          <button
            onClick={onStatusClick}
            className="cursor-pointer font-medium transition-colors hover:text-body"
            style={{ color: 'var(--tenant-primary)' }}
          >
            {t('hospital.checkAppointmentStatus')}
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
