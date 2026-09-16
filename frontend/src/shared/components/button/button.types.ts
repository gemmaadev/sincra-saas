import type { ButtonHTMLAttributes, Ref } from 'react'
import type { buttonVariants, buttonSizes } from './button.variants'

export type ButtonVariant = keyof typeof buttonVariants
export type ButtonSize = keyof typeof buttonSizes
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  ref?: Ref<HTMLButtonElement>
}
