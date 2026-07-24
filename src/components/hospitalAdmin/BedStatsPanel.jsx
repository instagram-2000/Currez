import { useState } from 'react'
import Modal from '../common/Modal'

function BedStatsPanel({
  stats,
  floors,
  selectedFloorId,
  onSelectFloor,
  wardFilter,
  onWardFilterChange,
  allBeds,
  activeAdmissions,
  onBedSelect,
}) {
  const [modalStatus, setModalStatus] = useState(null)

  const selectedFloor = floors?.find((f) => f.id === selectedFloorId)

  function findAdmission(bed) {
    return (
      activeAdmissions.find(
        (a) =>
          a.status === 'active' &&
          a.floorId === bed.floorId &&
          a.wardId === bed.wardId &&
          a.roomId === bed.roomId &&
          a.bedId === bed.bedId
      ) || null
    )
  }

  const modalBeds = modalStatus
    ? allBeds.filter((b) => {
        if (modalStatus === 'occupied') return !!findAdmission(b)
        if (modalStatus === 'vacant') return !findAdmission(b)
        return true
      })
    : []

  function handleBedClick(bed) {
    const admission = findAdmission(bed)
    setModalStatus(null)
    onBedSelect?.(bed, admission)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">Occupancy</h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Occupied"
            value={stats.occupied}
            color="text-red-600 dark:text-red-400"
            onClick={() => setModalStatus('occupied')}
          />
          <StatCard
            label="Vacant"
            value={stats.vacant}
            color="text-emerald-600 dark:text-emerald-400"
            onClick={() => setModalStatus('vacant')}
          />
        </div>
        <div className="mt-2 text-center text-[11px] text-muted">
          {stats.total} total &middot; {stats.occupancyRate}% occupancy
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

      {modalStatus && (
        <Modal onClose={() => setModalStatus(null)} className="max-w-lg">
          <h2 className="mb-1 text-lg font-bold text-heading">
            {modalStatus === 'occupied' ? 'Occupied Beds' : 'Vacant Beds'}
          </h2>
          <p className="mb-4 text-xs text-muted">
            {modalBeds.length} bed{modalBeds.length !== 1 ? 's' : ''} &middot; Click a bed to {modalStatus === 'occupied' ? 'discharge' : 'admit'}
          </p>

          {modalBeds.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              {modalStatus === 'occupied' ? 'No beds are currently occupied.' : 'No vacant beds available.'}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
              {modalBeds.map((bed) => {
                const admission = findAdmission(bed)
                const isOccupied = !!admission
                return (
                  <button
                    key={`${bed.floorId}/${bed.wardId}/${bed.roomId}/${bed.bedId}`}
                    type="button"
                    onClick={() => handleBedClick(bed)}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                      isOccupied
                        ? 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30'
                        : 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-heading">{bed.bedId}</span>
                      <span
                        className={`text-[10px] font-semibold uppercase ${
                          isOccupied ? 'text-red-500' : 'text-emerald-500'
                        }`}
                      >
                        {isOccupied ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted">
                      {bed.floorName} &middot; {bed.wardName} &middot; {bed.roomName}
                    </div>
                    {isOccupied && admission.patientName && (
                      <div className="mt-1.5 text-xs font-medium text-heading">
                        {admission.patientName}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

function StatCard({ label, value, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-line/80 bg-card p-3 text-center transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5"
    >
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-faint">{label}</div>
    </button>
  )
}

export default BedStatsPanel
