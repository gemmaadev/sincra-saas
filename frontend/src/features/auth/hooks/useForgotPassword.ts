import { useMutation } from '@tanstack/react-query'
import { api, ApiError } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'

export function useForgotPassword() {
  const mutation = useMutation({
    mutationFn: (email: string) => api.post<SuccessResponse>('/auth/forgot-password', { email }),
  })

  const requestPasswordReset = (email: string): Promise<boolean> =>
    mutation.mutateAsync(email).then(
      () => true,
      () => false,
    )

  const error = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : 'No se ha podido enviar el enlace. Inténtalo de nuevo.'
    : null

  return { requestPasswordReset, isSubmitting: mutation.isPending, error }
}
