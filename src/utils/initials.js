// "Dr. Aisha Rao" -> "AR", "Cardiology" -> "CA" — used for avatar badges
// where no photo is available (doctors, departments, testimonials).
export function initials(name) {
  if (!name) return ''
  const cleaned = name.replace(/^Dr\.?\s*/i, '').trim()
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
