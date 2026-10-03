import type { Prisma } from '../../generated/prisma/client'

export interface NotificationPrefs {
  newOrders?: boolean
  unansweredCommunications?: boolean
  followUpTasks?: boolean
  weeklyDigest?: boolean
}

export interface UpdateProfileInput {
  name?: string
  avatarUrl?: string
  phone?: string
  notificationPrefs?: NotificationPrefs
}

export interface ChangePasswordBody {
  currentPassword: string
  newPassword: string
}

export type MembershipWithUser = Prisma.BusinessMemberGetPayload<{ include: { user: true } }>

export interface ProfileResponse {
  id: string
  name: string
  email: string
  role: string
  avatarUrl: string | null
  phone: string | null
  notificationPrefs: unknown
  createdAt: Date
}
