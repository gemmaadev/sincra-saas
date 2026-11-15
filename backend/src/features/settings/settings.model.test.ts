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

  // Given a provider account id, even when an email is also present
  // When looking up the channel
  // Then it should match that provider id on the given channel only
  it('matches by provider account id and ignores the email', async () => {
    await findConnectedChannelsByAccount({
      channel: 'GMAIL',
      accountEmail: 'inbox@gmail.com',
      providerAccountId: 'google-sub-1',
    })

    expect(prisma.connectedChannel.findMany).toHaveBeenCalledWith({
      where: {
        channel: 'GMAIL',
        status: 'CONNECTED',
        providerAccountId: 'google-sub-1',
      },
      select: { businessId: true },
    })
  })

  // Given only an email
  // When looking up the channel
  // Then it should fall back to that email on the given channel
  it('falls back to the email when the provider account id is absent', async () => {
    await findConnectedChannelsByAccount({
      channel: 'GMAIL',
      accountEmail: 'inbox@gmail.com',
      providerAccountId: null,
    })

    expect(prisma.connectedChannel.findMany).toHaveBeenCalledWith({
      where: {
        channel: 'GMAIL',
        status: 'CONNECTED',
        accountEmail: 'inbox@gmail.com',
      },
      select: { businessId: true },
    })
  })

  // Given the same address stored on another channel
  // When looking up Gmail
  // Then the query stays on Gmail, so an Outlook row cannot match
  it('does not look at other channels', async () => {
    await findConnectedChannelsByAccount({
      channel: 'OUTLOOK',
      accountEmail: 'inbox@gmail.com',
      providerAccountId: null,
    })

    expect(prisma.connectedChannel.findMany).toHaveBeenCalledWith({
      where: {
        channel: 'OUTLOOK',
        status: 'CONNECTED',
        accountEmail: 'inbox@gmail.com',
      },
      select: { businessId: true },
    })
  })

  // Given neither identifier
  // When looking up the channel
  // Then it should return nothing and avoid a query that would match every null account
  it('does not query when neither identifier is present', async () => {
    const rows = await findConnectedChannelsByAccount({
      channel: 'GMAIL',
      accountEmail: null,
      providerAccountId: null,
    })

    expect(rows).toEqual([])
    expect(prisma.connectedChannel.findMany).not.toHaveBeenCalled()
  })
})
