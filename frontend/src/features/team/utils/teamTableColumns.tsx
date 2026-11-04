import { Ban, RotateCcw, Send } from 'lucide-react'
import { Tooltip } from '@mantine/core'
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

interface TeamTableColumnsOptions {
  isAdmin: boolean
  currentUserId: string
  isOnlyAdmin: boolean
  onDeactivate: (member: TeamMember) => void
  onReactivate: (member: TeamMember) => void
  onResendInvite: (member: TeamMember) => void
}

export function buildTeamTableColumns({
  isAdmin,
  currentUserId,
  isOnlyAdmin,
  onDeactivate,
  onReactivate,
  onResendInvite,
}: TeamTableColumnsOptions): Column<TeamMember>[] {
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
      render: (member: TeamMember) => {
        if (member.status === 'PENDING') {
          return (
            <SincraButton variant="secondary" size="sm" onClick={() => onResendInvite(member)}>
              <Send size={14} aria-hidden="true" />
              Reenviar invitación
            </SincraButton>
          )
        }

        if (member.status === 'ACTIVE') {
          const isSelfOnlyAdmin = member.id === currentUserId && isOnlyAdmin
          const button = (
            <SincraButton
              variant="dangerOutline"
              size="sm"
              disabled={isSelfOnlyAdmin}
              onClick={() => onDeactivate(member)}
            >
              <Ban size={14} aria-hidden="true" />
              Desactivar
            </SincraButton>
          )

          return isSelfOnlyAdmin ? (
            <Tooltip label="Eres el único administrador del negocio" withArrow position="top">
              <span>{button}</span>
            </Tooltip>
          ) : (
            button
          )
        }

        return (
          <SincraButton variant="secondary" size="sm" onClick={() => onReactivate(member)}>
            <RotateCcw size={14} aria-hidden="true" />
            Reactivar
          </SincraButton>
        )
      },
    })
  }

  return columns
}
