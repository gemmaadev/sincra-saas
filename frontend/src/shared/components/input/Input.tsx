import { useId } from 'react'
import type { InputProps } from './input.types'

const inputSizes = {
  sm: 'py-1',
  md: 'py-2',
} as const

export function Input({
  label,
  error,
  icon,
  size = 'md',
  className = '',
  id,
  ref,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">{icon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            w-full rounded-lg border px-3 text-ink
            transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30
            ${inputSizes[size]}
            ${icon ? 'pl-9' : ''}
            ${error ? 'border-error focus:border-error' : 'border-neutral-200 focus:border-primary'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <span id={`${inputId}-error`} className="text-xs text-error">
          {error}
        </span>
      )}
    </div>
  )
}
