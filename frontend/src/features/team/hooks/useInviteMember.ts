import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { InviteMemberFormValues } from '../types/team.types'

export function useInviteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: InviteMemberFormValues) =>
      api.post<{ success: true }>('/team/invite', values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] }),
  })
}
