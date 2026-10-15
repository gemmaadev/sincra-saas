import { EmptyState, KpiCardsRow, Table } from '@/shared/components'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useTeam } from '@/features/team/hooks/useTeam'
import { useTeamFilters } from '@/features/team/hooks/useTeamFilters'
import { buildTeamKpiCards } from '@/features/team/utils/buildTeamKpiCards'
import { buildTeamTableColumns } from '@/features/team/utils/teamTableColumns'
import { TeamFilterBar } from '@/features/team/components/TeamFilterBar'
import { TeamTableSkeleton } from '@/features/team/components/TeamTableSkeleton'

export default function TeamPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const { data, isLoading, isError } = useTeam()
  const { search, setSearch, role, setRole, status, setStatus, filteredMembers } = useTeamFilters(
    data?.members,
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Equipo</h1>
        <p className="text-sm text-ink-muted">
          Gestiona las personas que tienen acceso a Sincra y sus permisos.
        </p>
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
            columns={buildTeamTableColumns(isAdmin)}
            data={filteredMembers}
            getRowKey={(member) => member.id}
            emptyState={<EmptyState title="No se han encontrado miembros" />}
          />
        </div>
      )}
    </div>
  )
}
