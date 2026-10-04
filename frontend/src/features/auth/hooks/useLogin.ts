import { useMutation } from '@tanstack/react-query'
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
  const { login } = useAuth()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      api.post<LoginResponse>('/auth/login', credentials),
    onSuccess: async (data) => {
      if (data.needsBusinessSelection) {
        navigate('/select-business')
        return
      }
      await login()
      navigate('/inbox')
    },
  })

  const submitLogin = (credentials: LoginCredentials): Promise<boolean> =>
    mutation.mutateAsync(credentials).then(
      () => true,
      () => false,
    )

  const error = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : 'No se pudo iniciar sesión. Inténtalo de nuevo.'
    : null

  return { submitLogin, isSubmitting: mutation.isPending, error }
}
