import type { ReactNode } from 'react'

interface SectionHeaderProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function SectionHeader({ icon, title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-primary">
          {icon}
        </span>
        <div>
          <h2 className="font-semibold text-ink">{title}</h2>
          {description && <p className="text-sm text-ink-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
