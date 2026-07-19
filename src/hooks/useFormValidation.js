import { useState, useCallback } from 'react'

export function useFormValidation(rules) {
  const [errors, setErrors] = useState({})

  const validate = useCallback(
    (values) => {
      const newErrors = {}
      for (const [field, fieldValidators] of Object.entries(rules)) {
        const value = values[field]
        for (const validator of fieldValidators) {
          const error = validator(value, values)
          if (error) {
            newErrors[field] = error
            break
          }
        }
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [rules]
  )

  const clearErrors = useCallback(() => setErrors({}), [])

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const setFieldError = useCallback((field, msg) => {
    setErrors((prev) => (prev[field] === msg ? prev : { ...prev, [field]: msg }))
  }, [])

  return { errors, validate, clearErrors, clearFieldError, setFieldError, setErrors }
}
