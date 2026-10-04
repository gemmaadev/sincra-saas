import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode, Ref } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  error?: string
  ref?: Ref<HTMLInputElement>
}

export function Checkbox({ label, error, className = '', id, ref, ...props }: CheckboxProps) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-start gap-2 text-sm text-ink-muted">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          aria-invalid={!!error}
          aria-describedby={error ? `${checkboxId}-error` : undefined}
          className={`mt-0.5 size-4 accent-primary ${className}`}
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && (
        <span id={`${checkboxId}-error`} className="text-sm text-error">
          {error}
        </span>
      )}
    </div>
  )
}
