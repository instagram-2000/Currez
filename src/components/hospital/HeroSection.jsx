import { useLanguage } from '../../contexts/LanguageContext'

function HeroSection({ config, onBookClick, onStatusClick }) {
  const { title, branding, hero, emergency, footer } = config
  const bgImage = branding?.logos?.bgImage
  const { t } = useLanguage()
  const callPhone = emergency?.enabled && emergency?.phone ? emergency.phone : footer?.phone

  return (
    <section
      className="relative flex min-h-120 items-center overflow-hidden px-6 pt-20 pb-28 md:px-12"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // The hero banner always stays on the hospital's brand-dark color
        // (with white text) regardless of the app-wide light/dark toggle —
        // that toggle governs the page around it, not the brand banner.
        backgroundColor: bgImage ? undefined : 'var(--tenant-secondary, #0f172a)',
      }}
    >
      {/* Always-on gradient wash: keeps hero text readable over any photo,
          and gives hospitals with no configured image a designed look
          instead of a flat color fill. */}
      <div
        className="absolute inset-0"
        style={{
          background: bgImage
            ? 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.75))'
            : `radial-gradient(ellipse 80% 60% at 20% 0%, color-mix(in srgb, var(--tenant-primary) 25%, transparent), transparent), linear-gradient(180deg, transparent, rgba(0,0,0,0.35))`,
        }}
      />

      <div className="relative max-w-2xl text-white">
        <h1 className="animate-fade-in-up text-4xl font-bold leading-tight md:text-5xl">
          {hero?.headline || `${t('hospital.welcomeTo')} ${title}`}
        </h1>
        <p
          className="mt-5 animate-fade-in-up text-base text-slate-300 md:text-lg"
          style={{ animationDelay: '120ms' }}
        >
          {hero?.subtitle || t('hospital.heroSubtitle')}
        </p>
        <div
          className="mt-8 flex animate-fade-in-up flex-wrap items-center gap-3 sm:gap-4"
          style={{ animationDelay: '240ms' }}
        >
          <button
            onClick={onBookClick}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--tenant-primary)' }}
          >
            📅 {t('hospital.bookAppointment')}
          </button>
          <button
            onClick={onStatusClick}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/25 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/50"
          >
            🔎 {t('hospital.checkAppointmentStatus')}
          </button>
          {callPhone && (
            <a
              href={`tel:${callPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 transition-colors hover:text-white"
            >
              📞 Call Now
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
