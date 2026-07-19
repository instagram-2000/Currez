function EmergencyBar({ config }) {
  const { emergency } = config
  if (!emergency?.enabled || !emergency?.phone) return null

  return (
    <div
      className="border-b border-white/10 px-6 py-2 text-center text-xs text-white/90 md:px-12"
      style={{ backgroundColor: 'var(--tenant-primary)' }}
    >
      📞 Emergency? Call{' '}
      <a href={`tel:${emergency.phone.replace(/\s+/g, '')}`} className="font-semibold underline">
        {emergency.phone}
      </a>{' '}
      — available 24/7
    </div>
  )
}

export default EmergencyBar
