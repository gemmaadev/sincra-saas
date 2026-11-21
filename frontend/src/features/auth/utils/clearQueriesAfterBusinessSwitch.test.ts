import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { clearQueriesAfterBusinessSwitch } from './clearQueriesAfterBusinessSwitch'

describe('clearQueriesAfterBusinessSwitch', () => {
  // Given cached data from the current business
  // When the cache is cleared around a session refresh
  // Then in-flight reads stop, the old data is removed, and the refetch happens after the refresh
  it('drops cached data and refetches after the session refresh', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['clients'], [{ id: 'from-old-business' }])
    const steps: string[] = []

    const cancelQueries = queryClient.cancelQueries.bind(queryClient)
    const removeQueries = queryClient.removeQueries.bind(queryClient)
    const invalidateQueries = queryClient.invalidateQueries.bind(queryClient)

    vi.spyOn(queryClient, 'cancelQueries').mockImplementation(async (filters) => {
      steps.push('cancel')
      return cancelQueries(filters)
    })
    vi.spyOn(queryClient, 'removeQueries').mockImplementation((filters) => {
      steps.push('remove')
      return removeQueries(filters)
    })
    vi.spyOn(queryClient, 'invalidateQueries').mockImplementation(async (filters) => {
      steps.push('invalidate')
      return invalidateQueries(filters)
    })

    await clearQueriesAfterBusinessSwitch(queryClient, async () => {
      steps.push('refresh')
    })

    expect(steps).toEqual(['cancel', 'remove', 'refresh', 'invalidate'])
    expect(queryClient.getQueryData(['clients'])).toBeUndefined()
  })
})
