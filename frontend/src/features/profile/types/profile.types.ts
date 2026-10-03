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
