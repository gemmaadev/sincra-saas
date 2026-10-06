import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { Tag } from '../types/tag.types'

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { tags } = await api.get<{ tags: Tag[] }>('/tags')
      return tags
    },
  })
}
