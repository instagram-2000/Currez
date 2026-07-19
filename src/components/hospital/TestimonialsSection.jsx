import { useLanguage } from '../../contexts/LanguageContext'
import { initials } from '../../utils/initials'
import SectionEyebrow from './SectionEyebrow'
import Reveal from '../common/Reveal'

function TestimonialsSection({ data }) {
  const items = data?.items ?? []
  const { t } = useLanguage()
  if (items.length === 0) return null

  return (
    <section id="testimonials" className="px-6 py-20 md:px-12">
      <Reveal>
        <SectionEyebrow>{t('hospital.navTestimonials')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold text-heading">{t('hospital.testimonials')}</h2>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((item, i) => (
          <Reveal
            key={item.name}
            delay={i * 80}
            className="relative overflow-hidden rounded-2xl border border-line bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-strong hover:shadow-lg"
          >
            <span
              className="pointer-events-none absolute -top-3 right-4 font-serif text-7xl leading-none opacity-10"
              style={{ color: 'var(--tenant-primary)' }}
              aria-hidden="true"
            >
              &rdquo;
            </span>
            <p className="relative text-sm tracking-wide" style={{ color: 'var(--tenant-primary)' }}>
              {'★'.repeat(item.rating ?? 5)}
              <span className="text-line-strong">{'★'.repeat(5 - (item.rating ?? 5))}</span>
            </p>
            <p className="relative mt-3 text-sm text-body">&ldquo;{item.message}&rdquo;</p>
            <div className="relative mt-5 flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: 'color-mix(in srgb, var(--tenant-primary) 15%, transparent)',
                  color: 'var(--tenant-primary)',
                }}
              >
                {initials(item.name)}
              </span>
              <p className="text-sm font-medium text-heading">{item.name}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection
