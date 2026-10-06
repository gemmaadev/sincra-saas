import { describe, it, expect, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { invalidateClientQueries } from './invalidateClientQueries'

describe('invalidateClientQueries', () => {
  // Given a client id
  // When the client queries are invalidated
  // Then both the clients list and that client's detail should be refreshed
  it('invalidates the list and the detail of the client', () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateClientQueries(queryClient, 'client-1')

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['client', 'client-1'] })
  })

  // Given no client id
  // When the client queries are invalidated
  // Then only the clients list should be refreshed
  it('invalidates only the list when there is no client id', () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateClientQueries(queryClient)

    expect(invalidateQueries).toHaveBeenCalledTimes(1)
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients'] })
  })
})
