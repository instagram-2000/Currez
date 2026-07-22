import { useEffect, useMemo, useState } from 'react'
import { subscribeHospital } from '../../firebase/hospitals'
import { subscribeInvoices } from '../../firebase/billing'
import { subscribeAppointments } from '../../firebase/appointments'
import { subscribeUsersByHospital } from '../../firebase/users'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../utils/roles'
import { shiftDateString, todayDateString } from '../../utils/dates'
import CreateInvoiceModal from '../../components/hospitalAdmin/CreateInvoiceModal'
import InvoiceDetailModal from '../../components/hospitalAdmin/InvoiceDetailModal'
import StatCard from '../../components/superadmin/StatCard'
import { PageSpinner } from '../../components/common/Spinner'
import NavIcon from '../../components/common/NavIcon'

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
  const { role, user } = useAuth()
  const canVoid = role === ROLES.HOSPITAL_ADMIN

  const [hospital, setHospital] = useState(undefined)
  const [invoices, setInvoices] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [staff, setStaff] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewingInvoiceId, setViewingInvoiceId] = useState(null)
  // Derived from the live `invoices` subscription rather than storing the
  // clicked-row object directly — otherwise recording a payment or voiding
  // from inside the modal would update Firestore but leave the open modal
  // showing the stale pre-action status until it's closed and reopened.
  const viewingInvoice = viewingInvoiceId ? invoices.find((inv) => inv.id === viewingInvoiceId) || null : null

  useEffect(() => subscribeHospital(tenantSlug, setHospital), [tenantSlug])
  useEffect(() => subscribeInvoices(tenantSlug, setInvoices), [tenantSlug])
  const windowStart = shiftDateString(-INVOICE_WINDOW_DAYS)
  useEffect(() => subscribeAppointments(tenantSlug, setAppointments, windowStart), [tenantSlug, windowStart])
  useEffect(() => subscribeUsersByHospital(tenantSlug, setStaff), [tenantSlug])

  const doctorsById = useMemo(
    () => Object.fromEntries(staff.filter((s) => s.role === ROLES.DOCTOR).map((d) => [d.uid, d])),
    [staff]
  )

  const eligibleAppointments = useMemo(() => {
    if (invoices === null) return []
    const invoiced = new Set(invoices.map((inv) => inv.appointmentId))
    return appointments
      .filter((a) => a.status === 'completed' && !invoiced.has(a.id))
      .sort((a, b) => `${b.date}T${b.time || ''}`.localeCompare(`${a.date}T${a.time || ''}`))
  }, [appointments, invoices])

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

  const stats = useMemo(() => {
    if (!invoices) return { todaysCollection: 0, outstandingDue: 0, totalInvoices: 0 }
    const today = todayDateString()
    const todaysCollection = invoices
      .filter((inv) => inv.status === 'paid' && inv.paidAt?.toDate && todayDateString(inv.paidAt.toDate()) === today)
      .reduce((sum, inv) => sum + (inv.total || 0), 0)
    const outstandingDue = invoices
      .filter((inv) => inv.status === 'due')
      .reduce((sum, inv) => sum + (inv.total || 0), 0)
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 active:scale-[0.98]"
        >
          <NavIcon name="billing" className="h-4 w-4" />
          Create Invoice
        </button>
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
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-heading placeholder:text-faint focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
      />

      <div className="flex gap-1 rounded-xl bg-card-strong p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
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

      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-sm">
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
            {filtered.map((invoice) => (
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
          canRecordPayment
          canVoid={canVoid}
          onClose={() => setViewingInvoiceId(null)}
        />
      )}
    </div>
  )
}

export default BillingPage
