import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { Profile } from '../types/profile.types'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { user } = await api.get<{ user: Profile }>('/user/profile')
      return user
    },
  })
}
