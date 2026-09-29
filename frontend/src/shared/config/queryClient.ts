import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 min: Avoids immediate refetch when switching tabs/returning to view
      retry: 1,
    },
  },
})
