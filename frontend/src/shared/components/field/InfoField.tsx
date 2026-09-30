import type { FieldProps } from './field.types'

export function InfoField({ label, value }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  )
}
