import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as settingsModel from './settings.model'
import { resolveBusinessesByReceivingAccount } from './receiving-account.service'

vi.mock('./settings.model')

describe('resolveBusinessesByReceivingAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given an address or provider id with no CONNECTED channel
  // When resolving the businesses that receive on that account
  // Then it should return an empty list so the caller saves nothing
  it('returns an empty list when nothing matches', async () => {
    vi.mocked(settingsModel.findConnectedChannelsByAccount).mockResolvedValue([])

    const businessIds = await resolveBusinessesByReceivingAccount({
      email: 'nobody@gmail.com',
    })

    expect(businessIds).toEqual([])
    expect(settingsModel.findConnectedChannelsByAccount).toHaveBeenCalledWith({
      accountEmail: 'nobody@gmail.com',
      providerAccountId: null,
    })
  })

  // Given one business connected to the receiving account
  // When resolving it
  // Then it should return that business id
  it('returns the single business connected to the account', async () => {
    vi.mocked(settingsModel.findConnectedChannelsByAccount).mockResolvedValue([
      { businessId: 'biz-1' },
    ])

    const businessIds = await resolveBusinessesByReceivingAccount({
      email: ' Inbox@Gmail.com ',
    })

    expect(businessIds).toEqual(['biz-1'])
    expect(settingsModel.findConnectedChannelsByAccount).toHaveBeenCalledWith({
      accountEmail: 'inbox@gmail.com',
      providerAccountId: null,
    })
  })

  // Given the same account connected to several businesses
  // When resolving it
  // Then it should return every business id, once, so each is processed on its own
  it('returns every business connected to the account', async () => {
    vi.mocked(settingsModel.findConnectedChannelsByAccount).mockResolvedValue([
      { businessId: 'biz-1' },
      { businessId: 'biz-2' },
      { businessId: 'biz-1' },
      { businessId: 'biz-3' },
    ])

    const businessIds = await resolveBusinessesByReceivingAccount({
      providerAccountId: ' google-sub-1 ',
    })

    expect(businessIds).toEqual(['biz-1', 'biz-2', 'biz-3'])
    expect(settingsModel.findConnectedChannelsByAccount).toHaveBeenCalledWith({
      accountEmail: null,
      providerAccountId: 'google-sub-1',
    })
  })

  // Given neither an email nor a provider id
  // When resolving
  // Then it should return an empty list without querying
  it('returns an empty list when the account has no identifier', async () => {
    const businessIds = await resolveBusinessesByReceivingAccount({
      email: '   ',
      providerAccountId: '',
    })

    expect(businessIds).toEqual([])
    expect(settingsModel.findConnectedChannelsByAccount).not.toHaveBeenCalled()
  })
})
