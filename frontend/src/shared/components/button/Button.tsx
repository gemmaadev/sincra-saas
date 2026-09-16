import { buttonVariants, buttonDisabledVariants, buttonSizes } from './button.variants'
import type { ButtonProps } from './button.types'

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors
        ${disabled ? buttonDisabledVariants[variant] : buttonVariants[variant]}
        ${buttonSizes[size]}
        ${disabled ? 'cursor-not-allowed' : loading ? 'cursor-wait' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
}
