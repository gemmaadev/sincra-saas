import { useMutation } from '@tanstack/react-query'
import { api, ApiError } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'

interface AcceptInviteInput {
  token: string
  newPassword: string
}

export function useAcceptInvite() {
  const mutation = useMutation({
    mutationFn: (input: AcceptInviteInput) =>
      api.post<SuccessResponse>('/team/accept-invite', input),
  })

  const acceptInvite = (token: string, newPassword: string): Promise<boolean> =>
    mutation.mutateAsync({ token, newPassword }).then(
      () => true,
      () => false,
    )

  const error = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : 'No se pudo aceptar la invitación. Inténtalo de nuevo.'
    : null

  return { acceptInvite, isSubmitting: mutation.isPending, error }
}
