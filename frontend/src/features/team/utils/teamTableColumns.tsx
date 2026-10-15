import { Pencil, Trash2 } from 'lucide-react'
import { Avatar, Badge, SincraButton } from '@/shared/components'
import type { Column } from '@/shared/components'
import {
  TEAM_ROLE_COLORS,
  TEAM_ROLE_ICONS,
  TEAM_ROLE_LABELS,
  TEAM_STATUS_COLORS,
  TEAM_STATUS_LABELS,
} from '../team.constants'
import type { TeamMember } from '../types/team.types'

export function buildTeamTableColumns(isAdmin: boolean): Column<TeamMember>[] {
  const columns: Column<TeamMember>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (member: TeamMember) => (
        <div className="flex items-center gap-3">
          <Avatar name={member.name} size="md" />
          <div className="flex flex-col">
            <span className="font-medium text-ink">{member.name}</span>
            <span className="text-sm text-ink-muted">{member.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (member: TeamMember) => (
        <Badge color={TEAM_ROLE_COLORS[member.role]} icon={TEAM_ROLE_ICONS[member.role]}>
          {TEAM_ROLE_LABELS[member.role]}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (member: TeamMember) => (
        <Badge color={TEAM_STATUS_COLORS[member.status]}>{TEAM_STATUS_LABELS[member.status]}</Badge>
      ),
    },
    {
      key: 'lastActivity',
      header: 'Última actividad',
      render: () => <span className="text-sm text-ink-muted">—</span>,
    },
  ]

  if (isAdmin) {
    columns.push({
      key: 'actions',
      header: 'Acciones',
      render: () => (
        <div className="flex items-center gap-2">
          <SincraButton variant="secondary" size="sm" disabled>
            <Pencil size={14} aria-hidden="true" />
            Editar
          </SincraButton>
          <SincraButton variant="dangerOutline" size="sm" disabled>
            <Trash2 size={14} aria-hidden="true" />
          </SincraButton>
        </div>
      ),
    })
  }

  return columns
}
