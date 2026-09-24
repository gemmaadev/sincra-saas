import { describe, it, expect } from 'vitest'
import prisma from './db'
import { hashPassword } from '../features/auth/auth.service'

describe('Business and User models', () => {
  // Given valid business and user data
  // When creating a Business with an associated admin User
  // Then both records should be persisted with the correct relation
  it('creates a Business and an associated User', async () => {
    const passwordHash = await hashPassword('contraseñaSegura123')

    const business = await prisma.business.create({
      data: {
        name: 'Negocio de prueba',
        sector: 'Comercio minorista',
        users: {
          create: {
            name: 'Usuario de prueba',
            email: `test-${Date.now()}@sincra.test`,
            passwordHash,
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        },
      },
      include: { users: true },
    })

    expect(business.id).toBeDefined()
    expect(business.users).toHaveLength(1)
    expect(business.users[0].role).toBe('ADMIN')

    // Limpieza: no dejar datos de prueba en la base de datos real
    await prisma.business.delete({ where: { id: business.id } })
  })
})
