import { describe, it, expect, vi } from 'vitest'
import { ApiError } from '../services'
import { bulkDelete } from './bulkDelete'

describe('bulkDelete', () => {
  // Given several ids
  // When every deletion succeeds
  // Then it should call deleteOne for each id and report no failures
  it('deletes every id and reports no failures', async () => {
    const deleteOne = vi.fn().mockResolvedValue(undefined)

    const result = await bulkDelete(['a', 'b', 'c'], deleteOne)

    expect(deleteOne).toHaveBeenCalledTimes(3)
    expect(deleteOne).toHaveBeenCalledWith('a')
    expect(deleteOne).toHaveBeenCalledWith('c')
    expect(result).toEqual({ failedIds: [] })
  })

  // Given one deletion fails with a non-404 error
  // When the batch runs
  // Then it should still attempt every id and report the failed one
  it('reports the ids that could not be deleted', async () => {
    const deleteOne = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new ApiError('Error', 500, 'INTERNAL_SERVER_ERROR'))
      .mockResolvedValueOnce(undefined)

    const result = await bulkDelete(['a', 'b', 'c'], deleteOne)

    expect(deleteOne).toHaveBeenCalledTimes(3)
    expect(result).toEqual({ failedIds: ['b'] })
  })

  // Given an id that no longer exists (404)
  // When the batch runs
  // Then it should count as deleted, since the goal was that it does not exist
  it('treats a 404 as already deleted', async () => {
    const deleteOne = vi
      .fn()
      .mockRejectedValueOnce(new ApiError('No encontrado', 404, 'NOT_FOUND'))

    const result = await bulkDelete(['a'], deleteOne)

    expect(result).toEqual({ failedIds: [] })
  })
})
