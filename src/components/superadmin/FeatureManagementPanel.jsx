import { useState } from 'react'
import { FEATURE_REGISTRY } from '../../config/featureRegistry'
import { setHospitalFeatureEnabled, isFeatureEnabled } from '../../firebase/hospitalFeatures'
import { useAuth } from '../../contexts/AuthContext'

// Renders one toggle row per FEATURE_REGISTRY entry — a new module needs no
// changes here, it just shows up the moment it's added to the registry.
function FeatureManagementPanel({ hospitalId, features }) {
  const { user } = useAuth()
  const [pendingKey, setPendingKey] = useState(null)
  const [error, setError] = useState('')

  async function toggle(feature, nextEnabled) {
    setPendingKey(feature.key)
    setError('')
    try {
      await setHospitalFeatureEnabled(hospitalId, feature.key, nextEnabled, user?.email)
    } catch (err) {
      setError(err.message)
    } finally {
      setPendingKey(null)
    }
  }

  return (
    <section>
      <p className="text-sm text-muted">
        Controls which modules appear in {hospitalId}'s staff dashboard. Core modules are always on;
        optional modules stay off until switched on here.
      </p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-card">
        <table className="min-w-full divide-y divide-line text-sm">
          <tbody className="divide-y divide-line">
            {FEATURE_REGISTRY.map((feature) => {
              const enabled = isFeatureEnabled(features, feature.key)
              const disabled = feature.isCore || pendingKey === feature.key
              return (
                <tr key={feature.key}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-heading">{feature.label}</div>
                    {feature.description && (
                      <div className="text-xs text-faint">{feature.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => toggle(feature, !enabled)}
                      aria-pressed={enabled}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        enabled
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                          : 'bg-card-strong text-faint'
                      }`}
                    >
                      {feature.isCore ? 'Always on' : enabled ? 'ON' : 'OFF'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </section>
  )
}

export default FeatureManagementPanel
