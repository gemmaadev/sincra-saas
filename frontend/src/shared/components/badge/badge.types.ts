import type { ReactNode } from 'react'

export type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'neutral'

export interface BadgeProps {
  children: ReactNode
  color?: BadgeColor
  className?: string
}
