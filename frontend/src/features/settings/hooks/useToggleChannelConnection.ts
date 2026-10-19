import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { Channel } from '@/shared/types'

interface ToggleChannelConnectionInput {
  channel: Channel
  connect: boolean
}

export function useToggleChannelConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ channel, connect }: ToggleChannelConnectionInput) =>
      api.post(connect ? '/channels/connect' : '/channels/disconnect', { channel }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'channels'] }),
  })
}
