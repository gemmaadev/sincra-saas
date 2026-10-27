import type { InputHTMLAttributes, ReactNode, Ref } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  icon?: ReactNode
  rightIcon?: ReactNode
  size?: 'sm' | 'md'
  ref?: Ref<HTMLInputElement>
}
