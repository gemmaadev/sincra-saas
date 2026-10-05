import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppError } from '../../shared/AppError'
import * as clientModel from './client.model'
import { getUniqueViolationFields } from '../../shared/utils/prismaErrors'
import * as tagModel from '../tag/tag.model'
import * as authModel from '../auth/auth.model'
import { geocodeAddress } from '../../shared/services/geocoding.service'
import {
  listClients,
  createClient,
  updateClient,
  deleteClient,
  assignTagToClient,
  removeTagFromClient,
} from './client.service'

vi.mock('./client.model')
vi.mock('../tag/tag.model')
vi.mock('../auth/auth.model')
vi.mock('../../shared/services/geocoding.service')
vi.mock('../../shared/utils/prismaErrors')

describe('listClients', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(clientModel.findClientsPage).mockResolvedValue([])
  })

  // Given a business with 2 clients, 1 of them created in the last 30 days
  // When listClients is called
  // Then newClientsCount comes from a count restricted to the last 30 days
  it('counts only clients created in the last 30 days as new', async () => {
    vi.mocked(clientModel.countClients).mockResolvedValueOnce(2).mockResolvedValueOnce(1)

    const result = await listClients('business-1', {})

    expect(result.pagination.total).toBe(2)
    expect(result.newClientsCount).toBe(1)
    const newClientsWhere = vi.mocked(clientModel.countClients).mock.calls[1][0]
    expect(newClientsWhere.businessId).toBe('business-1')
    expect(newClientsWhere.createdAt).toEqual({ gte: expect.any(Date) })
  })

  // Given a search term and a channel filter
  // When listClients is called
  // Then the where clause is scoped to the business and includes both filters
  it('builds the where clause from the filters', async () => {
    vi.mocked(clientModel.countClients).mockResolvedValue(0)

    await listClients('business-1', { channel: 'EMAIL', search: 'ana' })

    const where = vi.mocked(clientModel.findClientsPage).mock.calls[0][0]
    expect(where.businessId).toBe('business-1')
    expect(where.channels).toEqual({ has: 'EMAIL' })
    expect(where.OR).toHaveLength(3)
  })
})

describe('createClient', () => {
  beforeEach(() => vi.resetAllMocks())

  // Given no channels in the input
  // When createClient is called
  // Then channels default to an empty list
  it('defaults channels to an empty list', async () => {
    await createClient('business-1', { name: 'Ana' })

    expect(clientModel.insertClient).toHaveBeenCalledWith(
      expect.objectContaining({ businessId: 'business-1', name: 'Ana', channels: [] }),
    )
  })
})

describe('createClient geocoding', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(authModel.findBusinessCountry).mockResolvedValue('ES')
  })

  // Given an address and a zone without coordinates, in a Spanish business
  // When createClient is called
  // Then the address is geocoded with the business country and the coordinates are saved
  it('saves the geocoded coordinates when none are given', async () => {
    vi.mocked(geocodeAddress).mockResolvedValue({ latitude: 41.5467, longitude: 2.1044 })

    await createClient('business-1', {
      name: 'Ana',
      address: 'Carrer de Sant Pau 33',
      zone: 'Sabadell',
    })

    expect(authModel.findBusinessCountry).toHaveBeenCalledWith('business-1')
    expect(geocodeAddress).toHaveBeenCalledWith({
      address: 'Carrer de Sant Pau 33',
      zone: 'Sabadell',
      countryCode: 'ES',
    })
    expect(clientModel.insertClient).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 41.5467, longitude: 2.1044 }),
    )
  })

  // Given only a zone
  // When createClient is called
  // Then the zone is geocoded
  it('geocodes by zone when there is no address', async () => {
    vi.mocked(geocodeAddress).mockResolvedValue({ latitude: 41.5, longitude: 2.1 })

    await createClient('business-1', { name: 'Ana', zone: 'Sabadell' })

    expect(geocodeAddress).toHaveBeenCalledWith(
      expect.objectContaining({ address: undefined, zone: 'Sabadell' }),
    )
  })

  // Given the client already comes with coordinates
  // When createClient is called
  // Then they are kept and nothing is geocoded
  it('keeps the given coordinates without geocoding', async () => {
    await createClient('business-1', {
      name: 'Ana',
      address: 'Carrer de Sant Pau 33',
      latitude: 41.1,
      longitude: 2.2,
    })

    expect(geocodeAddress).not.toHaveBeenCalled()
    expect(clientModel.insertClient).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 41.1, longitude: 2.2 }),
    )
  })

  // Given neither address nor zone
  // When createClient is called
  // Then there is nothing to geocode
  it('does not geocode a client without address or zone', async () => {
    await createClient('business-1', { name: 'Ana', address: '  ' })

    expect(geocodeAddress).not.toHaveBeenCalled()
    expect(authModel.findBusinessCountry).not.toHaveBeenCalled()
  })

  // Given the geocoder finds nothing
  // When createClient is called
  // Then the client is still created, without coordinates
  it('creates the client without coordinates when geocoding fails', async () => {
    vi.mocked(geocodeAddress).mockResolvedValue(null)

    await createClient('business-1', { name: 'Ana', zone: 'Sabadell' })

    expect(clientModel.insertClient).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ana', latitude: undefined, longitude: undefined }),
    )
  })
})

describe('updateClient / deleteClient', () => {
  beforeEach(() => vi.resetAllMocks())

  // Given a client that does not belong to the business
  // When it is updated or deleted
  // Then a 404 CLIENT_NOT_FOUND is thrown and nothing is written
  it('throws CLIENT_NOT_FOUND when the client is not found', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue(null)

    await expect(updateClient('business-1', 'client-1', { name: 'Ana' })).rejects.toMatchObject({
      statusCode: 404,
      code: 'CLIENT_NOT_FOUND',
    })
    await expect(deleteClient('business-1', 'client-1')).rejects.toBeInstanceOf(AppError)
    expect(clientModel.updateClientById).not.toHaveBeenCalled()
    expect(clientModel.deleteClientById).not.toHaveBeenCalled()
  })

  // Given an existing client
  // When it is updated and deleted
  // Then the model writes are called with the client id
  it('writes through the model when the client exists', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)

    await updateClient('business-1', 'client-1', { name: 'Ana' })
    await deleteClient('business-1', 'client-1')

    expect(clientModel.updateClientById).toHaveBeenCalledWith('client-1', { name: 'Ana' })
    expect(clientModel.deleteClientById).toHaveBeenCalledWith('client-1')
  })
})

describe('duplicated clients', () => {
  beforeEach(() => vi.resetAllMocks())

  // Given the database rejects a new client because its email is already used
  // When createClient is called
  // Then a 409 DUPLICATE_CLIENT error naming the email should be thrown
  it('rejects a duplicated email when creating', async () => {
    const databaseError = new Error('unique')
    vi.mocked(clientModel.insertClient).mockRejectedValue(databaseError)
    vi.mocked(getUniqueViolationFields).mockReturnValue(['businessId', 'email'])

    await expect(
      createClient('business-1', { name: 'Ana', email: 'a@a.com' }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'DUPLICATE_CLIENT',
      message: 'Ya existe un cliente con ese email',
    })
  })

  // Given the database rejects an update because the phone is already used
  // When updateClient is called
  // Then a 409 DUPLICATE_CLIENT error naming the phone should be thrown
  it('rejects a duplicated phone when updating', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)
    vi.mocked(clientModel.updateClientById).mockRejectedValue(new Error('unique'))
    vi.mocked(getUniqueViolationFields).mockReturnValue(['businessId', 'phone'])

    await expect(updateClient('business-1', 'client-1', { phone: '600' })).rejects.toMatchObject({
      statusCode: 409,
      message: 'Ya existe un cliente con ese teléfono',
    })
  })

  // Given a failure that is not a unique violation
  // When createClient is called
  // Then the original error should be rethrown untouched
  it('rethrows errors that are not duplicates', async () => {
    const databaseError = new Error('connection lost')
    vi.mocked(clientModel.insertClient).mockRejectedValue(databaseError)
    vi.mocked(getUniqueViolationFields).mockReturnValue(null)

    await expect(createClient('business-1', { name: 'Ana' })).rejects.toBe(databaseError)
  })
})

describe('assignTagToClient', () => {
  beforeEach(() => vi.resetAllMocks())

  // Given a client and a tag of the same business, not assigned yet
  // When the tag is assigned
  // Then a new assignment is created
  it('assigns the tag to the client', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)
    vi.mocked(tagModel.findTagById).mockResolvedValue({ id: 'tag-1' } as never)
    vi.mocked(clientModel.findActiveClientTag).mockResolvedValue(null)

    await assignTagToClient('business-1', 'client-1', 'tag-1')

    expect(tagModel.findTagById).toHaveBeenCalledWith('business-1', 'tag-1')
    expect(clientModel.insertClientTag).toHaveBeenCalledWith('client-1', 'tag-1')
  })

  // Given a client that is not in the business
  // When a tag is assigned
  // Then CLIENT_NOT_FOUND is thrown and nothing is created
  it('throws CLIENT_NOT_FOUND when the client is not in the business', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue(null)

    await expect(assignTagToClient('business-1', 'client-1', 'tag-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'CLIENT_NOT_FOUND',
    })
    expect(clientModel.insertClientTag).not.toHaveBeenCalled()
  })

  // Given a tag that belongs to another business
  // When it is assigned
  // Then TAG_NOT_FOUND is thrown and nothing is created
  it('throws TAG_NOT_FOUND when the tag is not in the business', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)
    vi.mocked(tagModel.findTagById).mockResolvedValue(null)

    await expect(assignTagToClient('business-1', 'client-1', 'tag-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'TAG_NOT_FOUND',
    })
    expect(clientModel.insertClientTag).not.toHaveBeenCalled()
  })

  // Given the client already has that tag active
  // When it is assigned again
  // Then a 409 TAG_ALREADY_ASSIGNED is thrown and no duplicate is created
  it('rejects a tag that is already assigned', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)
    vi.mocked(tagModel.findTagById).mockResolvedValue({ id: 'tag-1' } as never)
    vi.mocked(clientModel.findActiveClientTag).mockResolvedValue({ id: 'assignment-1' } as never)

    await expect(assignTagToClient('business-1', 'client-1', 'tag-1')).rejects.toMatchObject({
      statusCode: 409,
      code: 'TAG_ALREADY_ASSIGNED',
    })
    expect(clientModel.insertClientTag).not.toHaveBeenCalled()
  })
})

describe('removeTagFromClient', () => {
  beforeEach(() => vi.resetAllMocks())

  // Given a client with an active assignment of the tag
  // When the tag is removed
  // Then the assignment is marked as removed (the row is kept)
  it('marks the assignment as removed', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)
    vi.mocked(clientModel.findActiveClientTag).mockResolvedValue({ id: 'assignment-1' } as never)

    await removeTagFromClient('business-1', 'client-1', 'tag-1')

    expect(clientModel.findActiveClientTag).toHaveBeenCalledWith('client-1', 'tag-1')
    expect(clientModel.markClientTagRemoved).toHaveBeenCalledWith('assignment-1')
  })

  // Given a client that does not have that tag active
  // When the tag is removed
  // Then CLIENT_TAG_NOT_FOUND is thrown
  it('throws CLIENT_TAG_NOT_FOUND when the client does not have the tag', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)
    vi.mocked(clientModel.findActiveClientTag).mockResolvedValue(null)

    await expect(removeTagFromClient('business-1', 'client-1', 'tag-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'CLIENT_TAG_NOT_FOUND',
    })
    expect(clientModel.markClientTagRemoved).not.toHaveBeenCalled()
  })

  // Given a client that is not in the business
  // When a tag is removed
  // Then CLIENT_NOT_FOUND is thrown
  it('throws CLIENT_NOT_FOUND when the client is not in the business', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue(null)

    await expect(removeTagFromClient('business-1', 'client-1', 'tag-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'CLIENT_NOT_FOUND',
    })
  })
})
