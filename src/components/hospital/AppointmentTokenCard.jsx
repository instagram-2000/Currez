import { useLanguage } from '../../contexts/LanguageContext'

// The token result shown after a successful booking, shared by the full
// booking form and the lighter landing-page section. Styled like a queue
// chit (mono digits, dashed border) but colored with the hospital's own
// --tenant-primary rather than a fixed brand color — every hospital's site
// carries its own branding, so this can't hardcode one palette.
function AppointmentTokenCard({ token, hospitalName, doctorName, date }) {
  const { t } = useLanguage()
  const hasMeta = hospitalName || doctorName || date

  return (
    <div
      className="mx-auto mt-6 max-w-xs rounded-2xl border-2 border-dashed px-6 py-6 text-center"
      style={{ borderColor: 'color-mix(in srgb, var(--tenant-primary, #6366f1) 40%, transparent)' }}
    >
      <p
        className="flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em]"
        style={{ color: 'var(--tenant-primary, #6366f1)' }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--tenant-primary, #6366f1)' }} />
        {t('booking.yourToken')}
      </p>
      <p
        className="mt-2 font-mono text-4xl font-bold tracking-widest"
        style={{ color: 'var(--tenant-primary, #6366f1)' }}
      >
        {token}
      </p>
      {hasMeta && (
        <div className="mt-3 border-t border-line pt-3 text-xs text-muted">
          {hospitalName && <p className="font-medium text-heading">{hospitalName}</p>}
          {(doctorName || date) && <p className="mt-0.5">{[doctorName, date].filter(Boolean).join(' · ')}</p>}
        </div>
      )}
    </div>
  )
}

export default AppointmentTokenCard
