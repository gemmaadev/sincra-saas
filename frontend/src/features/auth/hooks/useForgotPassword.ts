import { useMutation } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'

export function useForgotPassword() {
  const mutation = useMutation({
    mutationFn: (email: string) => api.post<SuccessResponse>('/auth/forgot-password', { email }),
  })

  return { requestPasswordReset: mutation.mutateAsync, isSubmitting: mutation.isPending }
}
