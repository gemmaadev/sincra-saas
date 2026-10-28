import { describe, it, expect, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { invalidateOrderQueries } from './invalidateOrderQueries'

describe('invalidateOrderQueries', () => {
  // Given an order id
  // When the order queries are invalidated
  // Then the orders list (and map), that order's detail, stats and calendar should all be refreshed
  it('invalidates the list, the detail, stats and calendar', () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateOrderQueries(queryClient, 'order-1')

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['order', 'order-1'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['stats'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar'] })
  })

  // Given no order id
  // When the order queries are invalidated
  // Then the orders list, stats and calendar should be refreshed, but no single-order detail
  it('skips the order detail when there is no order id', () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateOrderQueries(queryClient)

    expect(invalidateQueries).toHaveBeenCalledTimes(3)
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['orders'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['stats'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar'] })
  })
})
