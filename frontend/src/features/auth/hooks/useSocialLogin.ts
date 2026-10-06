import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { api, ApiError } from '@/shared/services'
import { useAuth } from './useAuth'

interface SocialLoginResponse {
  needsOnboarding: boolean
  needsBusinessSelection: boolean
}

export function useSocialLogin() {
  const [externalError, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const mutation = useMutation({
    mutationFn: (accessToken: string) =>
      api.post<SocialLoginResponse>('/auth/google', { accessToken }),
    onSuccess: async (response) => {
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
  })

  const loginWithGoogle = async (accessToken: string): Promise<void> => {
    setError(null)
    await mutation.mutateAsync(accessToken).catch(() => undefined)
  }

  const mutationError = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.'
    : null

  return {
    loginWithGoogle,
    isSubmitting: mutation.isPending,
    error: externalError ?? mutationError,
    setError,
  }
}
