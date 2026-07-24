import { useEffect, useMemo, useState } from 'react'
import { subscribeInvoices } from '../../firebase/billing'
import { useAuth } from '../../contexts/AuthContext'
import { useHospitalData } from '../../contexts/HospitalDataContext'
import { ROLES } from '../../utils/roles'
import { canEditModule } from '../../utils/permissions'
import { shiftDateString, todayDateString } from '../../utils/dates'
import CreateInvoiceModal from '../../components/hospitalAdmin/CreateInvoiceModal'
import InvoiceDetailModal from '../../components/hospitalAdmin/InvoiceDetailModal'
import StatCard from '../../components/superadmin/StatCard'
import { PageSpinner } from '../../components/common/Spinner'
import NavIcon from '../../components/common/NavIcon'
import Pagination from '../../components/common/Pagination'

const STATUS_STYLES = {
  due: 'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400',
  paid: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400',
  void: 'bg-card-strong text-muted ring-line',
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'due', label: 'Due' },
  { key: 'paid', label: 'Paid' },
  { key: 'void', label: 'Void' },
]

function formatMoney(n) {
  return `₹${(Number(n) || 0).toFixed(2)}`
}

// Only completed visits at least 90 days back are candidates for a new
// invoice — a visit older than that is treated as settled/written off
// rather than left dangling in the "needs invoicing" list forever.
const INVOICE_WINDOW_DAYS = 90

function BillingPage({ tenantSlug }) {
  const { role, user, userDoc } = useAuth()
  const canEdit = canEditModule(userDoc, 'billing')
  const canVoid = role === ROLES.HOSPITAL_ADMIN && canEdit
  const { hospital, appointments, staff } = useHospitalData()

  const [invoices, setInvoices] = useState(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewingInvoiceId, setViewingInvoiceId] = useState(null)

  const PAGE_SIZE = 10
  // Derived from the live `invoices` subscription rather than storing the
  // clicked-row object directly — otherwise recording a payment or voiding
  // from inside the modal would update Firestore but leave the open modal
  // showing the stale pre-action status until it's closed and reopened.
  const viewingInvoice = viewingInvoiceId ? invoices.find((inv) => inv.id === viewingInvoiceId) || null : null

  useEffect(() => subscribeInvoices(tenantSlug, setInvoices), [tenantSlug])

  const doctorsById = useMemo(
    () => Object.fromEntries(staff.filter((s) => s.role === ROLES.DOCTOR).map((d) => [d.uid, d])),
    [staff]
  )

  const windowStart = shiftDateString(-INVOICE_WINDOW_DAYS)
  const eligibleAppointments = useMemo(() => {
    if (invoices === null) return []
    const invoiced = new Set(invoices.map((inv) => inv.appointmentId))
    return appointments
      .filter((a) => a.status === 'completed' && a.date >= windowStart && !invoiced.has(a.id))
      .sort((a, b) => `${b.date}T${b.time || ''}`.localeCompare(`${a.date}T${a.time || ''}`))
  }, [appointments, invoices, windowStart])

  const filtered = useMemo(() => {
    if (!invoices) return []
    let list = activeTab === 'all' ? invoices : invoices.filter((inv) => inv.status === activeTab)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (inv) => inv.patientName?.toLowerCase().includes(q) || inv.patientPhone?.toLowerCase().includes(q)
      )
    }
    return list
  }, [invoices, activeTab, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginatedInvoices = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const stats = useMemo(() => {
    if (!invoices) return { todaysCollection: 0, outstandingDue: 0, totalInvoices: 0 }
    const today = todayDateString()
    const todaysCollection = invoices
      .filter((inv) => inv.status === 'paid' && inv.paidAt?.toDate && todayDateString(inv.paidAt.toDate()) === today)
      .reduce((sum, inv) => sum + (inv.total || 0), 0)
    // Subtracts amountPaid so a partially-paid invoice (still 'due' until
    // its balance reaches zero) only counts its remaining balance here, not
    // its full original total.
    const outstandingDue = invoices
      .filter((inv) => inv.status === 'due')
      .reduce((sum, inv) => sum + Math.max((inv.total || 0) - (inv.amountPaid || 0), 0), 0)
    const totalInvoices = invoices.filter((inv) => inv.status !== 'void').length
    return { todaysCollection, outstandingDue, totalInvoices }
  }, [invoices])

  const counts = useMemo(() => {
    if (!invoices) return {}
    return {
      all: invoices.length,
      due: invoices.filter((i) => i.status === 'due').length,
      paid: invoices.filter((i) => i.status === 'paid').length,
      void: invoices.filter((i) => i.status === 'void').length,
    }
  }, [invoices])

  if (invoices === null || hospital === undefined) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-heading">Billing</h1>
          <p className="mt-0.5 text-sm text-muted">Invoices and collections for completed visits</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <NavIcon name="billing" className="h-4 w-4" />
            Create Invoice
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Today's Collection" value={formatMoney(stats.todaysCollection)} hint="Paid today" icon="billing" />
        <StatCard label="Outstanding Due" value={formatMoney(stats.outstandingDue)} hint="Across unpaid invoices" icon="schedule" />
        <StatCard label="Total Invoices" value={stats.totalInvoices} hint="Excludes voided" icon="patients" />
      </div>

      <input
        type="text"
        placeholder="Search by patient name or phone..."
        value={search}
        onChange={handleSearchChange}
        className="w-full max-w-sm rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-heading placeholder:text-faint focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
      />

      <div className="flex gap-1 rounded-xl bg-card-strong p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key ? 'bg-card text-heading shadow-sm' : 'text-muted hover:text-heading'
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={`ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  activeTab === tab.key ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300' : 'bg-card-strong text-faint'
                }`}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile: stacked cards instead of a horizontally-scrolling table. */}
      <div className="space-y-3 md:hidden">
        {paginatedInvoices.map((invoice) => (
          <div key={invoice.id} className="rounded-2xl border border-line bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-heading">{invoice.patientName || '—'}</p>
                {invoice.patientPhone && <p className="text-xs text-faint">{invoice.patientPhone}</p>}
              </div>
              <span
                className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${
                  STATUS_STYLES[invoice.status] || STATUS_STYLES.due
                }`}
              >
                {invoice.status}
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
              <dt className="text-faint">Date</dt>
              <dd className="text-right text-body">{invoice.date || '—'}</dd>
              <dt className="text-faint">Doctor</dt>
              <dd className="text-right text-body">{invoice.doctorName || 'Unassigned'}</dd>
              <dt className="text-faint">Total</dt>
              <dd className="text-right font-medium text-heading">{formatMoney(invoice.total)}</dd>
              {invoice.status === 'due' && invoice.amountPaid > 0 && (
                <>
                  <dt className="text-faint">Paid so far</dt>
                  <dd className="text-right text-emerald-600 dark:text-emerald-400">{formatMoney(invoice.amountPaid)}</dd>
                </>
              )}
            </dl>

            <button
              onClick={() => setViewingInvoiceId(invoice.id)}
              className="mt-3 w-full cursor-pointer rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
            >
              View
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-line bg-card px-5 py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-strong">
                <NavIcon name="billing" className="h-6 w-6 text-faint" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted">No invoices found</p>
              <p className="mt-1 text-xs text-faint">
                {activeTab === 'all' ? 'Create one from a completed visit to get started' : `No ${activeTab} invoices`}
              </p>
            </div>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Desktop: full table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-card shadow-sm md:block">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead>
            <tr className="border-b border-line bg-card-strong/30">
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Date</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Patient</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Doctor</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Total</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-faint uppercase">Status</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wider text-faint uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {paginatedInvoices.map((invoice) => (
              <tr key={invoice.id} className="group transition-colors hover:bg-card-strong/50">
                <td className="px-5 py-3.5 whitespace-nowrap text-muted">{invoice.date || '—'}</td>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-heading">{invoice.patientName || '—'}</div>
                  {invoice.patientPhone && <div className="text-xs text-faint">{invoice.patientPhone}</div>}
                </td>
                <td className="px-5 py-3.5 text-muted">{invoice.doctorName || 'Unassigned'}</td>
                <td className="px-5 py-3.5 font-medium text-heading">{formatMoney(invoice.total)}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${
                      STATUS_STYLES[invoice.status] || STATUS_STYLES.due
                    }`}
                  >
                    {invoice.status}
                  </span>
                  {invoice.status === 'due' && invoice.amountPaid > 0 && (
                    <span className="ml-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                      {formatMoney(invoice.amountPaid)} paid
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => setViewingInvoiceId(invoice.id)}
                    className="cursor-pointer rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-strong">
                      <NavIcon name="billing" className="h-6 w-6 text-faint" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-muted">No invoices found</p>
                    <p className="mt-1 text-xs text-faint">
                      {activeTab === 'all' ? 'Create one from a completed visit to get started' : `No ${activeTab} invoices`}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateInvoiceModal
          hospitalId={tenantSlug}
          eligibleAppointments={eligibleAppointments}
          doctorsById={doctorsById}
          onCancel={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}

      {viewingInvoice && (
        <InvoiceDetailModal
          invoice={viewingInvoice}
          hospital={hospital}
          canRecordPayment={canEdit}
          canVoid={canVoid}
          onClose={() => setViewingInvoiceId(null)}
        />
      )}
    </div>
  )
}

export default BillingPage
