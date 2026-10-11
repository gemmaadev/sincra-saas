import { Tooltip } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import { SincraButton } from './SincraButton'
import type { ButtonProps } from './button.types'

interface IconButtonProps extends Omit<ButtonProps, 'size' | 'icon' | 'children'> {
  icon: LucideIcon
  label: string
  /** Overrides the icon's own color, since it can't reliably win against the variant's via CSS cascade. */
  iconClassName?: string
}

export function IconButton({ icon: Icon, label, iconClassName, ...props }: IconButtonProps) {
  return (
    <Tooltip label={label} withArrow position="top">
      <SincraButton size="icon" aria-label={label} {...props}>
        <Icon size={16} className={iconClassName} aria-hidden="true" />
      </SincraButton>
    </Tooltip>
  )
}
