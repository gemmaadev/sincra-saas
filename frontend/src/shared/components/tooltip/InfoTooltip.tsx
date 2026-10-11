import { Tooltip } from '@mantine/core'
import { Info } from 'lucide-react'

interface InfoTooltipProps {
  label: string
}

export function InfoTooltip({ label }: InfoTooltipProps) {
  return (
    <Tooltip label={label} withArrow position="top">
      <Info size={13} className="text-ink-muted" aria-hidden="true" />
    </Tooltip>
  )
}
