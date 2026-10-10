import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { UserRound, Search } from 'lucide-react'
import { Input, SincraButton } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { useSearchClients } from '../hooks/useSearchClients'
import type { ClientSearchResult } from '../types/order.types'

const MIN_QUERY_LENGTH = 2

interface ClientSearchProps {
  onSelect: (client: ClientSearchResult) => void
}

export function ClientSearch({ onSelect }: ClientSearchProps) {
  const [query, setQuery] = useState<string>('')
  const search = useSearchClients()

  function runSearch() {
    const trimmedQuery = query.trim()
    if (trimmedQuery.length >= MIN_QUERY_LENGTH) search.mutate(trimmedQuery)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      runSearch()
    }
  }

  function handleSelect(client: ClientSearchResult) {
    onSelect(client)
    search.reset()
    setQuery('')
  }

  const searchError = search.isError
    ? search.error instanceof ApiError
      ? search.error.message
      : 'No se ha podido buscar el cliente. Inténtalo de nuevo.'
    : undefined

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            label="Buscar cliente"
            placeholder="Nombre, email o teléfono"
            icon={<Search size={16} aria-hidden="true" />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <SincraButton
          type="button"
          variant="secondary"
          loading={search.isPending}
          disabled={query.trim().length < MIN_QUERY_LENGTH}
          onClick={runSearch}
        >
          Buscar
        </SincraButton>
      </div>

      {searchError && (
        <p role="alert" className="text-sm text-error">
          {searchError}
        </p>
      )}

      {search.isSuccess && search.data.length === 0 && (
        <p role="status" className="text-sm text-ink-muted">
          No se han encontrado clientes con ese nombre, email o teléfono.
        </p>
      )}

      {search.isSuccess && search.data.length > 0 && (
        <ul className="flex flex-col divide-y divide-neutral-100 rounded-lg border border-neutral-100">
          {search.data.map((client) => (
            <li key={client.id}>
              <button
                type="button"
                onClick={() => handleSelect(client)}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-neutral-50"
              >
                <UserRound size={15} className="shrink-0 text-ink-muted" aria-hidden="true" />
                <span className="flex flex-col">
                  <span>{client.name}</span>
                  {(client.email || client.phone) && (
                    <span className="text-xs text-ink-muted">
                      {[client.email, client.phone].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
