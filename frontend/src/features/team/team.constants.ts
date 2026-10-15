import type { TeamMemberStatus, TeamRole } from './types/team.types'

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  ADMIN: 'Administrador',
  EMPLOYEE: 'Empleado',
}

export const TEAM_STATUS_LABELS: Record<TeamMemberStatus, string> = {
  ACTIVE: 'Activo',
  PENDING: 'Pendiente',
  INACTIVE: 'Inactivo',
}
