import type { QueryClient } from '@tanstack/react-query'

// A business switch is not a single-feature mutation: every cached query belongs
// to the business being left. Feature invalidators would refetch one domain and
// leave the rest on screen, so the whole cache is dropped. removeQueries does
// not touch the mutation that is performing the switch. The session refresh runs
// before the refetch so new requests already carry the new cookie.
export async function clearQueriesAfterBusinessSwitch(
  queryClient: QueryClient,
  refreshSession: () => Promise<void>,
): Promise<void> {
  await queryClient.cancelQueries()
  queryClient.removeQueries()
  await refreshSession()
  await queryClient.invalidateQueries()
}
