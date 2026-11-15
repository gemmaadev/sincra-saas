import { Tooltip } from '@mantine/core'
import { CircleAlert } from 'lucide-react'

const MISSING_PRICE_LABEL = 'Precio aún no definido'

export function MissingPrice({ label = MISSING_PRICE_LABEL }: { label?: string }) {
  return (
    <Tooltip label={label} withArrow position="top">
      <span tabIndex={0} aria-label={label} className="inline-flex cursor-help text-warning">
        <CircleAlert size={16} aria-hidden="true" />
      </span>
    </Tooltip>
  )
}
