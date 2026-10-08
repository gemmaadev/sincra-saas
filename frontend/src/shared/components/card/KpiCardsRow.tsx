import { KpiCard } from './KpiCard'
import type { KpiCardProps } from './KpiCard'

const GRID_COLS_BY_COUNT: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
}

interface KpiCardsRowProps {
  cards: KpiCardProps[]
}

export function KpiCardsRow({ cards }: KpiCardsRowProps) {
  const gridColsClass = GRID_COLS_BY_COUNT[cards.length] ?? 'md:grid-cols-4'

  return (
    <div className={`grid grid-cols-2 gap-4 ${gridColsClass}`}>
      {cards.map((card, index) => (
        <KpiCard key={index} {...card} />
      ))}
    </div>
  )
}
