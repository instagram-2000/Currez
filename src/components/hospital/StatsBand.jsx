import Reveal from '../common/Reveal'
import NavIcon from '../common/NavIcon'
import { SITE_CONTAINER } from '../../utils/layout'

// Departments/Doctors counts are derived from real config data rather than
// stored separately, so they can never drift out of sync with what's
// actually configured.
function StatsBand({ config, doctorCount }) {
  const departmentCount = config.optionals?.departments?.items?.length || 0

  const stats = [
    departmentCount > 0 && { label: 'Departments', value: String(departmentCount), icon: 'hospitals' },
    doctorCount > 0 && { label: 'Doctors', value: String(doctorCount), icon: 'doctors' },
    config.emergency?.enabled && { label: 'Emergency Care', value: '24/7', icon: 'pulse' },
    config.yearsServing && { label: 'Years Serving the City', value: String(config.yearsServing), icon: 'star' },
  ].filter(Boolean)

  if (stats.length === 0) return null

  return (
    <section className={`relative z-10 -mt-10 ${SITE_CONTAINER}`}>
      <div
        className={`mx-auto grid max-w-5xl gap-4 ${
          stats.length >= 3 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'
        }`}
      >
        {stats.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 60}
            className="rounded-2xl border border-line bg-card p-5 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-lg"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'color-mix(in srgb, var(--tenant-primary) 18%, transparent)', color: 'var(--tenant-primary)' }}
            >
              <NavIcon name={stat.icon} />
            </span>
            <p className="mt-4 text-2xl font-bold text-heading md:text-3xl">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted md:text-sm">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default StatsBand
