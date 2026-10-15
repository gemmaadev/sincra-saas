import { KpiCardsRow } from '@/shared/components'
import { useTeam } from '@/features/team/hooks/useTeam'
import { useTeamFilters } from '@/features/team/hooks/useTeamFilters'
import { buildTeamKpiCards } from '@/features/team/utils/buildTeamKpiCards'
import { TeamFilterBar } from '@/features/team/components/TeamFilterBar'

export default function TeamPage() {
  const { data } = useTeam()
  const { search, setSearch, role, setRole, status, setStatus } = useTeamFilters(data?.members)

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
    </div>
  )
}
