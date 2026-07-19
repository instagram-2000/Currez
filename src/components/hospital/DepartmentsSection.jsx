import { useLanguage } from '../../contexts/LanguageContext'
import { initials } from '../../utils/initials'
import SectionEyebrow from './SectionEyebrow'
import Reveal from '../common/Reveal'

function DepartmentsSection({ data }) {
  const items = data?.items ?? []
  const { t } = useLanguage()
  if (items.length === 0) return null

  return (
    <section id="departments" className="px-6 py-20 md:px-12">
      <Reveal>
        <SectionEyebrow>{t('hospital.navDepartments')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold text-heading">{t('hospital.departments')}</h2>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal
            key={item.name}
            delay={i * 60}
            className="group relative overflow-hidden rounded-2xl border border-line bg-card p-7 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-line-strong hover:shadow-lg"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
              style={{ backgroundColor: 'var(--tenant-primary)' }}
            />
            <span
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-base font-bold"
              style={{
                background: 'color-mix(in srgb, var(--tenant-primary) 15%, transparent)',
                color: 'var(--tenant-primary)',
              }}
            >
              {initials(item.name)}
            </span>
            <h3 className="mt-4 font-semibold text-heading">{item.name}</h3>
            <p className="mt-2 text-sm text-body">{item.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default DepartmentsSection
