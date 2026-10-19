import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTeamFilters } from './useTeamFilters'
import type { TeamMember } from '../types/team.types'

const members: TeamMember[] = [
  { id: 'user-1', name: 'Laura García', email: 'laura@sincra.app', role: 'ADMIN', status: 'ACTIVE' },
  { id: 'user-2', name: 'Carlos Ruiz', email: 'carlos@sincra.app', role: 'EMPLOYEE', status: 'PENDING' },
  { id: 'user-3', name: 'Marta Soler', email: 'marta@sincra.app', role: 'EMPLOYEE', status: 'ACTIVE' },
]

describe('useTeamFilters', () => {
  // Given the members list hasn't loaded yet
  // When useTeamFilters is called with undefined
  // Then it should return an empty filtered list instead of throwing
  it('returns an empty list while members are undefined', () => {
    const { result } = renderHook(() => useTeamFilters(undefined))
    expect(result.current.filteredMembers).toEqual([])
  })

  // Given a business with many past employees
  // When the page first loads, with no filter touched by the user
  // Then only active members should show, so inactive people don't clutter the default view
  it('defaults to showing only active members', () => {
    const { result } = renderHook(() => useTeamFilters(members))
    expect(result.current.filteredMembers).toEqual([members[0], members[2]])
  })

  // Given the status filter is explicitly cleared
  // When reading filteredMembers
  // Then it should return every member, regardless of status
  it('returns all members when the status filter is cleared', () => {
    const { result } = renderHook(() => useTeamFilters(members))
    act(() => result.current.setStatus(''))
    expect(result.current.filteredMembers).toEqual(members)
  })

  // Given a search term
  // When it matches a member's name or email, case-insensitively
  // Then only matching members should remain, regardless of the default status filter
  it('filters by name or email, case-insensitively', () => {
    const { result } = renderHook(() => useTeamFilters(members))
    act(() => result.current.setStatus(''))

    act(() => result.current.setSearch('CARLOS'))
    expect(result.current.filteredMembers).toEqual([members[1]])

    act(() => result.current.setSearch('marta@sincra.app'))
    expect(result.current.filteredMembers).toEqual([members[2]])
  })

  // Given a role filter
  // When set to EMPLOYEE
  // Then only employees should remain, regardless of the default status filter
  it('filters by role', () => {
    const { result } = renderHook(() => useTeamFilters(members))
    act(() => result.current.setStatus(''))

    act(() => result.current.setRole('EMPLOYEE'))
    expect(result.current.filteredMembers).toEqual([members[1], members[2]])
  })

  // Given a status filter
  // When set to PENDING
  // Then only pending members should remain
  it('filters by status', () => {
    const { result } = renderHook(() => useTeamFilters(members))
    act(() => result.current.setStatus('PENDING'))
    expect(result.current.filteredMembers).toEqual([members[1]])
  })

  // Given search, role and status filters all set
  // When they narrow down to no member at all
  // Then filteredMembers should be empty
  it('combines search, role and status filters', () => {
    const { result } = renderHook(() => useTeamFilters(members))

    act(() => {
      result.current.setSearch('marta')
      result.current.setRole('ADMIN')
    })

    expect(result.current.filteredMembers).toEqual([])
  })
})
