import { useMemo } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { getTenantSlug } from './utils/subdomain'
import CompanyLandingPage from './pages/CompanyLandingPage'
import HospitalLandingPage from './pages/HospitalLandingPage'
import { AuthProvider } from './contexts/AuthContext'
import { FeatureProvider } from './contexts/FeatureContext'
import RequireFeature from './components/hospitalAdmin/RequireFeature'
import ChatbotPage from './pages/hospitalAdmin/ChatbotPage'
import RequireSuperAdmin from './components/superadmin/RequireSuperAdmin'
import SuperAdminLayout from './components/superadmin/SuperAdminLayout'
import SuperAdminLoginPage from './pages/superadmin/SuperAdminLoginPage'
import DashboardPage from './pages/superadmin/DashboardPage'
import HospitalsListPage from './pages/superadmin/HospitalsListPage'
import HospitalFormPage from './pages/superadmin/HospitalFormPage'
import HospitalDetailPage from './pages/superadmin/HospitalDetailPage'
import PublicAppointmentPage from './pages/PublicAppointmentPage'
import AppointmentStatusPage from './pages/AppointmentStatusPage'
import RequireHospitalStaff from './components/hospitalAdmin/RequireHospitalStaff'
import RequireRole from './components/hospitalAdmin/RequireRole'
import HospitalPortalLayout from './components/hospitalAdmin/HospitalPortalLayout'
import HospitalLoginPage from './pages/hospitalAdmin/HospitalLoginPage'
import OverviewPage from './pages/hospitalAdmin/OverviewPage'
import AppointmentsPage from './pages/hospitalAdmin/AppointmentsPage'
import PatientsPage from './pages/hospitalAdmin/PatientsPage'
import StaffPage from './pages/hospitalAdmin/StaffPage'
import DoctorsPage from './pages/hospitalAdmin/DoctorsPage'
import MySchedulePage from './pages/hospitalAdmin/MySchedulePage'
import { ROLES } from './utils/roles'

function App() {
  const tenantSlug = useMemo(() => getTenantSlug(), [])
  const location = useLocation()

  return (
    <Routes>
      <Route
        path="/"
        element={tenantSlug ? <HospitalLandingPage slug={tenantSlug} /> : <CompanyLandingPage />}
      />

      {/* /superadmin only exists on the root/company domain — under a
          tenant subdomain it falls through to the catch-all below. */}
      {!tenantSlug && (
        <Route
          path="/superadmin"
          element={
            <AuthProvider>
              <Outlet />
            </AuthProvider>
          }
        >
          <Route index element={<SuperAdminLoginPage />} />
          <Route element={<RequireSuperAdmin />}>
            <Route element={<SuperAdminLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="hospitals" element={<HospitalsListPage />} />
              <Route path="hospitals/new" element={<HospitalFormPage mode="create" />} />
              <Route path="hospitals/:slug" element={<HospitalDetailPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/superadmin" replace />} />
        </Route>
      )}

      {/* Public, no-login booking + status pages — only on a hospital's own subdomain. */}
      {tenantSlug && (
        <>
          <Route path="/appointment" element={<PublicAppointmentPage slug={tenantSlug} />} />
          <Route path="/appointment-status" element={<AppointmentStatusPage slug={tenantSlug} />} />
        </>
      )}

      {/* /login and /dashboard only exist on a hospital's own subdomain —
          each tenant's staff sign in and manage only their own hospital. */}
      {tenantSlug && (
        <Route
          element={
            <AuthProvider>
              <Outlet />
            </AuthProvider>
          }
        >
          <Route path="/login" element={<HospitalLoginPage tenantSlug={tenantSlug} />} />
          <Route path="/dashboard" element={<Outlet />}>
            <Route element={<RequireHospitalStaff tenantSlug={tenantSlug} />}>
              {/* Feature flags for this hospital only resolve once we know
                  who's logged in, so FeatureProvider mounts here — after
                  RequireHospitalStaff, wrapping everything else below. */}
              <Route element={<FeatureProvider><Outlet /></FeatureProvider>}>
                <Route element={<HospitalPortalLayout tenantSlug={tenantSlug} />}>
                  <Route index element={<Navigate to="overview" replace />} />
                  <Route path="overview" element={<OverviewPage tenantSlug={tenantSlug} />} />
                  <Route path="appointments" element={<AppointmentsPage tenantSlug={tenantSlug} />} />

                  {/* Hospital admin + receptionist only */}
                  <Route element={<RequireRole allowedRoles={[ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST]} />}>
                    <Route path="patients" element={<PatientsPage tenantSlug={tenantSlug} />} />
                  </Route>

                  {/* Hospital admin only */}
                  <Route element={<RequireRole allowedRoles={[ROLES.HOSPITAL_ADMIN]} />}>
                    <Route path="staff" element={<StaffPage tenantSlug={tenantSlug} />} />
                  </Route>

                  {/* Receptionist only — read-only doctor schedules */}
                  <Route element={<RequireRole allowedRoles={[ROLES.RECEPTIONIST]} />}>
                    <Route path="doctors" element={<DoctorsPage tenantSlug={tenantSlug} />} />
                  </Route>

                  {/* Doctor only — self-service schedule */}
                  <Route element={<RequireRole allowedRoles={[ROLES.DOCTOR]} />}>
                    <Route path="schedule" element={<MySchedulePage />} />
                  </Route>

                  {/* Hospital admin + receptionist, and only if the Super
                      Admin has enabled the chatbot module for this hospital */}
                  <Route element={<RequireRole allowedRoles={[ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST]} />}>
                    <Route element={<RequireFeature featureKey="chatbot" />}>
                      <Route path="chatbot" element={<ChatbotPage />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>
      )}

      <Route path="*" element={<Navigate to={{ pathname: '/', search: location.search }} replace />} />
    </Routes>
  )
}

export default App
