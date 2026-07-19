const STYLES = {
  trial: 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/30 dark:text-indigo-300',
  active: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400',
  disabled: 'bg-card-strong text-muted ring-line',
}

const LABELS = {
  hospital: { trial: 'Trial', active: 'Ongoing' },
  user: { active: 'Active', disabled: 'Disabled' },
}

function StatusBadge({ status, kind = 'hospital' }) {
  const label = LABELS[kind]?.[status] || status
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        STYLES[status] || STYLES.disabled
      }`}
    >
      {label}
    </span>
  )
}

export default StatusBadge
