import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { NotificationPrefs, Profile } from './useProfile'

interface UpdateProfileInput {
  name?: string
  avatarUrl?: string
  phone?: string
  notificationPrefs?: NotificationPrefs
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { user } = await api.patch<{ user: Profile }>('/user/profile', input)
      return user
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile)
    },
  })
}
