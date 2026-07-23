import { useLanguage } from '../../contexts/LanguageContext'
import SectionEyebrow from './SectionEyebrow'
import Reveal from '../common/Reveal'
import { SITE_CONTAINER } from '../../utils/layout'

function ServicesSection({ data }) {
  const items = data?.items ?? []
  const { t } = useLanguage()
  if (items.length === 0) return null

  return (
    <section id="services" className={`relative overflow-hidden py-20 ${SITE_CONTAINER}`}>
      <div
        className="pointer-events-none absolute top-0 right-0 h-72 w-72 -translate-y-1/3 translate-x-1/3 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--tenant-primary, #6366f1), transparent 70%)' }}
      />
      <Reveal className="relative">
        <SectionEyebrow>{t('hospital.navServices')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold text-heading">{t('hospital.ourServices')}</h2>
      </Reveal>
      <div className="relative mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal
            key={item.title}
            delay={i * 60}
            className="group rounded-2xl border border-line bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-strong hover:shadow-lg"
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110"
              style={{ background: 'color-mix(in srgb, var(--tenant-primary) 15%, transparent)' }}
            >
              {item.icon}
            </span>
            <h3 className="mt-5 font-semibold text-heading">{item.title}</h3>
            <p className="mt-2 text-sm text-body">{item.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection
