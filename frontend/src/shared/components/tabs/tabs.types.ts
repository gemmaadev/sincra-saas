import type { ReactNode } from 'react'

export interface Tab {
  key: string
  label: string
  content: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  /** Stretches the tab list/panel to the height of their container instead of sizing to content. */
  fillHeight?: boolean
}
