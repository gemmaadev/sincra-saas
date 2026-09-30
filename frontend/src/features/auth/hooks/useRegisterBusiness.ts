import { useCallback, useState } from 'react'
import { api, ApiError } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'
import { getRegisterCredentials, clearRegisterCredentials } from '../utils/registerCredentials'
import { useAuth } from './useAuth'
import type { OnboardingData } from '@/features/onboarding/onboarding.types'

export function useRegisterBusiness() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()

  const registerBusiness = useCallback(
    async (data: OnboardingData): Promise<boolean> => {
      setError(null)
      setIsSubmitting(true)

      try {
        const credentials = getRegisterCredentials()

        const businessData = {
          businessName: data.businessName,
          sector: data.sector,
          description: data.description,
          country: data.country,
        }

        if (credentials) {
          // Credentials flow: creates User + Business together
          await api.post<SuccessResponse>('/auth/register', {
            ...credentials,
            ...businessData,
          })
          clearRegisterCredentials()
        } else {
          // Social login flow: User already exists, only Business is missing
          await api.post<SuccessResponse>('/onboarding/complete', businessData)
        }

        await login()
        return true
      } catch (error) {
        setError(
          error instanceof ApiError && error.code === 'EMAIL_TAKEN'
            ? 'Ya existe una cuenta con este email.'
            : 'No se pudo crear tu cuenta. Inténtalo de nuevo.',
        )
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [login],
  )

  return { registerBusiness, isSubmitting, error }
}
