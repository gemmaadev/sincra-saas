import { describe, it, expect, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { invalidateClientQueries } from './invalidateClientQueries'

describe('invalidateClientQueries', () => {
  // Given a client id
  // When the client queries are invalidated
  // Then the clients list, that client's detail, stats and calendar should all be refreshed
  it('invalidates the list, the detail, stats and calendar', () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateClientQueries(queryClient, 'client-1')

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['client', 'client-1'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['stats'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar'] })
  })

  // Given no client id
  // When the client queries are invalidated
  // Then the clients list, stats and calendar should be refreshed, but no single-client detail
  it('skips the client detail when there is no client id', () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateClientQueries(queryClient)

    expect(invalidateQueries).toHaveBeenCalledTimes(3)
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['stats'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar'] })
  })
})
