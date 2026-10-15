import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { api, ApiError } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'

export function useSelectBusiness() {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (businessId: string) =>
      api.post<SuccessResponse>('/auth/select-business', { businessId }),
    onSuccess: () => navigate('/stats'),
  })

  const error = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : 'No se pudo entrar a ese negocio. Inténtalo de nuevo.'
    : null

  return {
    selectBusiness: mutation.mutate,
    selectingBusinessId: mutation.isPending ? mutation.variables : null,
    error,
  }
}
