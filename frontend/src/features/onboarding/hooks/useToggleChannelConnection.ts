import { useMutation } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { ChannelId } from '@/shared/channels/channels'
import type { Channel } from '@/shared/types'

interface ToggleChannelConnectionInput {
  channel: ChannelId
  connect: boolean
  accessToken?: string
}

export function useToggleChannelConnection() {
  return useMutation({
    mutationFn: ({ channel, connect, accessToken }: ToggleChannelConnectionInput) =>
      api.post(connect ? '/channels/connect' : '/channels/disconnect', {
        channel: channel.toUpperCase() as Channel,
        ...(accessToken ? { accessToken } : {}),
      }),
  })
}
