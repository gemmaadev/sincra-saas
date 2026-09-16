import type { CardProps } from './card.types'

const cardPaddings = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const

export function Card({ children, className = '', padding = 'md', ref, ...props }: CardProps) {
  return (
    <div
      ref={ref}
      className={`
        bg-surface-card rounded-card border border-neutral-100
        ${cardPaddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
