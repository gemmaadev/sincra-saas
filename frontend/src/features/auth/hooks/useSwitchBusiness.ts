import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import { api, ApiError } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'
import { useAuth } from './useAuth'
import { routeAfterBusinessSwitch } from '../utils/routeAfterBusinessSwitch'

export function useSwitchBusiness() {
  const queryClient = useQueryClient()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const mutation = useMutation({
    mutationFn: (businessId: string) =>
      api.post<SuccessResponse>('/auth/switch-business', { businessId }),
    onSuccess: async () => {
      const nextPath = routeAfterBusinessSwitch(location.pathname)
      // Cancel in-flight reads first so they cannot write the previous
      // business back into the cache after it has been dropped. removeQueries
      // drops cached data without touching the mutation that is switching.
      await queryClient.cancelQueries()
      queryClient.removeQueries()
      navigate(nextPath)
      await login()
      await queryClient.invalidateQueries()
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
