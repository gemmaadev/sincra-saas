import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { api, ApiError } from '@/shared/services'
import { useAuth } from './useAuth'

interface SocialLoginResponse {
  needsOnboarding: boolean
  needsBusinessSelection: boolean
}

export function useSocialLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleResponse = useCallback(
    async (response: SocialLoginResponse) => {
      if (response.needsOnboarding) {
        navigate('/onboarding')
        return
      }

      if (response.needsBusinessSelection) {
        navigate('/select-business')
        return
      }

      await login()
      navigate('/inbox')
    },
    [login, navigate],
  )

  const loginWithGoogle = useCallback(
    async (accessToken: string) => {
      setError(null)
      setIsSubmitting(true)
      try {
        const response = await api.post<SocialLoginResponse>('/auth/google', { accessToken })
        await handleResponse(response)
      } catch (error) {
        setError(
          error instanceof ApiError
            ? error.message
            : 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.',
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [handleResponse],
  )

  return { loginWithGoogle, isSubmitting, error, setError }
}
