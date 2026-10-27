import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'

export function useResendInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => api.post<{ success: true }>(`/team/${userId}/resend-invite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] }),
  })
}
