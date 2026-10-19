export type TeamRole = 'ADMIN' | 'EMPLOYEE'
export type TeamMemberStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  status: TeamMemberStatus
}

export interface TeamResponse {
  members: TeamMember[]
}

export interface InviteMemberFormValues {
  name: string
  email: string
}

export type ToggleableMemberStatus = Extract<TeamMemberStatus, 'ACTIVE' | 'INACTIVE'>
