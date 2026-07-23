import { useLanguage } from '../../contexts/LanguageContext'
import NavIcon from '../common/NavIcon'

// Persistent bottom action bar, mobile only — the booking + status CTAs
// stay reachable with one thumb no matter how far a patient has scrolled,
// instead of only living in the header/hero at the very top of the page.
function MobileBookingBar({ config, onBookClick, onStatusClick }) {
  const { t } = useLanguage()
  const { emergency, footer } = config
  const callPhone = emergency?.enabled && emergency?.phone ? emergency.phone : footer?.phone

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-lg sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {callPhone && (
          <a
            href={`tel:${callPhone.replace(/\s+/g, '')}`}
            aria-label="Call the hospital"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line text-body transition-colors hover:bg-card-strong"
          >
            <NavIcon name="phone" className="h-4 w-4" />
          </a>
        )}
        <button
          onClick={onStatusClick}
          className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line text-sm font-medium text-body transition-colors hover:bg-card-strong"
        >
          <NavIcon name="clipboard" className="h-4 w-4" />
          Status
        </button>
        <button
          onClick={onBookClick}
          className="flex h-11 flex-[1.6] cursor-pointer items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
          style={{ backgroundColor: 'var(--tenant-primary)' }}
        >
          <NavIcon name="appointments" className="h-4 w-4" />
          {t('hospital.bookAppointment')}
        </button>
      </div>
    </div>
  )
}

export default MobileBookingBar
