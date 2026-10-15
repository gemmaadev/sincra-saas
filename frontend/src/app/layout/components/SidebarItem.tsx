import { NavLink } from 'react-router'
import type { ReactNode } from 'react'

interface SidebarItemProps {
  to: string
  icon: ReactNode
  label: string
  badge?: number
  disabled?: boolean
}

export function SidebarItem({ to, icon, label, badge, disabled = false }: SidebarItemProps) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted/50"
      >
        {icon}
        {label}
      </span>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary/10 text-primary-dark'
            : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
        }`
      }
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
    </NavLink>
  )
}
