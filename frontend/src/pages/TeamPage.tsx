import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { EmptyState, KpiCardsRow, SincraButton, Table } from '@/shared/components'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { notifySuccess } from '@/shared/utils/notify'
import { useTeam } from '@/features/team/hooks/useTeam'
import { useTeamFilters } from '@/features/team/hooks/useTeamFilters'
import { useUpdateMemberStatus } from '@/features/team/hooks/useUpdateMemberStatus'
import { buildTeamKpiCards } from '@/features/team/utils/buildTeamKpiCards'
import { buildTeamTableColumns } from '@/features/team/utils/teamTableColumns'
import { TeamFilterBar } from '@/features/team/components/TeamFilterBar'
import { TeamTableSkeleton } from '@/features/team/components/TeamTableSkeleton'
import { InviteMemberModal } from '@/features/team/components/InviteMemberModal'
import { DeactivateMemberModal } from '@/features/team/components/DeactivateMemberModal'
import type { TeamMember } from '@/features/team/types/team.types'

export default function TeamPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const { data, isLoading, isError } = useTeam()
  const { search, setSearch, role, setRole, status, setStatus, filteredMembers } = useTeamFilters(
    data?.members,
  )
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [memberToDeactivate, setMemberToDeactivate] = useState<TeamMember | null>(null)
  const reactivateMember = useUpdateMemberStatus()

  const adminCount = data?.members.filter((member) => member.role === 'ADMIN').length ?? 0

  function handleReactivate(member: TeamMember) {
    reactivateMember.mutate(
      { userId: member.id, status: 'ACTIVE' },
      { onSuccess: () => notifySuccess('Acceso reactivado') },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Equipo</h1>
          <p className="text-sm text-ink-muted">
            Gestiona las personas que tienen acceso a Sincra y sus permisos.
          </p>
        </div>
        {isAdmin && (
          <SincraButton
            icon={<UserPlus size={16} aria-hidden="true" />}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invitar empleado
          </SincraButton>
        )}
      </div>

      <KpiCardsRow cards={buildTeamKpiCards(data?.members ?? null)} />

      <TeamFilterBar
        search={search}
        onSearchChange={setSearch}
        role={role}
        onRoleChange={setRole}
        status={status}
        onStatusChange={setStatus}
      />

      {isLoading && <TeamTableSkeleton />}
      {isError && <p className="text-error">No se ha podido cargar el equipo.</p>}
      {!isLoading && !isError && (
        <div className="overflow-x-auto">
          <Table
            columns={buildTeamTableColumns({
              isAdmin,
              currentUserId: user?.id ?? '',
              isOnlyAdmin: adminCount <= 1,
              onDeactivate: setMemberToDeactivate,
              onReactivate: handleReactivate,
            })}
            data={filteredMembers}
            getRowKey={(member) => member.id}
            emptyState={<EmptyState title="No se han encontrado miembros" />}
          />
        </div>
      )}

      {isAdmin && (
        <InviteMemberModal opened={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
      )}

      {memberToDeactivate && (
        <DeactivateMemberModal
          member={memberToDeactivate}
          opened={!!memberToDeactivate}
          onClose={() => setMemberToDeactivate(null)}
        />
      )}
    </div>
  )
}
