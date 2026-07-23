import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import {
  createEmptyFloor,
  createEmptyWard,
  createEmptyRoom,
  createEmptyBed,
  generateBedId,
} from '../../utils/bedManagement'

const DEFAULT_BED_TYPES = {
  general: { label: 'General', ratePerDay: 500 },
  semiPrivate: { label: 'Semi-Private', ratePerDay: 1500 },
  private: { label: 'Private Room', ratePerDay: 3000 },
  icu: { label: 'ICU', ratePerDay: 5000 },
}

function BedConfigEditor({ config, onSave, onClose }) {
  const [bedTypes, setBedTypes] = useState({})
  const [floors, setFloors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (config) {
      setBedTypes(config.bedTypes || { ...DEFAULT_BED_TYPES })
      setFloors(JSON.parse(JSON.stringify(config.floors || [])))
    } else {
      setBedTypes({ ...DEFAULT_BED_TYPES })
      setFloors([])
    }
  }, [config])

  function addFloor() {
    setFloors((prev) => [...prev, createEmptyFloor(prev.length + 1)])
  }

  function removeFloor(floorIdx) {
    setFloors((prev) => prev.filter((_, i) => i !== floorIdx))
  }

  function updateFloor(floorIdx, patch) {
    setFloors((prev) => prev.map((f, i) => (i === floorIdx ? { ...f, ...patch } : f)))
  }

  function addWard(floorIdx) {
    setFloors((prev) =>
      prev.map((f, i) =>
        i === floorIdx ? { ...f, wards: [...(f.wards || []), createEmptyWard((f.wards?.length || 0) + 1)] } : f
      )
    )
  }

  function removeWard(floorIdx, wardIdx) {
    setFloors((prev) =>
      prev.map((f, i) => (i === floorIdx ? { ...f, wards: f.wards.filter((_, j) => j !== wardIdx) } : f))
    )
  }

  function updateWard(floorIdx, wardIdx, patch) {
    setFloors((prev) =>
      prev.map((f, i) =>
        i === floorIdx
          ? { ...f, wards: f.wards.map((w, j) => (j === wardIdx ? { ...w, ...patch } : w)) }
          : f
      )
    )
  }

  function addRoom(floorIdx, wardIdx) {
    setFloors((prev) =>
      prev.map((f, i) =>
        i === floorIdx
          ? {
              ...f,
              wards: f.wards.map((w, j) =>
                j === wardIdx
                  ? { ...w, rooms: [...(w.rooms || []), createEmptyRoom(`Room ${(w.rooms?.length || 0) + 1}`)] }
                  : w
              ),
            }
          : f
      )
    )
  }

  function removeRoom(floorIdx, wardIdx, roomIdx) {
    setFloors((prev) =>
      prev.map((f, i) =>
        i === floorIdx
          ? {
              ...f,
              wards: f.wards.map((w, j) =>
                j === wardIdx ? { ...w, rooms: w.rooms.filter((_, k) => k !== roomIdx) } : w
              ),
            }
          : f
      )
    )
  }

  function updateRoom(floorIdx, wardIdx, roomIdx, patch) {
    setFloors((prev) =>
      prev.map((f, i) =>
        i === floorIdx
          ? {
              ...f,
              wards: f.wards.map((w, j) =>
                j === wardIdx
                  ? { ...w, rooms: w.rooms.map((r, k) => (k === roomIdx ? { ...r, ...patch } : r)) }
                  : w
              ),
            }
          : f
      )
    )
  }

  function addBed(floorIdx, wardIdx, roomIdx) {
    setFloors((prev) =>
      prev.map((f, i) =>
        i === floorIdx
          ? {
              ...f,
              wards: f.wards.map((w, j) =>
                j === wardIdx
                  ? {
                      ...w,
                      rooms: w.rooms.map((r, k) =>
                        k === roomIdx
                          ? {
                              ...r,
                              beds: [
                                ...(r.beds || []),
                                createEmptyBed(generateBedId(r.name?.replace(/\s+/g, '').slice(0, 5) || 'B', (r.beds?.length || 0) + 1), 'general'),
                              ],
                            }
                          : r
                      ),
                    }
                  : w
              ),
            }
          : f
      )
    )
  }

  function removeBed(floorIdx, wardIdx, roomIdx, bedIdx) {
    setFloors((prev) =>
      prev.map((f, i) =>
        i === floorIdx
          ? {
              ...f,
              wards: f.wards.map((w, j) =>
                j === wardIdx
                  ? {
                      ...w,
                      rooms: w.rooms.map((r, k) =>
                        k === roomIdx ? { ...r, beds: r.beds.filter((_, m) => m !== bedIdx) } : r
                      ),
                    }
                  : w
              ),
            }
          : f
      )
    )
  }

  function updateBed(floorIdx, wardIdx, roomIdx, bedIdx, patch) {
    setFloors((prev) =>
      prev.map((f, i) =>
        i === floorIdx
          ? {
              ...f,
              wards: f.wards.map((w, j) =>
                j === wardIdx
                  ? {
                      ...w,
                      rooms: w.rooms.map((r, k) =>
                        k === roomIdx
                          ? { ...r, beds: r.beds.map((b, m) => (m === bedIdx ? { ...b, ...patch } : b)) }
                          : r
                      ),
                    }
                  : w
              ),
            }
          : f
      )
    )
  }

  function addBedType() {
    const key = `type-${Date.now()}`
    setBedTypes((prev) => ({ ...prev, [key]: { label: 'New Type', ratePerDay: 0 } }))
  }

  function updateBedType(key, patch) {
    setBedTypes((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  function removeBedType(key) {
    setBedTypes((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')

    const totalBeds = floors.reduce(
      (sum, f) => sum + f.wards.reduce((ws, w) => ws + w.rooms.reduce((rs, r) => rs + (r.beds?.length || 0), 0), 0),
      0
    )
    if (totalBeds === 0) {
      setError('Add at least one bed to save the configuration.')
      return
    }

    setLoading(true)
    try {
      await onSave({ bedTypes, floors })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save configuration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} className="max-w-3xl">
      <h2 className="mb-1 text-lg font-bold text-heading">Configure Beds &amp; Wards</h2>
      <p className="mb-5 text-sm text-muted">Set up floors, wards, rooms and bed types for this hospital.</p>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Bed Types */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">Bed Types &amp; Rates</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(bedTypes).map(([key, bt]) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="text"
                  value={bt.label}
                  onChange={(e) => updateBedType(key, { label: e.target.value })}
                  className="flex-1 rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading outline-none focus:border-indigo-500/50"
                  placeholder="Type name"
                />
                <input
                  type="number"
                  value={bt.ratePerDay}
                  onChange={(e) => updateBedType(key, { ratePerDay: Number(e.target.value) || 0 })}
                  className="w-28 rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading outline-none focus:border-indigo-500/50"
                  placeholder="₹/day"
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => removeBedType(key)}
                  className="shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addBedType}
              className="self-start rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/10 dark:text-indigo-300"
            >
              + Add Bed Type
            </button>
          </div>
        </section>

        <div className="h-px bg-line" />

        {/* Floors → Wards → Rooms → Beds */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">Layout</h3>
            <button
              type="button"
              onClick={addFloor}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              + Add Floor
            </button>
          </div>

          {floors.length === 0 && (
            <p className="rounded-xl border border-dashed border-line py-8 text-center text-sm text-muted">
              No floors yet. Click "Add Floor" to start building your hospital layout.
            </p>
          )}

          <div className="flex flex-col gap-4">
            {floors.map((floor, fi) => (
              <div key={floor.id} className="rounded-xl border border-line/80 bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={floor.name}
                    onChange={(e) => updateFloor(fi, { name: e.target.value })}
                    className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-heading outline-none focus:border-indigo-500/50"
                    placeholder="Floor name"
                  />
                  <button
                    type="button"
                    onClick={() => removeFloor(fi)}
                    className="shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {(floor.wards || []).map((ward, wi) => (
                    <div key={ward.id} className="rounded-lg border border-line/60 bg-surface p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={ward.name}
                          onChange={(e) => updateWard(fi, wi, { name: e.target.value })}
                          className="flex-1 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-medium text-heading outline-none focus:border-indigo-500/50"
                          placeholder="Ward name"
                        />
                        <button
                          type="button"
                          onClick={() => removeWard(fi, wi)}
                          className="shrink-0 rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-500/10"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {(ward.rooms || []).map((room, ri) => (
                          <div key={room.id} className="rounded-lg border border-line/40 bg-card p-2.5">
                            <div className="mb-2 flex items-center gap-2">
                              <input
                                type="text"
                                value={room.name}
                                onChange={(e) => updateRoom(fi, wi, ri, { name: e.target.value })}
                                className="flex-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-[11px] text-heading outline-none focus:border-indigo-500/50"
                                placeholder="Room name"
                              />
                              <button
                                type="button"
                                onClick={() => removeRoom(fi, wi, ri)}
                                className="shrink-0 rounded-lg p-1 text-red-500 transition-colors hover:bg-red-500/10"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {(room.beds || []).map((bed, bi) => (
                                <div key={bi} className="flex items-center gap-1 rounded-lg border border-line/60 bg-surface px-2 py-1">
                                  <input
                                    type="text"
                                    value={bed.bedId}
                                    onChange={(e) => updateBed(fi, wi, ri, bi, { bedId: e.target.value })}
                                    className="w-20 rounded border border-transparent bg-transparent px-1 py-0.5 text-[11px] font-bold text-heading outline-none focus:border-indigo-500/50 focus:bg-card"
                                    placeholder="Bed ID"
                                  />
                                  <select
                                    value={bed.type}
                                    onChange={(e) => updateBed(fi, wi, ri, bi, { type: e.target.value })}
                                    className="rounded border border-transparent bg-transparent px-1 py-0.5 text-[10px] text-muted outline-none focus:border-indigo-500/50 focus:bg-card"
                                  >
                                    {Object.entries(bedTypes).map(([k, bt]) => (
                                      <option key={k} value={k}>
                                        {bt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => removeBed(fi, wi, ri, bi)}
                                    className="rounded p-0.5 text-[10px] text-red-500 transition-colors hover:bg-red-500/10"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addBed(fi, wi, ri)}
                                className="rounded-lg border border-dashed border-line px-2 py-1 text-[10px] font-medium text-indigo-600 transition-colors hover:bg-indigo-500/10 dark:text-indigo-300"
                              >
                                + Bed
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addRoom(fi, wi)}
                          className="self-start rounded-lg px-2.5 py-1 text-[11px] font-medium text-indigo-600 transition-colors hover:bg-indigo-500/10 dark:text-indigo-300"
                        >
                          + Add Room
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addWard(fi)}
                    className="self-start rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/10 dark:text-indigo-300"
                  >
                    + Add Ward
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-card-strong hover:text-heading"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default BedConfigEditor
