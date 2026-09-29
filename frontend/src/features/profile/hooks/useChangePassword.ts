import { useMutation } from '@tanstack/react-query'
import { api } from '@/shared/services'

interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      api.patch<{ success: boolean }>('/user/password', input),
  })
}
