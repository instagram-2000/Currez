import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeHospitals, deleteHospital } from '../../firebase/hospitals'
import StatusBadge from '../../components/superadmin/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import { PageSpinner } from '../../components/common/Spinner'
import NavIcon from '../../components/common/NavIcon'

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

  if (!hospitals) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-heading">Hospitals</h1>
          <p className="mt-0.5 text-sm text-muted">{hospitals.length} onboarded</p>
        </div>
        <Link
          to="/superadmin/hospitals/new"
          className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 active:scale-[0.98]"
        >
          <NavIcon name="hospitals" className="h-4 w-4" />
          New Hospital
        </Link>
      </div>

      <div className="relative max-w-sm">
        <NavIcon name="eye" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          type="text"
          placeholder="Search by name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-line bg-card py-2.5 pr-4 pl-9 text-sm text-heading placeholder:text-faint focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-sm">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead>
            <tr className="border-b border-line bg-card-strong/30">
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Hospital</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Slug</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Status</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wider text-faint uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((hospital) => (
              <tr key={hospital.slug} className="group transition-colors hover:bg-card-strong/50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 ring-1 ring-indigo-500/20 ring-inset dark:text-indigo-300">
                      {(hospital.title || '?')[0].toUpperCase()}
                    </span>
                    <span className="font-medium text-heading">{hospital.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted">{hospital.slug}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={hospital.status} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/superadmin/hospitals/${hospital.slug}`}
                      className="cursor-pointer rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => {
                        setDeleteError('')
                        setPendingDelete(hospital)
                      }}
                      className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-strong">
                      <NavIcon name="hospitals" className="h-6 w-6 text-faint" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-muted">
                      {search ? 'No hospitals match your search' : 'No hospitals yet'}
                    </p>
                    {!search && (
                      <>
                        <p className="mt-1 text-xs text-faint">Onboard your first hospital to get started</p>
                        <Link
                          to="/superadmin/hospitals/new"
                          className="mt-4 cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500"
                        >
                          + New Hospital
                        </Link>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <ConfirmModal
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
