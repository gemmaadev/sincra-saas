import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { ClientDetailResponse } from '../types/client.types'

export function useClientDetail(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { client } = await api.get<ClientDetailResponse>(`/clients/${id}`)
      return client
    },
  })
}
