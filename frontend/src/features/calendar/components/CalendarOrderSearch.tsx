import { useState } from 'react'
import { Package, Search } from 'lucide-react'
import { Input } from '@/shared/components'
import { useDebouncedValue } from '@/shared/hooks'
import { ApiError } from '@/shared/services'
import { useSearchOrders } from '../hooks/useSearchOrders'
import type { CalendarOrderSearchResult } from '../types/calendar.types'

const MIN_QUERY_LENGTH = 2

interface CalendarOrderSearchProps {
  onSelect: (order: CalendarOrderSearchResult) => void
}

export function CalendarOrderSearch({ onSelect }: CalendarOrderSearchProps) {
  const [query, setQuery] = useState<string>('')
  const debouncedQuery = useDebouncedValue(query.trim())
  const search = useSearchOrders(debouncedQuery.length >= MIN_QUERY_LENGTH ? debouncedQuery : '')

  function handleSelect(order: CalendarOrderSearchResult) {
    onSelect(order)
    setQuery('')
  }

  const searchError = search.isError
    ? search.error instanceof ApiError
      ? search.error.message
      : 'No se ha podido buscar el pedido. Inténtalo de nuevo.'
    : undefined

  return (
    <div className="flex flex-col gap-2">
      <Input
        label="Buscar pedido"
        placeholder="Número de pedido o cliente"
        icon={<Search size={16} aria-hidden="true" />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {search.isFetching && <p className="text-sm text-ink-muted">Buscando...</p>}

      {searchError && (
        <p role="alert" className="text-sm text-error">
          {searchError}
        </p>
      )}

      {search.isSuccess && search.data.length === 0 && (
        <p role="status" className="text-sm text-ink-muted">
          No se han encontrado pedidos con ese número o cliente.
        </p>
      )}

      {search.isSuccess && search.data.length > 0 && (
        <ul className="flex flex-col divide-y divide-neutral-100 rounded-lg border border-neutral-100">
          {search.data.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => handleSelect(order)}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-neutral-50"
              >
                <Package size={15} className="shrink-0 text-ink-muted" aria-hidden="true" />
                <span>
                  Pedido #{order.number} - {order.clientName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
