import { Shield, User } from 'lucide-react'
import type { BadgeColor } from '@/shared/components'
import type { TeamMemberStatus, TeamRole } from './types/team.types'

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  ADMIN: 'Administrador',
  EMPLOYEE: 'Empleado',
}

export const TEAM_ROLE_COLORS: Record<TeamRole, BadgeColor> = {
  ADMIN: 'primary',
  EMPLOYEE: 'success',
}

export const TEAM_ROLE_ICONS: Record<TeamRole, typeof Shield> = {
  ADMIN: Shield,
  EMPLOYEE: User,
}

export const TEAM_STATUS_LABELS: Record<TeamMemberStatus, string> = {
  ACTIVE: 'Activo',
  PENDING: 'Pendiente',
  INACTIVE: 'Inactivo',
}

export const TEAM_STATUS_COLORS: Record<TeamMemberStatus, BadgeColor> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  INACTIVE: 'neutral',
}
