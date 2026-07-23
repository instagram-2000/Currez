import { useLanguage } from '../../contexts/LanguageContext'
import SectionEyebrow from './SectionEyebrow'
import Reveal from '../common/Reveal'
import NavIcon from '../common/NavIcon'
import { SITE_CONTAINER } from '../../utils/layout'

function ContactSection({ config }) {
  const { footer, opdHours } = config
  const { t } = useLanguage()
  if (!footer?.address && !footer?.phone && !footer?.email && !opdHours?.length) return null

  const mapsUrl = footer?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(footer.address)}`
    : null

  return (
    <section id="contact" className={`py-20 ${SITE_CONTAINER}`}>
      <Reveal>
        <SectionEyebrow>{t('hospital.contact')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold text-heading">{t('hospital.visitOrReachUs')}</h2>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Reveal className="space-y-6 rounded-2xl border border-line bg-card p-7">
          <div className="space-y-3 text-sm text-body">
            {footer?.address && (
              <p className="flex items-start gap-2.5">
                <NavIcon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-faint" /> {footer.address}
              </p>
            )}
            {footer?.phone && (
              <p className="flex items-center gap-2.5">
                <NavIcon name="phone" className="h-4 w-4 shrink-0 text-faint" />
                <a href={`tel:${footer.phone.replace(/\s+/g, '')}`} className="hover:text-heading">
                  {footer.phone}
                </a>
              </p>
            )}
            {footer?.email && (
              <p className="flex items-center gap-2.5">
                <NavIcon name="mail" className="h-4 w-4 shrink-0 text-faint" />
                <a href={`mailto:${footer.email}`} className="hover:text-heading">
                  {footer.email}
                </a>
              </p>
            )}
          </div>

          {opdHours?.length > 0 && (
            <table className="w-full max-w-sm text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 font-medium">{t('hospital.day')}</th>
                  <th className="pb-2 font-medium">{t('hospital.opdHours')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-body">
                {opdHours.map((row) => (
                  <tr key={row.day}>
                    <td className="py-2">{row.day}</td>
                    <td className="py-2">{row.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Reveal>

        <Reveal
          delay={120}
          className="relative flex min-h-55 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-line bg-card text-center text-sm text-muted"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'radial-gradient(circle, var(--tenant-primary) 1.5px, transparent 1.5px)',
              backgroundSize: '18px 18px',
            }}
            aria-hidden="true"
          />
          <span
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--tenant-primary) 15%, transparent)', color: 'var(--tenant-primary)' }}
          >
            <NavIcon name="map" className="h-6 w-6" />
          </span>
          <span className="relative max-w-xs px-6">{footer?.address || t('hospital.mapPlaceholder')}</span>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
              style={{ color: 'var(--tenant-primary)' }}
            >
              <NavIcon name="pin" className="h-3.5 w-3.5" />
              Open in Google Maps
            </a>
          )}
        </Reveal>
      </div>
    </section>
  )
}

export default ContactSection
