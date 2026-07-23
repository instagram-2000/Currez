import { useLanguage } from '../../contexts/LanguageContext'
import SectionEyebrow from './SectionEyebrow'
import Reveal from '../common/Reveal'
import { SITE_CONTAINER } from '../../utils/layout'

// Deliberately not another card grid — Services and Doctors already use
// that shape, so Departments reads as an indexed list instead. Same page,
// more visual rhythm as you scroll.
function DepartmentsSection({ data }) {
  const items = data?.items ?? []
  const { t } = useLanguage()
  if (items.length === 0) return null

  return (
    <section id="departments" className={`py-20 ${SITE_CONTAINER}`}>
      <Reveal>
        <SectionEyebrow>{t('hospital.navDepartments')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold text-heading">{t('hospital.departments')}</h2>
      </Reveal>
      <div className="mx-auto mt-10 max-w-4xl divide-y divide-line border-t border-b border-line">
        {items.map((item, i) => (
          <Reveal
            key={item.name}
            delay={i * 60}
            className="group grid grid-cols-[2.5rem_1fr] items-start gap-4 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-6"
          >
            <span className="font-mono text-2xl font-bold text-line-strong transition-colors duration-300 group-hover:text-[var(--tenant-primary)] sm:text-3xl">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="text-lg font-semibold text-heading transition-transform duration-300 group-hover:translate-x-1">
                {item.name}
              </h3>
              <p className="max-w-md text-sm text-body">{item.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default DepartmentsSection
