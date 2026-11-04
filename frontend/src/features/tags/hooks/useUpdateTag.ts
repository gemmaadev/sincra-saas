import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { Tag } from '../types/tag.types'

interface UpdateTagInput {
  id: string
  name?: string
  color?: string
}

export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTagInput) => {
      const { tag } = await api.patch<{ tag: Tag }>(`/tags/${id}`, input)
      return tag
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}
