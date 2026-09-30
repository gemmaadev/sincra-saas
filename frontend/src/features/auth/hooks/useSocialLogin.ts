import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '@/shared/services'
import { useAuth } from './useAuth'

interface SocialLoginResponse {
  needsOnboarding: boolean
  needsBusinessSelection: boolean
}

export function useSocialLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    async (idToken: string) => {
      setIsSubmitting(true)
      try {
        const response = await api.post<SocialLoginResponse>('/auth/google', { idToken })
        await handleResponse(response)
      } finally {
        setIsSubmitting(false)
      }
    },
    [handleResponse],
  )

  return { loginWithGoogle, isSubmitting }
}
