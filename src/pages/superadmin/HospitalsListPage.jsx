import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeHospitals, deleteHospital } from '../../firebase/hospitals'
import StatusBadge from '../../components/superadmin/StatusBadge'
import ConfirmDialog from '../../components/superadmin/ConfirmDialog'
import Spinner from '../../components/common/Spinner'

function HospitalsListPage() {
  const [hospitals, setHospitals] = useState(null)
  const [search, setSearch] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => subscribeHospitals(setHospitals), [])

  const filtered = useMemo(() => {
    if (!hospitals) return []
    const q = search.trim().toLowerCase()
    if (!q) return hospitals
    return hospitals.filter(
      (h) => h.title?.toLowerCase().includes(q) || h.slug.toLowerCase().includes(q)
    )
  }, [hospitals, search])

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteHospital(pendingDelete.slug)
      setPendingDelete(null)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (!hospitals) return <Spinner />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-heading">Hospitals</h1>
          <p className="mt-1 text-sm text-muted">{hospitals.length} onboarded</p>
        </div>
        <Link
          to="/superadmin/hospitals/new"
          className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          + New Hospital
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by name or slug…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full max-w-sm rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading placeholder:text-faint focus:border-line-strong focus:outline-none sm:w-72"
      />

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="text-left text-xs font-medium uppercase tracking-wide text-faint">
            <tr>
              <th className="px-4 py-3">Hospital</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((hospital) => (
              <tr key={hospital.slug} className="transition-colors hover:bg-card-strong">
                <td className="px-4 py-3 font-medium text-heading">{hospital.title}</td>
                <td className="px-4 py-3 text-muted">{hospital.slug}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={hospital.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/superadmin/hospitals/${hospital.slug}`}
                    className="mr-4 cursor-pointer text-sm font-medium text-body hover:text-heading"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={() => {
                      setDeleteError('')
                      setPendingDelete(hospital)
                    }}
                    className="cursor-pointer text-sm font-medium text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-faint">
                  No hospitals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete hospital"
          message={
            deleteError ||
            `Are you sure you want to delete "${pendingDelete.title}"? This cannot be undone.`
          }
          confirmLabel="Delete"
          danger
          busy={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}

export default HospitalsListPage
