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

describe('Client and Tag models', () => {
  // Given a business and valid client data
  // When creating a Client
  // Then it should be persisted with the given fields
  it('creates a Client linked to a Business', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })

    const client = await prisma.client.create({
      data: {
        businessId: business.id,
        name: 'Laura García',
        email: `laura-${Date.now()}@sincra.test`,
        phone: '+34600000000',
        channels: ['GMAIL', 'WHATSAPP'],
        type: 'particular',
      },
    })

    expect(client.id).toBeDefined()
    expect(client.name).toBe('Laura García')
    expect(client.channels).toEqual(['GMAIL', 'WHATSAPP'])

    await prisma.business.delete({ where: { id: business.id } })
  })

  // Given a business with an existing client
  // When creating another client with the same email in the same business
  // Then Prisma should reject it with a unique constraint violation
  it('rejects a duplicate email within the same business', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })
    const sharedEmail = `duplicado-${Date.now()}@sincra.test`

    await prisma.client.create({
      data: { businessId: business.id, name: 'Cliente 1', email: sharedEmail },
    })

    await expect(
      prisma.client.create({
        data: { businessId: business.id, name: 'Cliente 2', email: sharedEmail },
      }),
    ).rejects.toThrow()

    await prisma.business.delete({ where: { id: business.id } })
  })

  // Given a business
  // When creating several clients with no email, all in the same business
  // Then the unique constraint should not treat multiple NULL emails as duplicates
  it('allows several clients in the same business with no email', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })

    const clientA = await prisma.client.create({
      data: { businessId: business.id, name: 'Cliente sin email A', phone: '+34600000001' },
    })
    const clientB = await prisma.client.create({
      data: { businessId: business.id, name: 'Cliente sin email B', phone: '+34600000002' },
    })

    expect(clientA.email).toBeNull()
    expect(clientB.email).toBeNull()

    await prisma.business.delete({ where: { id: business.id } })
  })

  // Given a client
  // When creating tags for them with different free-text "type" values
  // Then each tag should be saved independently, with its own type and default priority
  it('creates tags for a client with different free-text types', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })
    const client = await prisma.client.create({
      data: {
        businessId: business.id,
        name: 'Cliente con etiquetas',
        email: `tags-${Date.now()}@sincra.test`,
      },
    })

    const clienteTag = await prisma.tag.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        name: 'VIP',
        color: '#FFB800',
        type: 'cliente',
      },
    })
    const inboxTag = await prisma.tag.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        name: 'Urgente',
        color: '#E5484D',
        type: 'inbox',
      },
    })

    const tags = await prisma.tag.findMany({ where: { clientId: client.id } })
    expect(tags).toHaveLength(2)
    expect(tags.map((tag) => tag.type).sort()).toEqual(['cliente', 'inbox'])
    expect(clienteTag.aiGenerated).toBe(false)
    expect(inboxTag.priority).toBe('LOW')

    await prisma.business.delete({ where: { id: business.id } })
  })

  // Given a business with a client and a tag on that client
  // When deleting the business
  // Then the client and its tags should cascade-delete too
  it('cascade-deletes clients and their tags when the business is deleted', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })
    const client = await prisma.client.create({
      data: {
        businessId: business.id,
        name: 'Cliente',
        email: `cascade-${Date.now()}@sincra.test`,
      },
    })
    const tag = await prisma.tag.create({
      data: { businessId: business.id, clientId: client.id, name: 'VIP', color: '#FFB800' },
    })

    await prisma.business.delete({ where: { id: business.id } })

    expect(await prisma.client.findUnique({ where: { id: client.id } })).toBeNull()
    expect(await prisma.tag.findUnique({ where: { id: tag.id } })).toBeNull()
  })
})
