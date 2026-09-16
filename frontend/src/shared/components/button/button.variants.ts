export const buttonVariants = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-primary text-primary bg-white hover:bg-primary/10',
  tertiary: 'bg-primary/10 text-primary hover:bg-primary/15',
  text: 'text-primary hover:underline',
  danger: 'bg-error text-white hover:bg-error-hover',
} as const

export const buttonDisabledVariants = {
  primary: 'bg-neutral-300 text-white/70',
  secondary: 'border border-neutral-300 text-neutral-400 bg-white',
  tertiary: 'bg-neutral-100 text-neutral-400',
  text: 'text-neutral-400',
  danger: 'bg-neutral-300 text-white/70',
} as const

export const buttonSizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
} as const
