import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../config/db'
import { findConnectedChannelsByAccount } from './settings.model'

vi.mock('../../config/db', () => ({
  default: {
    connectedChannel: {
      findMany: vi.fn(),
    },
  },
}))

describe('findConnectedChannelsByAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given an email and a provider account id
  // When looking up the channel
  // Then it should keep only CONNECTED rows that match either identifier
  it('matches connected channels by email or provider account id', async () => {
    await findConnectedChannelsByAccount({
      accountEmail: 'inbox@gmail.com',
      providerAccountId: 'google-sub-1',
    })

    expect(prisma.connectedChannel.findMany).toHaveBeenCalledWith({
      where: {
        status: 'CONNECTED',
        OR: [{ accountEmail: 'inbox@gmail.com' }, { providerAccountId: 'google-sub-1' }],
      },
      select: { businessId: true },
    })
  })

  // Given only an email
  // When looking up the channel
  // Then it should not add an empty provider-id predicate
  it('matches by email alone', async () => {
    await findConnectedChannelsByAccount({
      accountEmail: 'inbox@gmail.com',
      providerAccountId: null,
    })

    expect(prisma.connectedChannel.findMany).toHaveBeenCalledWith({
      where: { status: 'CONNECTED', OR: [{ accountEmail: 'inbox@gmail.com' }] },
      select: { businessId: true },
    })
  })

  // Given neither identifier
  // When looking up the channel
  // Then it should return nothing and avoid a query that would match every null account
  it('does not query when neither identifier is present', async () => {
    const rows = await findConnectedChannelsByAccount({
      accountEmail: null,
      providerAccountId: null,
    })

    expect(rows).toEqual([])
    expect(prisma.connectedChannel.findMany).not.toHaveBeenCalled()
  })
})
