import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authModel from '../auth/auth.model'
import * as gmailToken from './gmail-token'
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
vi.mock('./gmail-token', () => ({
  verifyGmailAccessToken: vi.fn(),
}))

describe('connectChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given an Outlook address with spaces and capitals
  // When connecting that channel
  // Then the stored email is trimmed and lowercase
  it('saves a non-Gmail account email trimmed and in lowercase', async () => {
    await connectChannel('biz-1', 'OUTLOOK', 'user-1', {
      accountEmail: '  Tienda@Outlook.com ',
    })

    expect(settingsModel.upsertConnectedChannel).toHaveBeenCalledWith(
      'biz-1',
      'OUTLOOK',
      'CONNECTED',
      'user-1',
      { accountEmail: 'tienda@outlook.com' },
    )
  })

  // Given a missing or invalid account email
  // When connecting a channel that is not Gmail
  // Then it rejects the request and does not write a row
  it('rejects a non-Gmail channel without a valid email', async () => {
    await expect(connectChannel('biz-1', 'OUTLOOK', 'user-1')).rejects.toMatchObject({
      code: 'ACCOUNT_EMAIL_REQUIRED',
    })
    await expect(
      connectChannel('biz-1', 'OUTLOOK', 'user-1', { accountEmail: 'no-es-un-email' }),
    ).rejects.toMatchObject({ code: 'INVALID_ACCOUNT_EMAIL' })
    expect(settingsModel.upsertConnectedChannel).not.toHaveBeenCalled()
  })

  // Given a verified Google token and a different email sent by the client
  // When connecting Gmail
  // Then only the verified Google email and sub are stored
  it('saves the Gmail email and sub after the token is verified', async () => {
    vi.mocked(gmailToken.verifyGmailAccessToken).mockResolvedValue({
      email: 'tienda@gmail.com',
      sub: 'sub-1',
    })

    await connectChannel('biz-1', 'GMAIL', 'user-1', {
      accessToken: 'token-1',
      accountEmail: 'otro@gmail.com',
    })

    expect(gmailToken.verifyGmailAccessToken).toHaveBeenCalledWith('token-1')
    expect(settingsModel.upsertConnectedChannel).toHaveBeenCalledWith(
      'biz-1',
      'GMAIL',
      'CONNECTED',
      'user-1',
      { accountEmail: 'tienda@gmail.com', providerAccountId: 'sub-1' },
    )
  })

  // Given a missing or rejected Gmail token
  // When connecting Gmail
  // Then nothing is stored
  it('does not save Gmail when the token is missing or rejected', async () => {
    await expect(connectChannel('biz-1', 'GMAIL', 'user-1')).rejects.toMatchObject({
      code: 'GMAIL_TOKEN_REQUIRED',
    })

    vi.mocked(gmailToken.verifyGmailAccessToken).mockRejectedValue(
      Object.assign(new Error('No se pudo verificar la cuenta de Gmail'), {
        code: 'GMAIL_TOKEN_INVALID',
      }),
    )
    await expect(
      connectChannel('biz-1', 'GMAIL', 'user-1', { accessToken: 'bad-token' }),
    ).rejects.toMatchObject({
      code: 'GMAIL_TOKEN_INVALID',
    })
    expect(settingsModel.upsertConnectedChannel).not.toHaveBeenCalled()
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
    vi.mocked(authModel.findBusinessById).mockResolvedValue({
      id: 'biz-1',
      name: 'Tienda',
    } as never)

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

    expect(settingsModel.findConnectedChannels).toHaveBeenCalledWith('biz-1')
    expect(channels).toEqual(
      expect.arrayContaining([
        { channel: 'GMAIL', status: 'CONNECTED', accountEmail: null },
        { channel: 'OUTLOOK', status: 'DISCONNECTED', accountEmail: null },
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
        { channel: 'WHATSAPP', status: 'MOCKED', accountEmail: null },
        { channel: 'INSTAGRAM', status: 'MOCKED', accountEmail: null },
        { channel: 'MESSENGER', status: 'MOCKED', accountEmail: null },
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
    expect(channels.every((channel) => channel.accountEmail === null)).toBe(true)
  })

  // Given this business has a connected Gmail with a mixed-case email, a connected
  // Outlook with a blank email, and a mocked channel that still stores an address
  // When reading the channels status
  // Then only the real connection exposes the email, trimmed and lowercased
  it('returns the connected account email in lowercase for this business only', async () => {
    vi.mocked(settingsModel.findConnectedChannels).mockResolvedValue([
      { channel: 'GMAIL', status: 'CONNECTED', accountEmail: '  Tienda@Gmail.com ' },
      { channel: 'OUTLOOK', status: 'CONNECTED', accountEmail: '   ' },
      { channel: 'WHATSAPP', status: 'CONNECTED', accountEmail: 'wa@negocio.com' },
    ] as never)

    const channels = await getConnectedChannelsStatus('biz-1')

    expect(settingsModel.findConnectedChannels).toHaveBeenCalledWith('biz-1')
    expect(channels).toEqual([
      { channel: 'GMAIL', status: 'CONNECTED', accountEmail: 'tienda@gmail.com' },
      { channel: 'OUTLOOK', status: 'CONNECTED', accountEmail: null },
      { channel: 'WHATSAPP', status: 'MOCKED', accountEmail: null },
      { channel: 'INSTAGRAM', status: 'MOCKED', accountEmail: null },
      { channel: 'MESSENGER', status: 'MOCKED', accountEmail: null },
    ])
  })

  // Given a disconnected channel that still stores an address
  // When reading the channels status for that business
  // Then the address is not exposed
  it('hides a stored email once the channel is disconnected', async () => {
    vi.mocked(settingsModel.findConnectedChannels).mockResolvedValue([
      { channel: 'OUTLOOK', status: 'DISCONNECTED', accountEmail: 'Vieja@Outlook.com' },
    ] as never)

    const channels = await getConnectedChannelsStatus('biz-2')

    expect(settingsModel.findConnectedChannels).toHaveBeenCalledWith('biz-2')
    expect(channels.find((channel) => channel.channel === 'OUTLOOK')).toEqual({
      channel: 'OUTLOOK',
      status: 'DISCONNECTED',
      accountEmail: null,
    })
  })
})
