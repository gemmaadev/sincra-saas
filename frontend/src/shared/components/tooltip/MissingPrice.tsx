import { Tooltip } from '@mantine/core'
import { CircleAlert } from 'lucide-react'

const MISSING_PRICE_LABEL = 'Precio aún no definido'

export function MissingPrice() {
  return (
    <Tooltip label={MISSING_PRICE_LABEL} withArrow position="top">
      <span
        tabIndex={0}
        aria-label={MISSING_PRICE_LABEL}
        className="inline-flex cursor-help text-warning"
      >
        <CircleAlert size={16} aria-hidden="true" />
      </span>
    </Tooltip>
  )
}
