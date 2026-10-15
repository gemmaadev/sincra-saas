import type { Role, UserStatus } from '../../generated/prisma/client'

export interface InviteBody {
  email: string
  name: string
}

export interface AcceptInviteBody {
  token: string
  newPassword?: string
}

export interface UpdateMemberStatusBody {
  status: 'ACTIVE' | 'INACTIVE'
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
}
