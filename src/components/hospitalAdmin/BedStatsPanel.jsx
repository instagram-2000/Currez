function BedStatsPanel({ stats, floors, selectedFloorId, onSelectFloor, wardFilter, onWardFilterChange }) {
  const selectedFloor = floors?.find((f) => f.id === selectedFloorId)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">Occupancy</h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Total" value={stats.total} color="text-heading" />
          <StatCard label="Occupied" value={stats.occupied} color="text-red-600 dark:text-red-400" />
          <StatCard label="Vacant" value={stats.vacant} color="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Rate" value={`${stats.occupancyRate}%`} color="text-indigo-600 dark:text-indigo-300" />
        </div>
      </div>

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

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl border border-line/80 bg-card p-3 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-faint">{label}</div>
    </div>
  )
}

export default BedStatsPanel
