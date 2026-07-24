import { useState } from 'react'

function BedStatsPanel({
  stats,
  floors,
  selectedFloorId,
  onSelectFloor,
  wardFilter,
  onWardFilterChange,
  statusFilter,
  onStatusFilterChange,
  allBeds,
  activeAdmissions,
}) {
  const [expandedStatus, setExpandedStatus] = useState(null)

  const selectedFloor = floors?.find((f) => f.id === selectedFloorId)

  function handleStatClick(type) {
    if (type === 'rate') return
    if (statusFilter === type) {
      onStatusFilterChange(null)
      setExpandedStatus(null)
    } else {
      onStatusFilterChange(type)
      setExpandedStatus(type)
    }
  }

  const filteredBeds = expandedStatus
    ? allBeds.filter((b) => {
        if (expandedStatus === 'occupied') {
          return activeAdmissions.some(
            (a) =>
              a.status === 'active' &&
              a.floorId === b.floorId &&
              a.wardId === b.wardId &&
              a.roomId === b.roomId &&
              a.bedId === b.bedId
          )
        }
        if (expandedStatus === 'vacant') {
          return !activeAdmissions.some(
            (a) =>
              a.status === 'active' &&
              a.floorId === b.floorId &&
              a.wardId === b.wardId &&
              a.roomId === b.roomId &&
              a.bedId === b.bedId
          )
        }
        return true
      })
    : []

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">Occupancy</h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Total"
            value={stats.total}
            color="text-heading"
            active={statusFilter === 'total'}
            onClick={() => handleStatClick('total')}
          />
          <StatCard
            label="Occupied"
            value={stats.occupied}
            color="text-red-600 dark:text-red-400"
            active={statusFilter === 'occupied'}
            onClick={() => handleStatClick('occupied')}
          />
          <StatCard
            label="Vacant"
            value={stats.vacant}
            color="text-emerald-600 dark:text-emerald-400"
            active={statusFilter === 'vacant'}
            onClick={() => handleStatClick('vacant')}
          />
          <StatCard label="Rate" value={`${stats.occupancyRate}%`} color="text-indigo-600 dark:text-indigo-300" />
        </div>
      </div>

      {expandedStatus && filteredBeds.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">
              {expandedStatus === 'occupied' ? 'Occupied Beds' : 'Vacant Beds'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setExpandedStatus(null)
                onStatusFilterChange(null)
              }}
              className="text-[10px] font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {filteredBeds.map((bed) => {
              const admission = activeAdmissions.find(
                (a) =>
                  a.status === 'active' &&
                  a.floorId === bed.floorId &&
                  a.wardId === bed.wardId &&
                  a.roomId === bed.roomId &&
                  a.bedId === bed.bedId
              )
              return (
                <div
                  key={`${bed.floorId}/${bed.wardId}/${bed.roomId}/${bed.bedId}`}
                  className="rounded-lg border border-line/60 bg-card px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-heading">{bed.bedId}</span>
                    <span
                      className={`text-[9px] font-semibold uppercase ${
                        expandedStatus === 'occupied'
                          ? 'text-red-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {expandedStatus === 'occupied' ? 'Occupied' : 'Vacant'}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted">
                    {bed.floorName} &middot; {bed.wardName} &middot; {bed.roomName}
                  </div>
                  {admission && (
                    <div className="mt-1 text-[10px] font-medium text-heading">
                      {admission.patientName}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {Object.keys(stats.byWard).length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">By Ward</h3>
          <div className="flex flex-col gap-1">
            {Object.entries(stats.byWard).map(([id, ward]) => (
              <div key={id} className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-body">
                <span className="truncate font-medium">{ward.name}</span>
                <span className="shrink-0 pl-2 text-faint">
                  {ward.occupied}/{ward.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">Floors</h3>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onSelectFloor(null)}
            className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
              !selectedFloorId
                ? 'bg-indigo-500/15 text-indigo-600 ring-1 ring-inset ring-indigo-500/25 dark:text-indigo-300'
                : 'text-muted hover:bg-card-strong hover:text-heading'
            }`}
          >
            All Floors
          </button>
          {(floors || []).map((floor) => (
            <button
              key={floor.id}
              type="button"
              onClick={() => onSelectFloor(floor.id)}
              className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                selectedFloorId === floor.id
                  ? 'bg-indigo-500/15 text-indigo-600 ring-1 ring-inset ring-indigo-500/25 dark:text-indigo-300'
                  : 'text-muted hover:bg-card-strong hover:text-heading'
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>
      </div>

      {selectedFloor && selectedFloor.wards?.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">
            Ward Filter — {selectedFloor.name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onWardFilterChange(null)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                !wardFilter
                  ? 'bg-indigo-500/15 text-indigo-600 ring-1 ring-inset ring-indigo-500/25 dark:text-indigo-300'
                  : 'text-muted hover:bg-card-strong hover:text-heading'
              }`}
            >
              All Wards
            </button>
            {selectedFloor.wards.map((ward) => (
              <button
                key={ward.id}
                type="button"
                onClick={() => onWardFilterChange(ward.id)}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  wardFilter === ward.id
                    ? 'bg-indigo-500/15 text-indigo-600 ring-1 ring-inset ring-indigo-500/25 dark:text-indigo-300'
                    : 'text-muted hover:bg-card-strong hover:text-heading'
                }`}
              >
                {ward.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">Legend</h3>
        <div className="flex flex-col gap-1.5 text-[11px] text-muted">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Vacant
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Occupied
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, active, onClick }) {
  const isClickable = !!onClick
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={`rounded-xl border p-3 text-center transition-all ${
        active
          ? 'border-indigo-500/50 bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/25'
          : 'border-line/80 bg-card'
      } ${isClickable ? 'cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-500/5' : 'cursor-default'}`}
    >
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-faint">{label}</div>
    </button>
  )
}

export default BedStatsPanel
