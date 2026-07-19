import { useLanguage } from '../../contexts/LanguageContext'
import SectionEyebrow from './SectionEyebrow'
import Reveal from '../common/Reveal'

function DepartmentsSection({ data }) {
  const items = data?.items ?? []
  const { t } = useLanguage()
  if (items.length === 0) return null

  return (
    <section id="departments" className="px-6 py-20 md:px-12">
      <Reveal>
        <SectionEyebrow>Departments</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold text-heading">{t('hospital.departments')}</h2>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal
            key={item.name}
            delay={i * 60}
            className="rounded-xl border border-line bg-card p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-line-strong"
          >
            <h3 className="font-semibold text-heading">{item.name}</h3>
            <p className="mt-2 text-sm text-body">{item.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default DepartmentsSection
