import { useCallback, useState } from 'react'
import { api, ApiError } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'

export function useAcceptInvite() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const acceptInvite = useCallback(async (token: string, newPassword: string): Promise<boolean> => {
    setError(null)
    setIsSubmitting(true)
    try {
      await api.post<SuccessResponse>('/team/accept-invite', { token, newPassword })
      return true
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo aceptar la invitación. Inténtalo de nuevo.',
      )
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { acceptInvite, isSubmitting, error }
}
