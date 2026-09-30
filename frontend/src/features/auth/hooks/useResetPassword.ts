import { useCallback, useState } from 'react'
import { api, ApiError } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'

export function useResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<boolean> => {
      setError(null)
      setIsSubmitting(true)
      try {
        await api.post<SuccessResponse>('/auth/reset-password', { token, newPassword })
        return true
      } catch (error) {
        setError(
          error instanceof ApiError
            ? 'Este enlace no es válido o ha caducado. Solicita uno nuevo.'
            : 'No se pudo restablecer la contraseña. Inténtalo de nuevo.',
        )
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [],
  )

  return { resetPassword, isSubmitting, error }
}
