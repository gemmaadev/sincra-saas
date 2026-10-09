import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'neutral'

export interface BadgeProps {
  children: ReactNode
  color?: BadgeColor
  icon?: LucideIcon
  className?: string
}
