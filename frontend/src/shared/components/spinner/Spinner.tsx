import type { PageSpinnerProps, SpinnerProps } from './spinner.types'

const SPINNER_SIZES = {
  sm: 'size-4 border-2',
  md: 'size-8 border-[3px]',
  lg: 'size-12 border-4',
} as const

export function Spinner({ size = 'md', label = 'Cargando', className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-primary border-t-transparent ${SPINNER_SIZES[size]} ${className}`}
    />
  )
}

export function PageSpinner({ label }: PageSpinnerProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" label={label} />
    </div>
  )
}
