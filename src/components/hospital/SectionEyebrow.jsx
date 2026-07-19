function SectionEyebrow({ children }) {
  return (
    <p
      className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest"
      style={{ color: 'var(--tenant-primary)' }}
    >
      <span className="h-px w-6" style={{ backgroundColor: 'var(--tenant-primary)' }} />
      {children}
    </p>
  )
}

export default SectionEyebrow
