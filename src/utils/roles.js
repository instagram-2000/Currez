export const ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
  DOCTOR: 'DOCTOR',
}

// Roles assignable to hospital staff from the superadmin UI. SUPERADMIN
// accounts are never created in-app — they're provisioned by hand in the
// Firebase Console and recognized via SUPERADMIN_EMAILS.
export const CREATABLE_STAFF_ROLES = [ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR]

// A hospital admin may only add doctors/receptionists within their own
// hospital — never another hospital admin (that stays superadmin-only).
export const CREATABLE_STAFF_ROLES_BY_HOSPITAL_ADMIN = [ROLES.DOCTOR, ROLES.RECEPTIONIST]

export const ROLE_LABELS = {
  [ROLES.SUPERADMIN]: 'Super Admin',
  [ROLES.HOSPITAL_ADMIN]: 'Hospital Admin',
  [ROLES.RECEPTIONIST]: 'Receptionist',
  [ROLES.DOCTOR]: 'Doctor',
}

const SUPERADMIN_EMAILS = (import.meta.env.VITE_SUPERADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export function isSuperAdminEmail(email) {
  if (!email) return false
  return SUPERADMIN_EMAILS.includes(email.toLowerCase())
}
