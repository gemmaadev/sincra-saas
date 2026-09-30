import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { Profile } from './useProfile'

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      const { user } = await api.upload<{ user: Profile }>('/user/avatar', formData)
      return user
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile)
    },
  })
}
