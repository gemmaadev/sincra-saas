import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'

export interface NotificationPrefs {
  newOrders?: boolean
  unansweredCommunications?: boolean
  followUpTasks?: boolean
  weeklyDigest?: boolean
}

export interface Profile {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'EMPLOYEE'
  avatarUrl: string | null
  phone: string | null
  notificationPrefs: NotificationPrefs | null
  createdAt: string
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { user } = await api.get<{ user: Profile }>('/user/profile')
      return user
    },
  })
}
