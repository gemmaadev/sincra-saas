import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { CreateTagInput, CreateTagResponse } from '../types/tag.types'

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTagInput) => {
      const { tag } = await api.post<CreateTagResponse>('/tags', input)
      return tag
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}
