import { useMutation } from '@tanstack/react-query'
import { api } from '@/shared/services'

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api.delete('/settings/account'),
  })
}
