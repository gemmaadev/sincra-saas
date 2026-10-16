import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authModel from '../auth/auth.model'
import * as settingsModel from './settings.model'
import {
  connectChannel,
  disconnectChannel,
  getBusinessSettings,
  updateBusinessSettings,
  getConnectedChannelsStatus,
  deleteAccount,
} from './settings.service'

vi.mock('../auth/auth.model')
vi.mock('./settings.model')

describe('connectChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business and a channel
  // When connecting it
  // Then it should upsert the ConnectedChannel row with status CONNECTED
  it('upserts the channel as CONNECTED', async () => {
    await connectChannel('biz-1', 'GMAIL', 'user-1')

    expect(settingsModel.upsertConnectedChannel).toHaveBeenCalledWith(
      'biz-1',
      'GMAIL',
      'CONNECTED',
      'user-1',
    )
  })
})

describe('disconnectChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business and a channel
  // When disconnecting it
  // Then it should upsert the ConnectedChannel row with status DISCONNECTED
  it('upserts the channel as DISCONNECTED', async () => {
    await disconnectChannel('biz-1', 'GMAIL', 'user-1')

    expect(settingsModel.upsertConnectedChannel).toHaveBeenCalledWith(
      'biz-1',
      'GMAIL',
      'DISCONNECTED',
      'user-1',
    )
  })
})

describe('getBusinessSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business that exists
  // When fetching its settings
  // Then it should return the business as-is
  it('returns the business', async () => {
    vi.mocked(authModel.findBusinessById).mockResolvedValue({ id: 'biz-1', name: 'Tienda' } as never)

    const business = await getBusinessSettings('biz-1')

    expect(business).toEqual({ id: 'biz-1', name: 'Tienda' })
  })

  // Given a business that doesn't exist
  // When fetching its settings
  // Then it should throw a 404 AppError
  it('throws a 404 AppError when the business does not exist', async () => {
    vi.mocked(authModel.findBusinessById).mockResolvedValue(null)

    await expect(getBusinessSettings('ghost-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'BUSINESS_NOT_FOUND',
    })
  })
})

describe('updateBusinessSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given new business data
  // When updating the settings
  // Then it should update the business and stamp updatedBy
  it('updates the business, stamping updatedBy', async () => {
    await updateBusinessSettings('biz-1', { name: 'Nuevo nombre' }, 'user-1')

    expect(authModel.updateBusiness).toHaveBeenCalledWith('biz-1', {
      name: 'Nuevo nombre',
      updatedBy: 'user-1',
    })
  })
})

describe('deleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business to delete
  // When deleting the account
  // Then it should soft-delete it by setting deletedAt, not a hard delete
  it('soft-deletes the business by setting deletedAt', async () => {
    await deleteAccount('biz-1', 'user-1')

    expect(authModel.updateBusiness).toHaveBeenCalledWith(
      'biz-1',
      expect.objectContaining({ deletedAt: expect.any(Date), updatedBy: 'user-1' }),
    )
  })
})

describe('getConnectedChannelsStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given Gmail connected and Outlook never touched
  // When reading the channels status
  // Then all 5 channels should be returned, with Gmail CONNECTED and Outlook
  // defaulting to DISCONNECTED since it has no stored row
  it('returns real status for Gmail/Outlook, defaulting to DISCONNECTED when unset', async () => {
    vi.mocked(settingsModel.findConnectedChannels).mockResolvedValue([
      { channel: 'GMAIL', status: 'CONNECTED' },
    ] as never)

    const channels = await getConnectedChannelsStatus('biz-1')

    expect(channels).toEqual(
      expect.arrayContaining([
        { channel: 'GMAIL', status: 'CONNECTED' },
        { channel: 'OUTLOOK', status: 'DISCONNECTED' },
      ]),
    )
  })

  // Given WhatsApp/Instagram/Messenger have no real integration
  // When reading the channels status
  // Then they should always report MOCKED, even if a CONNECTED row exists for one of them
  it('always reports MOCKED for WhatsApp/Instagram/Messenger, regardless of any stored row', async () => {
    vi.mocked(settingsModel.findConnectedChannels).mockResolvedValue([
      { channel: 'WHATSAPP', status: 'CONNECTED' },
    ] as never)

    const channels = await getConnectedChannelsStatus('biz-1')

    expect(channels).toEqual(
      expect.arrayContaining([
        { channel: 'WHATSAPP', status: 'MOCKED' },
        { channel: 'INSTAGRAM', status: 'MOCKED' },
        { channel: 'MESSENGER', status: 'MOCKED' },
      ]),
    )
  })

  // Given no channels have ever been touched
  // When reading the channels status
  // Then it should still return all 5 channels, not an empty list
  it('returns all 5 channels even when none have a stored row', async () => {
    vi.mocked(settingsModel.findConnectedChannels).mockResolvedValue([])

    const channels = await getConnectedChannelsStatus('biz-1')

    expect(channels).toHaveLength(5)
  })
})
