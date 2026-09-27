import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { api, ApiError } from '@/shared/services'
import { useAuth } from './useAuth'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  needsBusinessSelection: boolean
}

export function useLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submitLogin = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setError(null)
      setIsSubmitting(true)

      try {
        const data = await api.post<LoginResponse>('/auth/login', credentials)

        if (data.needsBusinessSelection) {
          navigate('/select-business')
        } else {
          await login()
          navigate('/inbox')
        }
        return true
      } catch (error) {
        setError(
          error instanceof ApiError
            ? error.message
            : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
        )
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [login, navigate],
  )

  return { submitLogin, isSubmitting, error }
}
