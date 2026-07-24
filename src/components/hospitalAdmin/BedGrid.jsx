import BedBlock from './BedBlock'
import { bedKey } from '../../utils/bedManagement'

function BedGrid({ floors, activeAdmissions, selectedFloorId, wardFilter, onBedSelect, selectedBedId, statusFilter }) {
  const occupiedMap = new Map()
  for (const admission of activeAdmissions) {
    if (admission.status === 'active' && admission.floorId && admission.wardId && admission.roomId && admission.bedId) {
      occupiedMap.set(bedKey(admission.floorId, admission.wardId, admission.roomId, admission.bedId), admission)
    }
  }

  const filteredFloors = (floors || []).filter(
    (floor) => !selectedFloorId || floor.id === selectedFloorId
  )

  if (filteredFloors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7h18M3 7l1.5-3h15L21 7 M7 11h.01 M12 11h.01 M17 11h.01" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-heading">No beds configured</h3>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Use the Configure button to set up floors, wards, rooms and beds for this hospital.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {filteredFloors.map((floor) => {
        const filteredWards = (floor.wards || []).filter(
          (ward) => !wardFilter || ward.id === wardFilter
        )
        if (filteredWards.length === 0) return null

        return (
          <div key={floor.id}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-heading">{floor.name}</h2>
              <div className="h-px flex-1 bg-line" />
            </div>

            <div className="flex flex-col gap-6">
              {filteredWards.map((ward) => (
                <div key={ward.id}>
                  <h3 className="mb-3 text-xs font-semibold text-muted">{ward.name}</h3>
                  <div className="flex flex-col gap-4">
                    {(ward.rooms || []).map((room) => (
                      <div key={room.id}>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-[11px] font-medium text-faint">{room.name}</span>
                          <span className="text-[10px] text-faint/60">
                            {room.beds?.length || 0} bed{(room.beds?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(room.beds || []).map((bed) => {
                            const key = bedKey(floor.id, ward.id, room.id, bed.bedId)
                            const admission = occupiedMap.get(key) || null
                            const isOccupied = !!admission
                            if (statusFilter === 'vacant' && isOccupied) return null
                            if (statusFilter === 'occupied' && !isOccupied) return null
                            return (
                              <BedBlock
                                key={bed.bedId}
                                bed={{
                                  ...bed,
                                  floorId: floor.id,
                                  floorName: floor.name,
                                  wardId: ward.id,
                                  wardName: ward.name,
                                  roomId: room.id,
                                  roomName: room.name,
                                }}
                                admission={admission}
                                isOccupied={isOccupied}
                                isSelected={selectedBedId === bed.bedId}
                                onSelect={onBedSelect}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default BedGrid
