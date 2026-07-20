import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './config'
import { FEATURE_REGISTRY, isCoreFeature } from '../config/featureRegistry'

const HOSPITAL_FEATURES_COLLECTION = 'hospitalFeatures'

// Fills in every non-core registry key with its default so callers never
// have to special-case a hospital that predates a given module (same
// forward-compatible-defaults approach as normalizeHospital in
// firebase/hospitals.js).
function withDefaults(features = {}) {
  const defaults = Object.fromEntries(
    FEATURE_REGISTRY.filter((feature) => !feature.isCore).map((feature) => [
      feature.key,
      feature.defaultEnabled ?? false,
    ])
  )
  return { ...defaults, ...features }
}

// Core features are always on — never trust a stored value for one, in
// case a bad write ever set one to false.
export function isFeatureEnabled(features, key) {
  if (isCoreFeature(key)) return true
  return features?.[key] === true
}

export function subscribeToHospitalFeatures(hospitalId, callback) {
  return onSnapshot(doc(db, HOSPITAL_FEATURES_COLLECTION, hospitalId), (snapshot) => {
    callback(withDefaults(snapshot.exists() ? snapshot.data().features : undefined))
  })
}

export async function getHospitalFeatures(hospitalId) {
  const snapshot = await getDoc(doc(db, HOSPITAL_FEATURES_COLLECTION, hospitalId))
  return withDefaults(snapshot.exists() ? snapshot.data().features : undefined)
}

export async function setHospitalFeatureEnabled(hospitalId, featureKey, enabled, updatedBy) {
  if (isCoreFeature(featureKey)) {
    throw new Error(`"${featureKey}" is a core feature and can't be disabled.`)
  }

  const ref = doc(db, HOSPITAL_FEATURES_COLLECTION, hospitalId)
  const snapshot = await getDoc(ref)

  if (snapshot.exists()) {
    await updateDoc(ref, {
      [`features.${featureKey}`]: enabled,
      updatedAt: serverTimestamp(),
      updatedBy: updatedBy ?? null,
    })
  } else {
    await setDoc(ref, {
      hospitalId,
      features: { [featureKey]: enabled },
      updatedAt: serverTimestamp(),
      updatedBy: updatedBy ?? null,
    })
  }
}
