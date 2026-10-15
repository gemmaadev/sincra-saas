import { describe, it, expect, beforeEach } from 'vitest'
import { useFiltersStore } from './filtersStore'

describe('useFiltersStore', () => {
  beforeEach(() => {
    useFiltersStore.getState().clearFilters()
  })

  // Given the store has just been created
  // When its state is read
  // Then no channel or date range should be set
  it('starts without any filter', () => {
    const state = useFiltersStore.getState()

    expect(state.channel).toBe('')
    expect(state.dateFrom).toBe('')
    expect(state.dateTo).toBe('')
  })

  // Given a page sets the channel and date range
  // When another consumer reads the store
  // Then it should see the same values
  it('shares the same state across consumers', () => {
    useFiltersStore.getState().setChannel('WHATSAPP')
    useFiltersStore.getState().setDateFrom('2026-01-01')
    useFiltersStore.getState().setDateTo('2026-01-31')

    const state = useFiltersStore.getState()
    expect(state.channel).toBe('WHATSAPP')
    expect(state.dateFrom).toBe('2026-01-01')
    expect(state.dateTo).toBe('2026-01-31')
  })

  // Given active filters
  // When they are cleared
  // Then everything should be back to empty
  it('clears every filter', () => {
    useFiltersStore.getState().setChannel('GMAIL')
    useFiltersStore.getState().setDateFrom('2026-01-01')

    useFiltersStore.getState().clearFilters()

    const state = useFiltersStore.getState()
    expect(state.channel).toBe('')
    expect(state.dateFrom).toBe('')
    expect(state.dateTo).toBe('')
  })
})
