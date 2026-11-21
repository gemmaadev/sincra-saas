import type { QueryClient } from '@tanstack/react-query'

// Drop and refetch cache after the session cookie is refreshed.
export async function clearQueriesAfterBusinessSwitch(
  queryClient: QueryClient,
  refreshSession: () => Promise<void>,
): Promise<void> {
  await queryClient.cancelQueries()
  queryClient.removeQueries()
  await refreshSession()
  await queryClient.invalidateQueries()
}
