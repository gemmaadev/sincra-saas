import { describe, it, expect } from 'vitest'
import { buildTeamKpiCards } from './buildTeamKpiCards'
import type { TeamMember } from '../types/team.types'

const members: TeamMember[] = [
  { id: 'user-1', name: 'Laura García', email: 'laura@sincra.app', role: 'ADMIN', status: 'ACTIVE' },
  { id: 'user-2', name: 'Carlos Ruiz', email: 'carlos@sincra.app', role: 'EMPLOYEE', status: 'ACTIVE' },
  { id: 'user-3', name: 'Marta Soler', email: 'marta@sincra.app', role: 'EMPLOYEE', status: 'PENDING' },
]

describe('buildTeamKpiCards', () => {
  // Given no members yet (still loading)
  // When building the KPI cards
  // Then all three cards should be pending, with no value
  it('returns three pending cards when there are no members', () => {
    const cards = buildTeamKpiCards(null)

    expect(cards).toHaveLength(3)
    expect(cards.every((card) => card.pending)).toBe(true)
  })

  // Given a loaded members list
  // When building the KPI cards
  // Then it should count members, admins and employees by role
  it('counts members, admins and employees from the list', () => {
    const cards = buildTeamKpiCards(members)

    expect(cards).toEqual([
      expect.objectContaining({ label: 'Miembros', value: '3' }),
      expect.objectContaining({ label: 'Administradores', value: '1' }),
      expect.objectContaining({ label: 'Empleados', value: '2' }),
    ])
  })

  // Given an empty members list
  // When building the KPI cards
  // Then every count should be zero
  it('shows zero counts for an empty list', () => {
    const cards = buildTeamKpiCards([])

    expect(cards).toEqual([
      expect.objectContaining({ label: 'Miembros', value: '0' }),
      expect.objectContaining({ label: 'Administradores', value: '0' }),
      expect.objectContaining({ label: 'Empleados', value: '0' }),
    ])
  })
})
