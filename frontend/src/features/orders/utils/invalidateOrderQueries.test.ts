import { describe, it, expect, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { invalidateOrderQueries } from './invalidateOrderQueries'

describe('invalidateOrderQueries', () => {
  // Given an order id
  // When the order queries are invalidated
  // Then both the orders list (and map) and that order's detail should be refreshed
  it('invalidates the list and the detail of the order', () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateOrderQueries(queryClient, 'order-1')

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['order', 'order-1'] })
  })

  // Given no order id
  // When the order queries are invalidated
  // Then only the orders list should be refreshed
  it('invalidates only the list when there is no order id', () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateOrderQueries(queryClient)

    expect(invalidateQueries).toHaveBeenCalledTimes(1)
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
  })
})
