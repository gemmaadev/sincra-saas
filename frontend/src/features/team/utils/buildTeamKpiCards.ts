import { Users, ShieldCheck, User } from 'lucide-react'
import type { KpiCardProps } from '@/shared/components'
import type { TeamMember } from '../types/team.types'

export function buildTeamKpiCards(members: TeamMember[] | null): KpiCardProps[] {
  if (!members) {
    return [
      { icon: Users, label: 'Miembros', value: '', pending: true },
      { icon: ShieldCheck, label: 'Administradores', value: '', pending: true },
      { icon: User, label: 'Empleados', value: '', pending: true },
    ]
  }

  const adminCount = members.filter((member) => member.role === 'ADMIN').length
  const employeeCount = members.filter((member) => member.role === 'EMPLOYEE').length

  return [
    { icon: Users, label: 'Miembros', value: String(members.length) },
    { icon: ShieldCheck, label: 'Administradores', value: String(adminCount) },
    { icon: User, label: 'Empleados', value: String(employeeCount) },
  ]
}
