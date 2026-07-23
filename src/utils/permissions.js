import { ROLES } from './roles'

export const PERMISSION_LEVELS = {
  NONE: 'none',
  VIEW: 'view',
  EDIT: 'edit',
}

export const PERMISSION_LEVEL_LABELS = {
  [PERMISSION_LEVELS.NONE]: 'No access',
  [PERMISSION_LEVELS.VIEW]: 'View only',
  [PERMISSION_LEVELS.EDIT]: 'Full access',
}

// Only modules where a Doctor/Receptionist's role already grants some form
// of access are worth a per-staff-member override — Overview (everyone's
// own dashboard), Schedule/Profile (a doctor's own self-service pages) and
// Staff (already Hospital-Admin-only) have nothing meaningful to restrict
// further, so they're deliberately left out of this list.
export const PERMISSION_MODULES = [
  { key: 'appointments', label: 'Appointments' },
  { key: 'patients', label: 'Patients' },
  { key: 'doctors', label: 'Doctors' },
  { key: 'billing', label: 'Billing' },
  { key: 'prescriptions', label: 'Prescriptions' },
  { key: 'chatbot', label: 'Chatbot' },
  { key: 'bedManagement', label: 'Beds & Wards' },
  { key: 'analytics', label: 'Analytics' },
]

// A Hospital Admin or Super Admin always has full access — permission
// overrides only ever narrow what a Doctor/Receptionist's role already
// allows, never grant anything beyond it. Role and feature-flag gating
// (RequireRole/RequireFeature) still apply on top of this; a permission
// override can't be used to reach a module the role/feature system already
// blocks outright.
export function getModulePermission(userDoc, moduleKey) {
  if (!userDoc) return PERMISSION_LEVELS.EDIT
  if (userDoc.role === ROLES.HOSPITAL_ADMIN || userDoc.role === ROLES.SUPERADMIN) {
    return PERMISSION_LEVELS.EDIT
  }
  const explicit = userDoc.permissions?.[moduleKey]
  if (explicit) return explicit
  // Legacy fallback: `billingAccess` predates this generalized `permissions`
  // map and only ever covered Billing — honor it for any staff member who
  // hasn't been touched by the newer Super Admin staff-profile editor yet,
  // exactly the same "missing means unaffected" contract billingAccess
  // itself already promised.
  if (moduleKey === 'billing' && userDoc.billingAccess === false) return PERMISSION_LEVELS.NONE
  return PERMISSION_LEVELS.EDIT
}

export function canViewModule(userDoc, moduleKey) {
  return getModulePermission(userDoc, moduleKey) !== PERMISSION_LEVELS.NONE
}

export function canEditModule(userDoc, moduleKey) {
  return getModulePermission(userDoc, moduleKey) === PERMISSION_LEVELS.EDIT
}
