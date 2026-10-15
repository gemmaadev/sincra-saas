import { create } from 'zustand'
import type { Channel } from '@/shared/types'

interface FiltersState {
  channel: Channel | ''
  dateFrom: string
  dateTo: string
  setChannel: (channel: Channel | '') => void
  setDateFrom: (dateFrom: string) => void
  setDateTo: (dateTo: string) => void
  clearFilters: () => void
}

const initialFilters = {
  channel: '' as Channel | '',
  dateFrom: '',
  dateTo: '',
}

export const useFiltersStore = create<FiltersState>((set) => ({
  ...initialFilters,
  setChannel: (channel) => set({ channel }),
  setDateFrom: (dateFrom) => set({ dateFrom }),
  setDateTo: (dateTo) => set({ dateTo }),
  clearFilters: () => set(initialFilters),
}))
