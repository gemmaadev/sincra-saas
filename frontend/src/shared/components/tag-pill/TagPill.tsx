import type { TagPillProps } from './tag-pill.types'

export function TagPill({ name, color }: TagPillProps) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {name}
    </span>
  )
}
