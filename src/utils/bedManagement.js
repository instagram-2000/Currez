import { todayDateString } from './dates'

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

// Build a Set of occupied bed IDs from active admissions.
export function getOccupiedBedIds(activeAdmissions) {
  return new Set(activeAdmissions.filter((a) => a.status === 'active').map((a) => a.bedId))
}

// Compute occupancy stats from flat beds + active admissions.
export function computeOccupancyStats(beds, activeAdmissions) {
  const occupiedSet = getOccupiedBedIds(activeAdmissions)
  const total = beds.length
  const occupied = beds.filter((b) => occupiedSet.has(b.bedId)).length
  const vacant = total - occupied
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 1000) / 10 : 0

  const byWard = {}
  for (const bed of beds) {
    const key = bed.wardId
    if (!byWard[key]) byWard[key] = { name: bed.wardName, total: 0, occupied: 0 }
    byWard[key].total++
    if (occupiedSet.has(bed.bedId)) byWard[key].occupied++
  }

  const byType = {}
  for (const bed of beds) {
    const key = bed.type || 'unspecified'
    if (!byType[key]) byType[key] = { count: 0, occupied: 0 }
    byType[key].count++
    if (occupiedSet.has(bed.bedId)) byType[key].occupied++
  }

  return { total, occupied, vacant, occupancyRate, byWard, byType }
}

// Get the admission record for a specific bed (or null).
export function getAdmissionForBed(bedId, activeAdmissions) {
  return activeAdmissions.find((a) => a.bedId === bedId && a.status === 'active') || null
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
export function getBedStatus(bedId, occupiedSet) {
  if (occupiedSet.has(bedId)) return 'occupied'
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
