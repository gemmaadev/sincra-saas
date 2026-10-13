import { ApiError } from '../services'

function isAlreadyDeleted(reason: unknown): boolean {
  return reason instanceof ApiError && reason.status === 404
}

export async function bulkDelete(ids: string[], deleteOne: (id: string) => Promise<unknown>) {
  const results = await Promise.allSettled(ids.map((id) => deleteOne(id)))

  const failedIds = ids.filter((_id, index) => {
    const result = results[index]
    return result.status === 'rejected' && !isAlreadyDeleted(result.reason)
  })

  return { failedIds }
}
