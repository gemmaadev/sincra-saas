import { badgeColors } from './badge.variants'
import type { BadgeProps } from './badge.types'

export function Badge({ children, color = 'neutral', icon: Icon, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium
        ${badgeColors[color]}
        ${className}
      `}
    >
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  )
}
