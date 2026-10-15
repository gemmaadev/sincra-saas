import { KpiCardsRow } from '@/shared/components'
import { useTeam } from '@/features/team/hooks/useTeam'
import { buildTeamKpiCards } from '@/features/team/utils/buildTeamKpiCards'

export default function TeamPage() {
  const { data } = useTeam()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Equipo</h1>
        <p className="text-sm text-ink-muted">
          Gestiona las personas que tienen acceso a Sincra y sus permisos.
        </p>
      </div>

      <KpiCardsRow cards={buildTeamKpiCards(data?.members ?? null)} />
    </div>
  )
}
