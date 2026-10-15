import { KpiCardsRow } from '@/shared/components'
import { useStats } from '@/features/stats/hooks/useStats'
import { useStatsFilters } from '@/features/stats/hooks/useStatsFilters'
import { StatsFilterBar } from '@/features/stats/components/StatsFilterBar'
import { StatsDonutChart } from '@/features/stats/components/StatsDonutChart'
import { StatsEvolutionChart } from '@/features/stats/components/StatsEvolutionChart'
import { StatsAiSummary } from '@/features/stats/components/StatsAiSummary'
import { StatsChannelPerformance } from '@/features/stats/components/StatsChannelPerformance'
import { buildStatsKpiCards } from '@/features/stats/utils/buildStatsKpiCards'
import { buildOrderStatusSlices } from '@/features/stats/utils/buildOrderStatusSlices'
import { buildClientTypeSlices } from '@/features/stats/utils/buildClientTypeSlices'
import { buildOrdersEvolutionChartData } from '@/features/stats/utils/buildOrdersEvolutionChartData'
import { buildChannelPerformanceRows } from '@/features/stats/utils/buildChannelPerformanceRows'

export default function StatsPage() {
  const {
    dateFrom,
    dateTo,
    granularity,
    setDateFrom,
    setDateTo,
    setGranularity,
    filters,
    isDateRangeInvalid,
  } = useStatsFilters()
  const { data: dashboard } = useStats(filters)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Estadísticas</h1>
          <p className="text-sm text-ink-muted">
            Analiza el rendimiento de tus pedidos y clientes en un solo vistazo.
          </p>
        </div>
        <StatsFilterBar
          dateFrom={dateFrom}
          dateTo={dateTo}
          isDateRangeInvalid={isDateRangeInvalid}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
      </div>

      <KpiCardsRow cards={buildStatsKpiCards(dashboard?.overview ?? null)} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatsDonutChart
          title="Pedidos por estado"
          total={dashboard?.ordersByStatus.total ?? 0}
          totalLabel="pedidos"
          slices={dashboard ? buildOrderStatusSlices(dashboard.ordersByStatus) : []}
          emptyMessage="Todavía no hay pedidos en este periodo."
        />
        <StatsDonutChart
          title="Clientes por tipo"
          total={dashboard?.clientsByType.total ?? 0}
          totalLabel="clientes"
          slices={dashboard ? buildClientTypeSlices(dashboard.clientsByType) : []}
          emptyMessage="Todavía no hay clientes en este periodo."
        />
      </div>

      <StatsEvolutionChart
        data={dashboard ? buildOrdersEvolutionChartData(dashboard.ordersEvolution) : []}
        granularity={granularity}
        onGranularityChange={setGranularity}
        infoTooltip="Todos los pedidos creados en el rango, sin importar su estado."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatsChannelPerformance
          rows={dashboard ? buildChannelPerformanceRows(dashboard.channelPerformance) : []}
        />
        <StatsAiSummary summary={dashboard?.aiSummary ?? null} />
      </div>
    </div>
  )
}
