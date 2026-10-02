import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'

export interface Tag {
  id: string
  name: string
  color: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  isDefault: boolean
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { tags } = await api.get<{ tags: Tag[] }>('/tags')
      return tags
    },
  })
}
