import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { UserBusinessesResponse } from '../types/business.types'

export function useUserBusinesses() {
  return useQuery({
    queryKey: ['user-businesses'],
    queryFn: async () => {
      const { businesses } = await api.get<UserBusinessesResponse>('/users/me/businesses')
      return businesses
    },
  })
}
