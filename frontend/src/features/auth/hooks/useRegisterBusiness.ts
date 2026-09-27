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
        if (!credentials) {
          setError('No encontramos tus datos de registro. Vuelve a crear la cuenta.')
          return false
        }

        await api.post<SuccessResponse>('/auth/register', {
          ...credentials,
          businessName: data.businessName,
          sector: data.sector,
          description: data.description,
          country: data.country,
        })

        clearRegisterCredentials()
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
