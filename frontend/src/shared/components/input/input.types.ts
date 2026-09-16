import type { InputHTMLAttributes, ReactNode, Ref } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  ref?: Ref<HTMLInputElement>
}
