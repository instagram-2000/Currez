import { useFeatures } from '../contexts/FeatureContext'

// Component-level convenience for conditional rendering, e.g.:
//   const { enabled } = useFeature('chatbot')
//   if (!enabled) return null
export function useFeature(key) {
  const { isFeatureEnabled, loading } = useFeatures()
  return { enabled: isFeatureEnabled(key), loading }
}
