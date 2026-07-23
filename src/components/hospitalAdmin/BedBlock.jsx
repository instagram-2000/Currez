import { computeDaysSince, computeRunningCharges } from '../../utils/bedManagement'

function BedBlock({ bed, admission, isOccupied, isSelected, onSelect }) {
  const status = isOccupied ? 'occupied' : isSelected ? 'selected' : 'vacant'

  const styles = {
    vacant:
      'bg-emerald-500/8 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/12 cursor-pointer',
    occupied:
      'bg-red-500/8 border-red-500/20 hover:border-red-500/40 cursor-pointer',
    selected:
      'bg-indigo-500/10 border-indigo-500/40 ring-2 ring-indigo-500/30',
  }

  const days = admission ? computeDaysSince(admission.admittedAt) : 0
  const charges = admission ? computeRunningCharges(admission.dailyRate, admission.admittedAt) : 0

  return (
    <button
      type="button"
      onClick={() => onSelect?.(bed, admission)}
      className={`relative flex w-full min-w-[120px] flex-col items-center gap-1 rounded-xl border p-3 transition-all duration-200 ${styles[status]}`}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            isOccupied ? 'bg-red-500' : isSelected ? 'bg-indigo-500' : 'bg-emerald-500'
          }`}
        />
        <span className="text-xs font-bold tracking-wide text-heading">{bed.bedId}</span>
      </div>

      <span className="text-[10px] font-medium uppercase tracking-wider text-faint">
        {(bed.type || 'general').replace(/([A-Z])/g, ' $1').trim()}
      </span>

      {isOccupied && admission ? (
        <div className="mt-1 flex flex-col items-center gap-0.5">
          <span className="max-w-full truncate text-[11px] font-medium text-heading">
            {admission.patientName}
          </span>
          <span className="text-[10px] text-muted">{days}d</span>
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            ₹{charges.toLocaleString('en-IN')}
          </span>
        </div>
      ) : isSelected ? (
        <span className="mt-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-300">
          Select
        </span>
      ) : (
        <span className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          Vacant
        </span>
      )}
    </button>
  )
}

export default BedBlock
