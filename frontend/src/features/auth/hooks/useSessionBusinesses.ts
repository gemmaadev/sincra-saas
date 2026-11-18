import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { useAuth } from './useAuth'
import type { UserBusinessesResponse } from '../types/business.types'

export function useSessionBusinesses() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['session-businesses'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { businesses } = await api.get<UserBusinessesResponse>('/auth/me/businesses')
      return businesses
    },
  })
}
