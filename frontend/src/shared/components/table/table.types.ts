import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
}

export interface TableSelection<T> {
  selectedKeys: ReadonlySet<string>
  onToggleRow: (key: string) => void
  onToggleAll: () => void
  getRowLabel: (row: T) => string
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  emptyState?: ReactNode
  getRowKey: (row: T) => string
  selection?: TableSelection<T>
}
