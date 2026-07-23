import NavIcon from '../common/NavIcon'
import { SITE_CONTAINER } from '../../utils/layout'

function EmergencyBar({ config }) {
  const { emergency } = config
  if (!emergency?.enabled || !emergency?.phone) return null

  return (
    <div className="border-b border-white/10 text-white/90" style={{ backgroundColor: 'var(--tenant-primary)' }}>
      <div className={`flex flex-wrap items-center justify-center gap-1.5 py-2 text-center text-xs ${SITE_CONTAINER}`}>
        <NavIcon name="phone" className="h-3 w-3 shrink-0" />
        Emergency? Call{' '}
        <a href={`tel:${emergency.phone.replace(/\s+/g, '')}`} className="font-semibold underline">
          {emergency.phone}
        </a>{' '}
        — available 24/7
      </div>
    </div>
  )
}

export default EmergencyBar
