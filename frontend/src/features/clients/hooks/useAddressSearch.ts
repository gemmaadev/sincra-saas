import { useMutation } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { AddressCandidate } from '../types/client.types'

export function useAddressSearch() {
  return useMutation({
    mutationFn: async (query: string) => {
      const { candidates } = await api.get<{ candidates: AddressCandidate[] }>(
        `/clients/address-search?q=${encodeURIComponent(query)}`,
      )
      return candidates
    },
  })
}
