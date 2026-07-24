import { todayDateString } from './dates'

// Build a unique composite key for a bed's position in the hierarchy.
// Beds with the same `bedId` can exist in different rooms — the composite
// key ensures they are treated as distinct beds for occupancy tracking.
export function bedKey(floorId, wardId, roomId, bedId) {
  return `${floorId}/${wardId}/${roomId}/${bedId}`
}

// Flatten all beds from a bed config into a flat list with hierarchy info.
export function flattenBeds(config) {
  if (!config?.floors) return []
  const beds = []
  for (const floor of config.floors || []) {
    for (const ward of floor.wards || []) {
      for (const room of ward.rooms || []) {
        for (const bed of room.beds || []) {
          beds.push({
            ...bed,
            floorId: floor.id,
            floorName: floor.name,
            wardId: ward.id,
            wardName: ward.name,
            roomId: room.id,
            roomName: room.name,
          })
        }
      }
    }
  }
  return beds
}

// Build a Map of occupied beds keyed by composite position key → admission.
export function getOccupiedMap(activeAdmissions) {
  const map = new Map()
  for (const a of activeAdmissions) {
    if (a.status === 'active' && a.floorId && a.wardId && a.roomId && a.bedId) {
      map.set(bedKey(a.floorId, a.wardId, a.roomId, a.bedId), a)
    }
  }
  return map
}

// Compute occupancy stats from flat beds + active admissions.
export function computeOccupancyStats(beds, activeAdmissions) {
  const occupied = getOccupiedMap(activeAdmissions)
  const total = beds.length
  const occupiedCount = beds.filter((b) => occupied.has(bedKey(b.floorId, b.wardId, b.roomId, b.bedId))).length
  const vacant = total - occupiedCount
  const occupancyRate = total > 0 ? Math.round((occupiedCount / total) * 1000) / 10 : 0

  const byWard = {}
  for (const bed of beds) {
    const key = bed.wardId
    if (!byWard[key]) byWard[key] = { name: bed.wardName, total: 0, occupied: 0 }
    byWard[key].total++
    if (occupied.has(bedKey(bed.floorId, bed.wardId, bed.roomId, bed.bedId))) byWard[key].occupied++
  }

  const byType = {}
  for (const bed of beds) {
    const key = bed.type || 'unspecified'
    if (!byType[key]) byType[key] = { count: 0, occupied: 0 }
    byType[key].count++
    if (occupied.has(bedKey(bed.floorId, bed.wardId, bed.roomId, bed.bedId))) byType[key].occupied++
  }

  return { total, occupied: occupiedCount, vacant, occupancyRate, byWard, byType }
}

// Get the admission record for a specific bed (or null).
export function getAdmissionForBed(floorId, wardId, roomId, bedId, activeAdmissions) {
  const key = bedKey(floorId, wardId, roomId, bedId)
  return activeAdmissions.find((a) => a.status === 'active' && bedKey(a.floorId, a.wardId, a.roomId, a.bedId) === key) || null
}

// Compute days since admission.
export function computeDaysSince(admittedAt) {
  if (!admittedAt) return 0
  const admitted = admittedAt.toDate ? admittedAt.toDate() : new Date(admittedAt)
  const now = new Date()
  const diffMs = now - admitted
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

// Compute running charges.
export function computeRunningCharges(dailyRate, admittedAt) {
  const days = computeDaysSince(admittedAt)
  return (Number(dailyRate) || 0) * days
}

// Format bed status for display.
export function getBedStatus(floorId, wardId, roomId, bedId, occupiedMap) {
  if (occupiedMap.has(bedKey(floorId, wardId, roomId, bedId))) return 'occupied'
  return 'vacant'
}

// Generate a unique bed ID from room prefix + index.
export function generateBedId(roomPrefix, index) {
  return `${roomPrefix}-${String(index).padStart(2, '0')}`
}

// Create an empty floor template.
export function createEmptyFloor(order) {
  return {
    id: `floor-${Date.now()}`,
    name: `Floor ${order}`,
    order,
    wards: [],
  }
}

// Create an empty ward template.
export function createEmptyWard(order) {
  return {
    id: `ward-${Date.now()}`,
    name: `Ward ${order}`,
    order,
    rooms: [],
  }
}

// Create an empty room template.
export function createEmptyRoom(name) {
  return {
    id: `room-${Date.now()}`,
    name: name || 'New Room',
    beds: [],
  }
}

// Create an empty bed template.
export function createEmptyBed(bedId, type) {
  return { bedId, type: type || 'general' }
}
