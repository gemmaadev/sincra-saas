import { useMemo, useState } from 'react'
import type { TeamMember, TeamMemberStatus, TeamRole } from '../types/team.types'

export function useTeamFilters(members: TeamMember[] | undefined) {
  const [search, setSearch] = useState<string>('')
  const [role, setRole] = useState<TeamRole | ''>('')
  const [status, setStatus] = useState<TeamMemberStatus | ''>('')

  const filteredMembers = useMemo(() => {
    if (!members) return []

    const normalizedSearch = search.trim().toLowerCase()

    return members.filter((member) => {
      const matchesSearch =
        normalizedSearch === '' ||
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch)
      const matchesRole = role === '' || member.role === role
      const matchesStatus = status === '' || member.status === status

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [members, search, role, status])

  return {
    search,
    setSearch,
    role,
    setRole,
    status,
    setStatus,
    filteredMembers,
  }
}
