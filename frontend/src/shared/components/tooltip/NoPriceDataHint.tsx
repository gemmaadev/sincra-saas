import { Tooltip } from '@mantine/core'
import { Info } from 'lucide-react'

export const NO_PRICE_DATA_LABEL = 'Sin datos de precio en ningún pedido'

export function NoPriceDataHint() {
  return (
    <Tooltip label={NO_PRICE_DATA_LABEL} withArrow position="top">
      <span
        tabIndex={0}
        aria-label={NO_PRICE_DATA_LABEL}
        className="inline-flex cursor-help text-ink-muted"
      >
        <Info size={14} aria-hidden="true" />
      </span>
    </Tooltip>
  )
}
