import { useLanguage } from '../../contexts/LanguageContext'
import { isAvailableToday, availableDaysShortLabel } from '../../utils/doctorSchedule'
import SectionEyebrow from './SectionEyebrow'
import Reveal from '../common/Reveal'

// Pulls from real doctor staff accounts (created by the hospital admin,
// with real schedules) rather than manually-entered marketing content —
// so "available today" is always accurate, never stale copy.
function DoctorsSection({ doctors }) {
  const { t } = useLanguage()
  if (!doctors || doctors.length === 0) return null

  return (
    <section id="doctors" className="px-6 py-20 md:px-12">
      <Reveal>
        <SectionEyebrow>Doctors</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold text-heading">{t('hospital.ourDoctors')}</h2>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {doctors.map((doctor, i) => {
          const availableToday = isAvailableToday(doctor.schedule)
          const daysLabel = availableDaysShortLabel(doctor.schedule)
          return (
            <Reveal
              key={doctor.uid}
              delay={i * 60}
              className="rounded-xl border border-line bg-card p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-line-strong"
            >
              <h3 className="font-semibold text-heading">{doctor.displayName}</h3>
              {doctor.specialization && <p className="mt-1 text-sm text-body">{doctor.specialization}</p>}
              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  availableToday ? '' : 'bg-card-strong text-muted'
                }`}
                style={
                  availableToday
                    ? { border: '1px solid var(--tenant-primary)', color: 'var(--tenant-primary)' }
                    : undefined
                }
              >
                {availableToday ? 'Available today' : daysLabel || 'By appointment'}
              </span>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

export default DoctorsSection
