import type { HTMLAttributes, ReactNode, Ref } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  ref?: Ref<HTMLDivElement>
}
