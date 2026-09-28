import { useCallback, useState } from 'react'
import { api } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'

export function useForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requestPasswordReset = useCallback(async (email: string) => {
    setIsSubmitting(true)
    try {
      await api.post<SuccessResponse>('/auth/forgot-password', { email })
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { requestPasswordReset, isSubmitting }
}
