import { useMemo } from 'react'
import { bedKey, getOccupiedMap } from '../../utils/bedManagement'

// Horizontal, scrollable floor picker — the RedBus "deck tab" affordance.
// Each pill shows the floor name plus an occupied/total fraction so staff
// can spot a full floor before even opening it.
function FloorTabs({ floors, allBeds, activeAdmissions, selectedFloorId, onSelectFloor }) {
  const occupiedMap = useMemo(() => getOccupiedMap(activeAdmissions || []), [activeAdmissions])

  const floorCounts = useMemo(() => {
    const counts = {}
    for (const bed of allBeds || []) {
      if (!counts[bed.floorId]) counts[bed.floorId] = { total: 0, occupied: 0 }
      counts[bed.floorId].total++
      if (occupiedMap.has(bedKey(bed.floorId, bed.wardId, bed.roomId, bed.bedId))) {
        counts[bed.floorId].occupied++
      }
    }
    return counts
  }, [allBeds, occupiedMap])

  if (!floors || floors.length === 0) return null

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <TabPill
        active={!selectedFloorId}
        onClick={() => onSelectFloor(null)}
        label="All Floors"
      />
      {floors.map((floor) => {
        const c = floorCounts[floor.id]
        return (
          <TabPill
            key={floor.id}
            active={selectedFloorId === floor.id}
            onClick={() => onSelectFloor(floor.id)}
            label={floor.name}
            badge={c ? `${c.occupied}/${c.total}` : null}
          />
        )
      })}
    </div>
  )
}

function TabPill({ active, onClick, label, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
          : 'border-line bg-card text-body hover:border-indigo-500/40 hover:text-heading'
      }`}
    >
      {label}
      {badge && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
            active ? 'bg-white/20 text-white' : 'bg-card-strong text-faint'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

export default FloorTabs
