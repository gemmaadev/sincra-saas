import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import { api, ApiError } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'
import { clearQueriesAfterBusinessSwitch } from '../utils/clearQueriesAfterBusinessSwitch'
import { toPathAfterBusinessSwitch } from '../utils/toPathAfterBusinessSwitch'
import { useAuth } from './useAuth'

export function useSwitchBusiness() {
  const queryClient = useQueryClient()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const mutation = useMutation({
    mutationFn: (businessId: string) =>
      api.post<SuccessResponse>('/auth/switch-business', { businessId }),
    onSuccess: async () => {
      const nextPath = toPathAfterBusinessSwitch(location.pathname)
      await clearQueriesAfterBusinessSwitch(queryClient, async () => {
        navigate(nextPath)
        await login()
      })
    },
  })

  const error = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : 'No se pudo cambiar de negocio. Inténtalo de nuevo.'
    : null

  return {
    switchBusiness: mutation.mutate,
    switchingBusinessId: mutation.isPending ? mutation.variables : null,
    error,
  }
}
