import { useLanguage } from '../../contexts/LanguageContext'
import SectionEyebrow from './SectionEyebrow'
import Reveal from '../common/Reveal'

function TestimonialsSection({ data }) {
  const items = data?.items ?? []
  const { t } = useLanguage()
  if (items.length === 0) return null

  return (
    <section id="testimonials" className="px-6 py-20 md:px-12">
      <Reveal>
        <SectionEyebrow>Testimonials</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold text-heading">{t('hospital.testimonials')}</h2>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((item, i) => (
          <Reveal
            key={item.name}
            delay={i * 80}
            className="rounded-xl border border-line bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-line-strong"
          >
            <p className="text-sm" style={{ color: 'var(--tenant-primary)' }}>
              {'★'.repeat(item.rating ?? 5)}
            </p>
            <p className="mt-3 text-sm text-body">"{item.message}"</p>
            <p className="mt-4 text-sm text-muted">— {item.name}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection
