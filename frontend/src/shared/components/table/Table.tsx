import type { KeyboardEvent, MouseEvent } from 'react'
import { Checkbox } from '../checkbox'
import type { TableProps } from './table.types'

function stopPropagation(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation()
}

export function Table<T>({
  columns,
  data,
  onRowClick,
  emptyState,
  getRowKey,
  selection,
}: TableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  const selectedRowsCount = selection
    ? data.filter((row) => selection.selectedKeys.has(getRowKey(row))).length
    : 0
  const allSelected = data.length > 0 && selectedRowsCount === data.length
  const someSelected = selectedRowsCount > 0 && !allSelected

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-neutral-100 text-ink-muted">
          {selection && (
            <th scope="col" className="w-10 px-4 py-2">
              <Checkbox
                aria-label="Seleccionar todos"
                checked={allSelected}
                onChange={selection.onToggleAll}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected
                }}
              />
            </th>
          )}
          {columns.map((column) => (
            <th key={column.key} scope="col" className="px-4 py-2 font-medium">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
          const rowKey = getRowKey(row)
          const isSelected = selection?.selectedKeys.has(rowKey) ?? false

          return (
            <tr
              key={rowKey}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(event) => {
                if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault()
                  onRowClick(row)
                }
              }}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
              className={`border-b border-neutral-50 ${isSelected ? 'bg-primary-light/60' : ''} ${onRowClick ? 'cursor-pointer hover:bg-surface-hover focus:outline-2 focus:outline-primary' : ''}`}
            >
              {selection && (
                <td
                  className="w-10 px-4 py-3"
                  onClick={stopPropagation}
                  onKeyDown={stopPropagation}
                >
                  <Checkbox
                    aria-label={selection.getRowLabel(row)}
                    checked={isSelected}
                    onChange={() => selection.onToggleRow(rowKey)}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-ink">
                  {column.render ? column.render(row) : String(row[column.key as keyof T])}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
