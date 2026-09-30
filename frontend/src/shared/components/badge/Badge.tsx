import { badgeColors } from './badge.variants'
import type { BadgeProps } from './badge.types'

export function Badge({ children, color = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium
        ${badgeColors[color]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
