import SectionEyebrow from './SectionEyebrow'
import Reveal from '../common/Reveal'

function ContactSection({ config }) {
  const { footer, opdHours } = config
  if (!footer?.address && !footer?.phone && !footer?.email && !opdHours?.length) return null

  return (
    <section id="contact" className="px-6 py-20 md:px-12">
      <Reveal>
        <SectionEyebrow>Contact</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold text-heading">Visit or reach us</h2>
      </Reveal>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <Reveal className="space-y-6">
          <div className="space-y-3 text-sm text-body">
            {footer?.address && (
              <p className="flex items-start gap-2">
                <span>📍</span> {footer.address}
              </p>
            )}
            {footer?.phone && (
              <p className="flex items-center gap-2">
                <span>📞</span>{' '}
                <a href={`tel:${footer.phone.replace(/\s+/g, '')}`} className="hover:text-heading">
                  {footer.phone}
                </a>
              </p>
            )}
            {footer?.email && (
              <p className="flex items-center gap-2">
                <span>✉️</span>{' '}
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
                  <th className="pb-2 font-medium">Day</th>
                  <th className="pb-2 font-medium">OPD Hours</th>
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
          className="flex min-h-[220px] items-center justify-center rounded-xl border border-line bg-card text-center text-sm text-muted"
        >
          <span>🗺️ Map / location photo</span>
        </Reveal>
      </div>
    </section>
  )
}

export default ContactSection
