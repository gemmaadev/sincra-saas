import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { BusinessSettings, UpdateBusinessSettingsInput } from '../types/settings.types'

export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateBusinessSettingsInput) => {
      const { business } = await api.patch<{ business: BusinessSettings }>(
        '/settings/business',
        input,
      )
      return business
    },
    onSuccess: (business) => {
      queryClient.setQueryData(['settings', 'business'], business)
    },
  })
}
