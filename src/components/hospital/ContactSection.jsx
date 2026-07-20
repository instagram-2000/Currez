import { useLanguage } from '../../contexts/LanguageContext'
import SectionEyebrow from './SectionEyebrow'
import Reveal from '../common/Reveal'
import NavIcon from '../common/NavIcon'

function ContactSection({ config }) {
  const { footer, opdHours } = config
  const { t } = useLanguage()
  if (!footer?.address && !footer?.phone && !footer?.email && !opdHours?.length) return null

  return (
    <section id="contact" className="px-6 py-20 md:px-12">
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
          className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-card text-center text-sm text-muted"
        >
          <NavIcon name="map" className="h-6 w-6 text-faint" />
          <span>{t('hospital.mapPlaceholder')}</span>
        </Reveal>
      </div>
    </section>
  )
}

export default ContactSection
