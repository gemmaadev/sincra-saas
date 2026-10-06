import { useMutation } from '@tanstack/react-query'
import { api, ApiError } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'
import { getRegisterCredentials, clearRegisterCredentials } from '../utils/registerCredentials'
import { useAuth } from './useAuth'
import type { OnboardingData } from '@/features/onboarding/onboarding.types'

export function useRegisterBusiness() {
  const { login } = useAuth()

  const mutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
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
    },
  })

  const registerBusiness = (data: OnboardingData): Promise<boolean> =>
    mutation.mutateAsync(data).then(
      () => true,
      () => false,
    )

  const error = mutation.error
    ? mutation.error instanceof ApiError && mutation.error.code === 'EMAIL_TAKEN'
      ? 'Ya existe una cuenta con este email.'
      : 'No se pudo crear tu cuenta. Inténtalo de nuevo.'
    : null

  return { registerBusiness, isSubmitting: mutation.isPending, error }
}
