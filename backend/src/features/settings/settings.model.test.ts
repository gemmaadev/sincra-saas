import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../config/db'
import { findBusinessIdsByConnectedAccount } from './settings.model'

vi.mock('../../config/db', () => ({
  default: { connectedChannel: { findMany: vi.fn() } },
}))

describe('findBusinessIdsByConnectedAccount', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns CONNECTED business ids for that channel and provider account', async () => {
    vi.mocked(prisma.connectedChannel.findMany).mockResolvedValue([
      { businessId: 'biz-1' },
      { businessId: 'biz-2' },
    ] as never)

    await expect(
      findBusinessIdsByConnectedAccount('GMAIL', {
        providerAccountId: 'sub-1',
        accountEmail: 'tienda@gmail.com',
      }),
    ).resolves.toEqual(['biz-1', 'biz-2'])

    expect(prisma.connectedChannel.findMany).toHaveBeenCalledWith({
      where: { channel: 'GMAIL', status: 'CONNECTED', providerAccountId: 'sub-1' },
      select: { businessId: true },
    })
  })

  it('falls back to the email when the provider account id is missing', async () => {
    vi.mocked(prisma.connectedChannel.findMany).mockResolvedValue([] as never)

    await findBusinessIdsByConnectedAccount('OUTLOOK', {
      providerAccountId: ' ',
      accountEmail: 'tienda@outlook.com',
    })

    expect(prisma.connectedChannel.findMany).toHaveBeenCalledWith({
      where: { channel: 'OUTLOOK', status: 'CONNECTED', accountEmail: 'tienda@outlook.com' },
      select: { businessId: true },
    })
  })

  it('searches the email trimmed and lowercased', async () => {
    vi.mocked(prisma.connectedChannel.findMany).mockResolvedValue([] as never)

    await findBusinessIdsByConnectedAccount('GMAIL', { accountEmail: '  Tienda@Gmail.com ' })

    expect(prisma.connectedChannel.findMany).toHaveBeenCalledWith({
      where: { channel: 'GMAIL', status: 'CONNECTED', accountEmail: 'tienda@gmail.com' },
      select: { businessId: true },
    })
  })

  it('returns an empty list without querying when neither id nor email is present', async () => {
    await expect(findBusinessIdsByConnectedAccount('GMAIL', {})).resolves.toEqual([])
    expect(prisma.connectedChannel.findMany).not.toHaveBeenCalled()
  })
})
