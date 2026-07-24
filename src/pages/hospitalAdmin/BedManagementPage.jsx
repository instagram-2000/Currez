import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useHospitalData } from '../../contexts/HospitalDataContext'
import { useFeature } from '../../hooks/useFeature'
import { ROLES } from '../../utils/roles'
import {
  subscribeBedConfig,
  subscribeActiveAdmissions,
  admitPatient,
  dischargePatient,
  createBedConfig,
  updateBedConfig,
} from '../../firebase/bedManagement'
import { autoCreateDischargeInvoice } from '../../firebase/billing'
import { flattenBeds, computeOccupancyStats, getAdmissionForBed } from '../../utils/bedManagement'
import BedGrid from '../../components/hospitalAdmin/BedGrid'
import BedStatsPanel from '../../components/hospitalAdmin/BedStatsPanel'
import AdmitPatientModal from '../../components/hospitalAdmin/AdmitPatientModal'
import DischargeModal from '../../components/hospitalAdmin/DischargeModal'
import BedConfigEditor from '../../components/hospitalAdmin/BedConfigEditor'
import { PageSpinner } from '../../components/common/Spinner'

function BedManagementPage({ tenantSlug }) {
  const { user, role } = useAuth()
  const { staff, patients } = useHospitalData()
  const { enabled: billingEnabled } = useFeature('billing')
  const isAdmin = role === ROLES.HOSPITAL_ADMIN

  const [config, setConfig] = useState(undefined)
  const [activeAdmissions, setActiveAdmissions] = useState(null)
  const [selectedFloorId, setSelectedFloorId] = useState(null)
  const [wardFilter, setWardFilter] = useState(null)
  const [statusFilter, setStatusFilter] = useState(null)
  const [showConfigEditor, setShowConfigEditor] = useState(false)
  const [admitModal, setAdmitModal] = useState(null)
  const [dischargeModal, setDischargeModal] = useState(null)

  useEffect(() => {
    const unsub = subscribeBedConfig(tenantSlug, setConfig)
    return unsub
  }, [tenantSlug])

  useEffect(() => {
    const unsub = subscribeActiveAdmissions(tenantSlug, setActiveAdmissions)
    return unsub
  }, [tenantSlug])

  const doctors = useMemo(
    () => (staff || []).filter((s) => s.role === 'DOCTOR' && s.status === 'active'),
    [staff]
  )

  const allBeds = useMemo(() => flattenBeds(config), [config])
  const stats = useMemo(() => computeOccupancyStats(allBeds, activeAdmissions || []), [allBeds, activeAdmissions])

  function handleBedSelect(bed, admission) {
    if (admission) {
      setDischargeModal(admission)
    } else {
      setAdmitModal(bed)
    }
  }

  async function handleAdmit(data) {
    await admitPatient(
      {
        hospitalId: tenantSlug,
        ...data,
        floorId: admitModal.floorId,
        floorName: admitModal.floorName,
        wardId: admitModal.wardId,
        wardName: admitModal.wardName,
        roomId: admitModal.roomId,
        roomName: admitModal.roomName,
        bedId: admitModal.bedId,
        bedType: admitModal.type,
        dailyRate: config?.bedTypes?.[admitModal.type]?.ratePerDay || 0,
      },
      user.email
    )
  }

  async function handleDischarge(admissionId, data) {
    const { createInvoice, ...dischargeData } = data
    await dischargePatient(admissionId, {
      ...dischargeData,
      dischargedBy: user.email,
    })

    if (createInvoice && billingEnabled && dischargeModal) {
      await autoCreateDischargeInvoice({
        billingEnabled: true,
        hospitalId: tenantSlug,
        admissionId,
        patientId: dischargeModal.patientId,
        patientName: dischargeModal.patientName,
        patientPhone: dischargeModal.patientPhone,
        doctorId: dischargeModal.attendingDoctorId,
        doctorName: dischargeModal.attendingDoctor,
        bedType: dischargeModal.bedType,
        wardName: dischargeModal.wardName,
        roomName: dischargeModal.roomName,
        dailyRate: dischargeModal.dailyRate,
        totalDays: dischargeData.totalDays,
        totalCharges: dischargeData.totalCharges,
        linkedAppointmentId: dischargeModal.linkedAppointmentId,
        createdBy: user.email,
      })
    }
  }

  async function handleSaveConfig(newConfig) {
    if (config) {
      await updateBedConfig(tenantSlug, newConfig, user.email)
    } else {
      await createBedConfig(tenantSlug, newConfig, user.email)
    }
  }

  if (config === undefined || activeAdmissions === null) {
    return <PageSpinner />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Beds &amp; Wards</h1>
          <p className="mt-0.5 text-sm text-muted">Manage hospital beds, admissions and occupancy</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowConfigEditor(true)}
            className="self-start rounded-xl border border-line bg-card px-4 py-2 text-sm font-medium text-heading transition-colors hover:bg-card-strong"
          >
            Configure
          </button>
        )}
      </div>

      {/* Main layout: sidebar + grid */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Stats sidebar */}
        <aside className="w-full shrink-0 rounded-2xl border border-line/80 bg-surface p-4 lg:w-64">
          <BedStatsPanel
            stats={stats}
            floors={config?.floors || []}
            selectedFloorId={selectedFloorId}
            onSelectFloor={setSelectedFloorId}
            wardFilter={wardFilter}
            onWardFilterChange={setWardFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            allBeds={allBeds}
            activeAdmissions={activeAdmissions || []}
          />
        </aside>

        {/* Bed grid */}
        <div className="min-w-0 flex-1">
          <BedGrid
            floors={config?.floors || []}
            activeAdmissions={activeAdmissions}
            selectedFloorId={selectedFloorId}
            wardFilter={wardFilter}
            statusFilter={statusFilter}
            onBedSelect={handleBedSelect}
          />
        </div>
      </div>

      {/* Modals */}
      {admitModal && (
        <AdmitPatientModal
          bed={admitModal}
          config={config}
          patients={patients}
          doctors={doctors}
          onAdmit={handleAdmit}
          onClose={() => setAdmitModal(null)}
        />
      )}

      {dischargeModal && (
        <DischargeModal
          admission={dischargeModal}
          onDischarge={handleDischarge}
          onClose={() => setDischargeModal(null)}
        />
      )}

      {showConfigEditor && (
        <BedConfigEditor
          config={config}
          onSave={handleSaveConfig}
          onClose={() => setShowConfigEditor(false)}
        />
      )}
    </div>
  )
}

export default BedManagementPage
