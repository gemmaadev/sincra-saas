import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { MapPin, Search } from 'lucide-react'
import { Input, SincraButton } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { useAddressSearch } from '../../hooks/useAddressSearch'
import type { AddressCandidate } from '../../types/client.types'

const MIN_QUERY_LENGTH = 3

interface AddressSearchProps {
  onSelect: (candidate: AddressCandidate) => void
}

export function AddressSearch({ onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState<string>('')
  const search = useAddressSearch()

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

  function handleSelect(candidate: AddressCandidate) {
    onSelect(candidate)
    search.reset()
    setQuery('')
  }

  const searchError = search.isError
    ? search.error instanceof ApiError
      ? search.error.message
      : 'No se ha podido buscar la dirección. Inténtalo de nuevo.'
    : undefined

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            label="Buscar dirección"
            placeholder="Ej. Carrer de Balmes 71, Manresa"
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
          No se han encontrado coincidencias. Prueba con otro nombre de la calle o escribe la zona y
          la dirección a mano.
        </p>
      )}

      {search.isSuccess && search.data.length > 0 && (
        <ul className="flex flex-col divide-y divide-neutral-100 rounded-lg border border-neutral-100">
          {search.data.map((candidate) => (
            <li key={`${candidate.latitude},${candidate.longitude}`}>
              <button
                type="button"
                onClick={() => handleSelect(candidate)}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-neutral-50"
              >
                <MapPin size={15} className="shrink-0 text-ink-muted" aria-hidden="true" />
                <span>{candidate.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
