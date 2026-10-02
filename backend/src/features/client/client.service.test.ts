import { describe, it, expect } from 'vitest'
import prisma from '../../config/db'
import { listClients } from './client.service'

describe('listClients', () => {
  // Given a business with one client created today and one created 60 days ago
  // When listClients is called
  // Then newClientsCount should only count the client created within the last 30 days
  it('counts only clients created in the last 30 days as new', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    await prisma.client.create({
      data: { businessId: business.id, name: 'Cliente reciente' },
    })
    await prisma.client.create({
      data: { businessId: business.id, name: 'Cliente antiguo', createdAt: sixtyDaysAgo },
    })

    const result = await listClients(business.id, {})

    expect(result.pagination.total).toBe(2)
    expect(result.newClientsCount).toBe(1)

    await prisma.business.delete({ where: { id: business.id } })
  })

  // Given a client that belongs to a different business
  // When listClients is called for the current business
  // Then that other client should not count towards newClientsCount
  it('does not count new clients from another business', async () => {
    const business = await prisma.business.create({ data: { name: 'Negocio de prueba' } })
    const otherBusiness = await prisma.business.create({ data: { name: 'Otro negocio' } })

    await prisma.client.create({ data: { businessId: otherBusiness.id, name: 'Cliente ajeno' } })

    const result = await listClients(business.id, {})

    expect(result.newClientsCount).toBe(0)

    await prisma.business.delete({ where: { id: business.id } })
    await prisma.business.delete({ where: { id: otherBusiness.id } })
  })
})
