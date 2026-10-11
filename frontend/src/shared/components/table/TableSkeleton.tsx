import type { ReactNode } from 'react'
import { Skeleton } from '../skeleton'

export interface SkeletonColumn {
  key: string
  header: string
  renderCell?: () => ReactNode
}

interface TableSkeletonProps {
  columns: SkeletonColumn[]
  label: string
  rows?: number
}

const DEFAULT_ROWS = 10

export function TableSkeleton({ columns, label, rows = DEFAULT_ROWS }: TableSkeletonProps) {
  return (
    <table className="w-full text-left text-sm" aria-busy="true" aria-label={label}>
      <thead>
        <tr className="border-b border-neutral-100 text-ink-muted">
          {columns.map((column) => (
            <th key={column.key} scope="col" className="px-4 py-2 font-medium">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, rowIndex) => rowIndex).map((rowIndex) => (
          <tr key={rowIndex} className="border-b border-neutral-50">
            {columns.map((column) => (
              <td key={column.key} className="px-4 py-3">
                {column.renderCell ? column.renderCell() : <Skeleton className="h-3.5 w-20" />}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
