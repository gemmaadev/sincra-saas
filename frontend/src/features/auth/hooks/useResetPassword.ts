import { useMutation } from '@tanstack/react-query'
import { api, ApiError } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'

interface ResetPasswordInput {
  token: string
  newPassword: string
}

export function useResetPassword() {
  const mutation = useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      api.post<SuccessResponse>('/auth/reset-password', input),
  })

  const resetPassword = (token: string, newPassword: string): Promise<boolean> =>
    mutation.mutateAsync({ token, newPassword }).then(
      () => true,
      () => false,
    )

  const error = mutation.error
    ? mutation.error instanceof ApiError
      ? 'Este enlace no es válido o ha caducado. Solicita uno nuevo.'
      : 'No se pudo restablecer la contraseña. Inténtalo de nuevo.'
    : null

  return { resetPassword, isSubmitting: mutation.isPending, error }
}
