// Literal bed glyph (headboard + pillow + mattress + legs) used across the
// occupancy map so a bed reads as a bed, not a generic chip — the same
// stroke-icon convention as NavIcon.jsx, colored via currentColor so callers
// just set a text-* color class per status.
function BedIcon({ status = 'vacant', className = 'h-6 w-6' }) {
  const filled = status === 'occupied'
  const dashed = status === 'maintenance'

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 11V6.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V11" />
      <rect
        x="5"
        y="11"
        width="4.5"
        height="3"
        rx="1"
        fill={filled ? 'currentColor' : 'none'}
        fillOpacity={filled ? 0.9 : 1}
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? '2.5 2.5' : undefined}
        d="M3 18.5v-5.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5"
        fill={filled ? 'currentColor' : 'none'}
        fillOpacity={filled ? 0.14 : 0}
      />
      <path strokeLinecap="round" d="M4 18.5v2M20 18.5v2" />
    </svg>
  )
}

export default BedIcon
