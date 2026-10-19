import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/services'
import type { TeamResponse } from '../types/team.types'

export function useTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => api.get<TeamResponse>('/team'),
  })
}
