import NavIcon from '../common/NavIcon'

function StatCard({ label, value, hint, icon }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-line-strong">
      {icon && (
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 ring-1 ring-inset ring-indigo-500/20 dark:text-indigo-300">
          <NavIcon name={icon} />
        </span>
      )}
      <p className={`text-sm text-muted ${icon ? 'mt-4' : ''}`}>{label}</p>
      <p className="mt-1 text-2xl font-semibold text-heading">{value}</p>
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  )
}

export default StatCard
