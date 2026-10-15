import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { ToggleableMemberStatus } from '../types/team.types'

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: ToggleableMemberStatus }) =>
      api.patch<{ success: true }>(`/team/${userId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] }),
  })
}
