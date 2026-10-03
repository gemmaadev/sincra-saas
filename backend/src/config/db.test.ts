import { describe, it, expect } from 'vitest'
import prisma from './db'
import { hashPassword } from '../shared/hash'

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

  // Given a business-level Tag catalog and a client
  // When attaching two different tags to that client via ClientTag
  // Then both assignments should be saved independently, reusing the same Tag definitions
  it('attaches reusable tags to a client via ClientTag', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })
    const client = await prisma.client.create({
      data: {
        businessId: business.id,
        name: 'Cliente con etiquetas',
        email: `tags-${Date.now()}@sincra.test`,
      },
    })

    const vipTag = await prisma.tag.create({
      data: { businessId: business.id, name: 'VIP', color: '#FFB800', priority: 'HIGH' },
    })
    const urgentTag = await prisma.tag.create({
      data: { businessId: business.id, name: 'Urgente', color: '#E5484D' },
    })

    await prisma.clientTag.create({ data: { clientId: client.id, tagId: vipTag.id } })
    await prisma.clientTag.create({
      data: { clientId: client.id, tagId: urgentTag.id, removedAt: null },
    })

    const clientTags = await prisma.clientTag.findMany({
      where: { clientId: client.id },
      include: { tag: true },
    })
    expect(clientTags).toHaveLength(2)
    expect(clientTags.map((clientTag) => clientTag.tag.name).sort()).toEqual(['Urgente', 'VIP'])
    expect(vipTag.priority).toBe('HIGH')
    expect(urgentTag.priority).toBe('LOW')

    await prisma.business.delete({ where: { id: business.id } })
  })

  // Given a business, a client, a tag and a ClientTag linking them
  // When deleting the business
  // Then the client, the tag and the ClientTag assignment should all cascade-delete
  it('cascade-deletes clients, tags and their assignments when the business is deleted', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })
    const client = await prisma.client.create({
      data: {
        businessId: business.id,
        name: 'Cliente',
        email: `cascade-${Date.now()}@sincra.test`,
      },
    })
    const tag = await prisma.tag.create({
      data: { businessId: business.id, name: 'VIP', color: '#FFB800' },
    })
    const clientTag = await prisma.clientTag.create({
      data: { clientId: client.id, tagId: tag.id },
    })

    await prisma.business.delete({ where: { id: business.id } })

    expect(await prisma.client.findUnique({ where: { id: client.id } })).toBeNull()
    expect(await prisma.tag.findUnique({ where: { id: tag.id } })).toBeNull()
    expect(await prisma.clientTag.findUnique({ where: { id: clientTag.id } })).toBeNull()
  })
})
