import { Pagination as MantinePagination } from '@mantine/core'
import type { PaginationProps } from './pagination.types'

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
      <span className="text-sm text-ink-muted">
        Página {page} de {totalPages}
      </span>
      <MantinePagination
        total={totalPages}
        value={page}
        onChange={onPageChange}
        color="var(--color-primary)"
        size="md"
        radius="md"
        getControlProps={(control) => {
          if (control === 'previous') return { 'aria-label': 'Página anterior' }
          if (control === 'next') return { 'aria-label': 'Página siguiente' }
          return {}
        }}
      />
    </div>
  )
}
