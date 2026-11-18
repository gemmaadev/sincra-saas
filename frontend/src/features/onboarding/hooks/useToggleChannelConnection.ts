import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { ChannelId } from '@/shared/channels/channels'
import type { Channel } from '@/shared/types'

interface ToggleChannelConnectionInput {
  channel: ChannelId
  connect: boolean
  accessToken?: string
  accountEmail?: string
}

export interface ConnectedChannelResponse {
  connectedChannel?: { accountEmail?: string | null }
}

export function useToggleChannelConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ channel, connect, accessToken, accountEmail }: ToggleChannelConnectionInput) =>
      api.post<ConnectedChannelResponse>(connect ? '/channels/connect' : '/channels/disconnect', {
        channel: channel.toUpperCase() as Channel,
        ...(accessToken ? { accessToken } : {}),
        ...(accountEmail ? { accountEmail } : {}),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'channels'] }),
  })
}
