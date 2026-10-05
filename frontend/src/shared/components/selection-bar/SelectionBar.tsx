import type { ReactNode } from 'react'

interface SelectionBarProps {
  label: string
  onClear: () => void
  children: ReactNode
}

export function SelectionBar({ label, onClear, children }: SelectionBarProps) {
  return (
    <div
      role="region"
      aria-label="Acciones de selección"
      className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 bg-surface-card px-4 py-2"
    >
      <div className="flex items-center gap-3">
        <span role="status" className="text-sm font-medium text-ink">
          {label}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer text-sm font-medium text-primary hover:underline"
        >
          Deseleccionar
        </button>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
