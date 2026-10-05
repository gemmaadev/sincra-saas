import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import { toClientPayload } from '../utils/toClientPayload'
import { invalidateClientQueries } from '../utils/invalidateClientQueries'
import type { ClientFormValues, ClientMutationResponse } from '../types/client.types'

export function useSaveClient(clientId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ClientFormValues) => {
      const payload = toClientPayload(values)
      const { client } = clientId
        ? await api.patch<ClientMutationResponse>(`/clients/${clientId}`, payload)
        : await api.post<ClientMutationResponse>('/clients', payload)
      return client
    },
    onSuccess: () => invalidateClientQueries(queryClient, clientId),
  })
}
