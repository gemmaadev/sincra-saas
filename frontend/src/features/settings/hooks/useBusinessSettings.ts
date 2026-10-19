import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { BusinessSettings } from '../types/settings.types'

export function useBusinessSettings() {
  return useQuery({
    queryKey: ['settings', 'business'],
    queryFn: async () => {
      const { business } = await api.get<{ business: BusinessSettings }>('/settings/business')
      return business
    },
  })
}
