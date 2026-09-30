import type { ReactNode } from 'react'

export interface Tab {
  key: string
  label: string
  content: ReactNode
}

export interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
}
