import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { ConnectedChannelStatus } from '../types/settings.types'

export function useConnectedChannels() {
  return useQuery({
    queryKey: ['settings', 'channels'],
    queryFn: async () => {
      const { channels } = await api.get<{ channels: ConnectedChannelStatus[] }>(
        '/settings/channels',
      )
      return channels
    },
  })
}
