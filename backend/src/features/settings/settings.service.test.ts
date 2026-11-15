import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

const GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com'

function googleResponse(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response
}

describe('connectChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  // Given a Google access token for the inbox being connected
  // When connecting Gmail
  // Then it should check tokeninfo, read the profile, and store the address and account id
  it('stores the Gmail address and Google account id from userinfo', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        googleResponse({
          aud: GOOGLE_CLIENT_ID,
          azp: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
        }),
      )
      .mockResolvedValueOnce(
        googleResponse({
          sub: 'google-sub-1',
          email: 'Inbox@Gmail.com',
          email_verified: true,
          name: 'Inbox',
        }),
      )

    await connectChannel('biz-1', 'GMAIL', 'user-1', 'google-token')

    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('https://oauth2.googleapis.com/tokeninfo')
    expect(vi.mocked(fetch).mock.calls[1][0]).toBe('https://www.googleapis.com/oauth2/v3/userinfo')
    expect(settingsModel.upsertConnectedChannel).toHaveBeenCalledWith(
      'biz-1',
      'GMAIL',
      'CONNECTED',
      'user-1',
      { accountEmail: 'inbox@gmail.com', providerAccountId: 'google-sub-1' },
    )
  })

  // Given a Gmail connect request without a Google token
  // When connecting it
  // Then it should reject the request before writing a channel row
  it('rejects Gmail connect when the Google token is missing', async () => {
    await expect(connectChannel('biz-1', 'GMAIL', 'user-1')).rejects.toMatchObject({
      statusCode: 400,
      code: 'MISSING_TOKEN',
    })

    expect(fetch).not.toHaveBeenCalled()
    expect(settingsModel.upsertConnectedChannel).not.toHaveBeenCalled()
  })

  // Given a Google profile whose email is not verified
  // When connecting Gmail
  // Then it should reject the request and leave the channel unchanged
  it('rejects Gmail connect when Google has not verified the email', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        googleResponse({
          aud: GOOGLE_CLIENT_ID,
          azp: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
        }),
      )
      .mockResolvedValueOnce(
        googleResponse({
          sub: 'google-sub-1',
          email: 'inbox@gmail.com',
          email_verified: false,
        }),
      )

    await expect(connectChannel('biz-1', 'GMAIL', 'user-1', 'google-token')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_TOKEN',
    })

    expect(settingsModel.upsertConnectedChannel).not.toHaveBeenCalled()
  })

  // Given a Google token that userinfo rejects
  // When connecting Gmail
  // Then it should reject the request and leave the channel unchanged
  it('rejects Gmail connect when Google rejects the token', async () => {
    vi.mocked(fetch).mockResolvedValue(googleResponse({}, false))

    await expect(connectChannel('biz-1', 'GMAIL', 'user-1', 'bad-token')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_TOKEN',
    })

    expect(settingsModel.upsertConnectedChannel).not.toHaveBeenCalled()
  })

  // Given a channel that is not Gmail
  // When connecting it
  // Then it should upsert CONNECTED without an account and without calling Google
  it('connects a non-Gmail channel without an account', async () => {
    await connectChannel('biz-1', 'OUTLOOK', 'user-1')

    expect(fetch).not.toHaveBeenCalled()
    expect(settingsModel.upsertConnectedChannel).toHaveBeenCalledWith(
      'biz-1',
      'OUTLOOK',
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
