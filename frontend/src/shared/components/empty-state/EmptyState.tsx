import type { EmptyStateProps } from './empty-state.types'

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon && <div className="text-neutral-300">{icon}</div>}
      <p className="text-ink">{title}</p>
      {description && <p className="text-sm text-ink max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
