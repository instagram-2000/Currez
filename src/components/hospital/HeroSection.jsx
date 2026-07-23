import { useLanguage } from '../../contexts/LanguageContext'
import NavIcon from '../common/NavIcon'
import { SITE_CONTAINER } from '../../utils/layout'

function HeroSection({ config, doctorCount, onBookClick, onStatusClick }) {
  const { title, branding, hero, emergency, footer, yearsServing } = config
  const bgImage = branding?.logos?.bgImage
  const { t } = useLanguage()
  const callPhone = emergency?.enabled && emergency?.phone ? emergency.phone : footer?.phone

  // A quick, real trust signal above the headline — built from data the
  // hospital already entered (testimonial ratings, years serving) rather
  // than invented copy. Silently omitted piece-by-piece when missing.
  const testimonialItems = config.optionals?.testimonials?.items ?? []
  const avgRating =
    testimonialItems.length > 0
      ? (testimonialItems.reduce((sum, item) => sum + (item.rating ?? 5), 0) / testimonialItems.length).toFixed(1)
      : null
  const departmentCount = config.optionals?.departments?.items?.length || 0
  const trustParts = [
    avgRating && `★ ${avgRating} rated by patients`,
    yearsServing && `${yearsServing}+ years of care`,
  ].filter(Boolean)

  // A quiet "product panel" beside the headline — real numbers only, and
  // omitted entirely if a hospital hasn't configured enough to fill it, so
  // it never reads as a fabricated stat block.
  const panelStats = [
    departmentCount > 0 && { label: 'Departments', value: String(departmentCount), icon: 'hospitals' },
    doctorCount > 0 && { label: 'Doctors on staff', value: String(doctorCount), icon: 'doctors' },
    avgRating && { label: 'Patient rating', value: `${avgRating} / 5`, icon: 'star' },
    yearsServing && { label: 'Years serving', value: String(yearsServing), icon: 'pulse' },
  ].filter(Boolean)

  return (
    <section
      className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32"
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
            : `radial-gradient(ellipse 80% 60% at 20% 0%, color-mix(in srgb, var(--tenant-primary) 28%, transparent), transparent), linear-gradient(180deg, transparent, rgba(0,0,0,0.35))`,
        }}
      />
      {/* Soft decorative glow, purely a wide-screen accent — echoes the
          same blurred-blob treatment used in the staff dashboard shell so
          the whole product feels like one design system. */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 hidden h-96 w-96 rounded-full opacity-20 blur-3xl md:block"
        style={{ background: 'radial-gradient(circle, var(--tenant-primary), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className={`relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] ${SITE_CONTAINER}`}>
        <div className="max-w-2xl text-white">
          {trustParts.length > 0 && (
            <p className="animate-fade-in-up inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur">
              {trustParts.map((part) => (
                <span key={part}>{part}</span>
              ))}
            </p>
          )}
          <h1
            className="animate-fade-in-up text-4xl leading-[1.05] font-extrabold sm:text-5xl md:text-6xl"
            style={{ animationDelay: trustParts.length > 0 ? '80ms' : '0ms', marginTop: trustParts.length > 0 ? '1rem' : 0 }}
          >
            {hero?.headline || `${t('hospital.welcomeTo')} ${title}`}
          </h1>
          <p
            className="mt-5 animate-fade-in-up max-w-lg text-base text-slate-300 md:text-lg"
            style={{ animationDelay: '160ms' }}
          >
            {hero?.subtitle || t('hospital.heroSubtitle')}
          </p>
          <div
            className="mt-8 flex animate-fade-in-up flex-wrap items-center gap-3 sm:gap-4"
            style={{ animationDelay: '280ms' }}
          >
            <button
              onClick={onBookClick}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              style={{ backgroundColor: 'var(--tenant-primary)', boxShadow: '0 12px 24px -12px color-mix(in srgb, var(--tenant-primary) 60%, transparent)' }}
            >
              <NavIcon name="appointments" className="h-4 w-4" />
              {t('hospital.bookAppointment')}
            </button>
            <button
              onClick={onStatusClick}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/25 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/50"
            >
              <NavIcon name="clipboard" className="h-4 w-4" />
              {t('hospital.checkAppointmentStatus')}
            </button>
            {callPhone && (
              <a
                href={`tel:${callPhone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 transition-colors hover:text-white"
              >
                <NavIcon name="phone" className="h-3.5 w-3.5" />
                Call Now
              </a>
            )}
          </div>
        </div>

        {panelStats.length > 0 && (
          <div
            className="animate-fade-in-up relative hidden rounded-2xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl lg:block"
            style={{ animationDelay: '360ms' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{title}, at a glance</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {panelStats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--tenant-primary) 55%, transparent)' }}
                  >
                    <NavIcon name={stat.icon} className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-xl font-bold text-white">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroSection
