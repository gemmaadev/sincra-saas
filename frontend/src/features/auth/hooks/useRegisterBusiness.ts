import { useState } from 'react'
import { api, ApiError } from '@/shared/services'
import { getRegisterCredentials, clearRegisterCredentials } from '../utils/registerCredentials'
import type { OnboardingData } from '@/features/onboarding/onboarding.types'

export function useRegisterBusiness() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerBusiness = async (data: OnboardingData): Promise<boolean> => {
    setError(null)
    setIsSubmitting(true)

    try {
      const credentials = getRegisterCredentials()
      if (!credentials) {
        setError('No encontramos tus datos de registro. Vuelve a crear la cuenta.')
        return false
      }

      await api.post('/auth/register', {
        ...credentials,
        businessName: data.businessName,
        sector: data.sector,
        description: data.description,
        country: data.country,
      })

      clearRegisterCredentials()
      return true
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === 'EMAIL_TAKEN'
          ? 'Ya existe una cuenta con este email.'
          : 'No se pudo crear tu cuenta. Inténtalo de nuevo.',
      )
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { registerBusiness, isSubmitting, error }
}
