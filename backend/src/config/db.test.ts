import { describe, it, expect } from 'vitest'
import prisma from './db'
import { hashPassword } from '../features/auth/auth.service'

describe('Business and User models', () => {
  // Given valid business and user data
  // When creating a Business with an associated admin membership
  // Then the Business, User and BusinessMember should be persisted with the correct relation
  it('creates a Business, a User and a BusinessMember linking them', async () => {
    const passwordHash = await hashPassword('contraseñaSegura123')

    const business = await prisma.business.create({
      data: {
        name: 'Negocio de prueba',
        sector: 'Comercio minorista',
        memberships: {
          create: {
            role: 'ADMIN',
            status: 'ACTIVE',
            user: {
              create: {
                name: 'Usuario de prueba',
                email: `test-${Date.now()}@sincra.test`,
                passwordHash,
              },
            },
          },
        },
      },
      include: { memberships: { include: { user: true } } },
    })

    expect(business.id).toBeDefined()
    expect(business.memberships).toHaveLength(1)
    expect(business.memberships[0].role).toBe('ADMIN')
    expect(business.memberships[0].user.name).toBe('Usuario de prueba')

    await prisma.business.delete({ where: { id: business.id } })
  })
})
