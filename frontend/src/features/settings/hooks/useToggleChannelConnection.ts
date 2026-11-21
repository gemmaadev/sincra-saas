import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { Channel } from '@/shared/types'
import type { ConnectedChannelMutationResult } from '../types/settings.types'

interface ToggleChannelConnectionInput {
  channel: Channel
  connect: boolean
  accessToken?: string
  accountEmail?: string
}

export function useToggleChannelConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ channel, connect, accessToken, accountEmail }: ToggleChannelConnectionInput) =>
      api.post<ConnectedChannelMutationResult>(
        connect ? '/channels/connect' : '/channels/disconnect',
        {
          channel,
          ...(accessToken ? { accessToken } : {}),
          ...(accountEmail ? { accountEmail } : {}),
        },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'channels'] }),
  })
}
