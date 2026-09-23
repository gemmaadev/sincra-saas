import type { TableProps } from './table.types'

export function Table<T>({ columns, data, onRowClick, emptyState, getRowKey }: TableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <table className="w-full text-left text-sm">
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
        {data.map((row) => (
          <tr
            key={getRowKey(row)}
            onClick={() => onRowClick?.(row)}
            onKeyDown={(e) => {
              if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onRowClick(row)
              }
            }}
            tabIndex={onRowClick ? 0 : undefined}
            role={onRowClick ? 'button' : undefined}
            className={`border-b border-neutral-50 ${onRowClick ? 'cursor-pointer hover:bg-surface-hover focus:outline-2 focus:outline-primary' : ''}`}
          >
            {columns.map((column) => (
              <td key={column.key} className="px-4 py-3 text-ink">
                {column.render ? column.render(row) : String(row[column.key as keyof T])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
