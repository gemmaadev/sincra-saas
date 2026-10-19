import { Search } from 'lucide-react'
import { Input, Select } from '@/shared/components'
import { TEAM_ROLE_LABELS, TEAM_STATUS_LABELS } from '../team.constants'
import type { TeamMemberStatus, TeamRole } from '../types/team.types'

const ROLE_OPTIONS = Object.entries(TEAM_ROLE_LABELS).map(([value, label]) => ({ value, label }))
const STATUS_OPTIONS = Object.entries(TEAM_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

interface TeamFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  role: TeamRole | ''
  onRoleChange: (value: TeamRole | '') => void
  status: TeamMemberStatus | ''
  onStatusChange: (value: TeamMemberStatus | '') => void
}

export function TeamFilterBar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
}: TeamFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-60 flex-1">
        <Input
          label="Buscar"
          placeholder="Buscar miembro..."
          icon={<Search size={16} aria-hidden="true" />}
          size="sm"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="w-48">
        <Select
          id="team-filter-role"
          label="Rol"
          placeholder="Todos los roles"
          options={ROLE_OPTIONS}
          size="sm"
          value={role}
          onChange={(event) => onRoleChange(event.target.value as TeamRole | '')}
        />
      </div>
      <div className="w-48">
        <Select
          id="team-filter-status"
          label="Estado"
          placeholder="Todos los estados"
          options={STATUS_OPTIONS}
          size="sm"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as TeamMemberStatus | '')}
        />
      </div>
    </div>
  )
}
