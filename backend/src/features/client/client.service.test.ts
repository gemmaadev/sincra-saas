import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppError } from '../../shared/AppError'
import * as clientModel from './client.model'
import { getUniqueViolationFields } from '../../shared/utils/prismaErrors'
import * as tagModel from '../tag/tag.model'
import * as authModel from '../auth/auth.model'
import * as orderModel from '../order/order.model'
import { geocodeAddress, searchAddresses } from '../../shared/services/geocoding.service'
import {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  assignTagToClient,
  removeTagFromClient,
  searchClientAddress,
} from './client.service'

vi.mock('./client.model')
vi.mock('../tag/tag.model')
vi.mock('../auth/auth.model')
vi.mock('../order/order.model')
vi.mock('../../shared/services/geocoding.service')
vi.mock('../../shared/utils/prismaErrors')

describe('listClients', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(clientModel.findClientsPage).mockResolvedValue([])
    vi.mocked(clientModel.countRecurringClients).mockResolvedValue(0)
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

  // Given a business with some repeat buyers and some clients with no orders at all
  // When listClients is called
  // Then recurringClientsCount and potentialClientsCount come from their own counts
  it('counts recurring and potential clients separately from the total', async () => {
    vi.mocked(clientModel.countClients)
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(2) // newClientsCount
      .mockResolvedValueOnce(4) // potentialClientsCount
    vi.mocked(clientModel.countRecurringClients).mockResolvedValue(3)

    const result = await listClients('business-1', {})

    expect(result.recurringClientsCount).toBe(3)
    expect(result.potentialClientsCount).toBe(4)
    const potentialWhere = vi.mocked(clientModel.countClients).mock.calls[2][0]
    expect(potentialWhere.orders).toEqual({ none: {} })
  })

  // Given a client row with its order count and most recent order from Prisma's raw include shape
  // When listClients maps it for the response
  // Then it should expose clean orderCount/lastOrderAt fields instead of Prisma's _count/orders
  it('maps the order count and most recent order date for each client row', async () => {
    vi.mocked(clientModel.findClientsPage).mockResolvedValue([
      {
        id: 'client-1',
        name: 'Laura García',
        _count: { orders: 5 },
        orders: [{ createdAt: new Date('2026-10-07') }],
      },
      {
        id: 'client-2',
        name: 'Carlos Ruiz',
        _count: { orders: 0 },
        orders: [],
      },
    ] as never)

    const result = await listClients('business-1', {})

    expect(result.data[0]).toMatchObject({
      id: 'client-1',
      orderCount: 5,
      lastOrderAt: new Date('2026-10-07'),
    })
    expect(result.data[0]).not.toHaveProperty('_count')
    expect(result.data[0]).not.toHaveProperty('orders')
    expect(result.data[1]).toMatchObject({ id: 'client-2', orderCount: 0, lastOrderAt: null })
  })

  // Given an active channel filter on the list
  // When listClients is called
  // Then recurringClientsCount should be scoped to that same filter, not the whole business
  it('scopes recurringClientsCount to the active filters', async () => {
    vi.mocked(clientModel.countClients).mockResolvedValue(0)
    vi.mocked(clientModel.countRecurringClients).mockResolvedValue(0)

    await listClients('business-1', { channel: 'WHATSAPP' })

    expect(clientModel.countRecurringClients).toHaveBeenCalledWith(
      expect.objectContaining({ businessId: 'business-1', channels: { has: 'WHATSAPP' } }),
    )
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

describe('getClientById', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Given a client whose orders mix one with its own description and one without
  // When the client detail is fetched
  // Then each order should expose a resolved description (its own, or a summary of its items)
  // and the raw items should not leak into the response
  it('resolves a description for each order and drops the raw items', async () => {
    vi.mocked(clientModel.findClientWithDetails).mockResolvedValue({
      id: 'client-1',
      orders: [
        { id: 'order-1', description: 'Pedido de temporada', items: [{ product: 'Camiseta', quantity: 1 }] },
        {
          id: 'order-2',
          description: null,
          items: [
            { product: 'Chaqueta oversize', quantity: 2 },
            { product: 'Bolso de piel', quantity: 1 },
          ],
        },
      ],
    } as never)

    const result = await getClientById('business-1', 'client-1')

    expect(result?.orders[0]).toMatchObject({ description: 'Pedido de temporada' })
    expect(result?.orders[1]).toMatchObject({
      description: 'Chaqueta oversize x2, Bolso de piel',
    })
    expect(result?.orders[0]).not.toHaveProperty('items')
  })

  // Given a client id that does not exist
  // When the client detail is fetched
  // Then null should be returned as-is, without trying to map its (nonexistent) orders
  it('returns null when the client does not exist', async () => {
    vi.mocked(clientModel.findClientWithDetails).mockResolvedValue(null)

    expect(await getClientById('business-1', 'missing')).toBeNull()
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

  // Given an existing client with no orders
  // When it is updated and deleted
  // Then the model writes are called with the client id
  it('writes through the model when the client exists', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)
    vi.mocked(orderModel.countOrdersByClientId).mockResolvedValue(0)

    await updateClient('business-1', 'client-1', { name: 'Ana' })
    await deleteClient('business-1', 'client-1')

    expect(clientModel.updateClientById).toHaveBeenCalledWith('client-1', { name: 'Ana' })
    expect(clientModel.deleteClientById).toHaveBeenCalledWith('client-1')
  })

  // Given a client that still has orders
  // When it is deleted
  // Then a 409 CLIENT_HAS_ORDERS is thrown and nothing is deleted
  it('throws CLIENT_HAS_ORDERS when the client still has orders', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue({ id: 'client-1' } as never)
    vi.mocked(orderModel.countOrdersByClientId).mockResolvedValue(2)

    await expect(deleteClient('business-1', 'client-1')).rejects.toMatchObject({
      statusCode: 409,
      code: 'CLIENT_HAS_ORDERS',
    })
    expect(clientModel.deleteClientById).not.toHaveBeenCalled()
  })
})

describe('searchClientAddress', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(authModel.findBusinessCountry).mockResolvedValue('ES')
  })

  // Given a business in Spain and an address query
  // When the address is searched
  // Then the candidates should come from the geocoder, restricted to the business country
  it('searches the addresses in the business country', async () => {
    const candidates = [
      {
        label: 'x',
        address: 'Carrer de Balmes 71',
        zone: 'Manresa',
        latitude: 41.7,
        longitude: 1.8,
      },
    ]
    vi.mocked(searchAddresses).mockResolvedValue(candidates)

    const result = await searchClientAddress('business-1', 'Carrer de Balmes 71, Manresa')

    expect(authModel.findBusinessCountry).toHaveBeenCalledWith('business-1')
    expect(searchAddresses).toHaveBeenCalledWith('Carrer de Balmes 71, Manresa', 'ES')
    expect(result).toEqual(candidates)
  })

  // Given the search finds nothing
  // When the address is searched
  // Then an empty list should be returned
  it('returns an empty list when there are no matches', async () => {
    vi.mocked(searchAddresses).mockResolvedValue([])

    expect(await searchClientAddress('business-1', 'Nowhere 1')).toEqual([])
  })

  // Given the geocoder is unavailable
  // When the address is searched
  // Then a 502 GEOCODING_UNAVAILABLE error should be thrown
  it('throws a 502 when the geocoder is unavailable', async () => {
    vi.mocked(searchAddresses).mockResolvedValue(null)

    await expect(searchClientAddress('business-1', 'Rambla Nova')).rejects.toMatchObject({
      statusCode: 502,
      code: 'GEOCODING_UNAVAILABLE',
    })
  })
})

describe('updateClient geocoding', () => {
  const existingClient = {
    id: 'client-1',
    address: 'Carrer Major 1',
    zone: 'Sabadell',
  }

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(authModel.findBusinessCountry).mockResolvedValue('ES')
    vi.mocked(clientModel.findClientById).mockResolvedValue(existingClient as never)
  })

  // Given a client in Sabadell
  // When its zone changes to Barcelona
  // Then the new location is geocoded (keeping the old address) and the coordinates are updated
  it('recalculates the coordinates when the zone changes', async () => {
    vi.mocked(geocodeAddress).mockResolvedValue({ latitude: 41.38, longitude: 2.17 })

    await updateClient('business-1', 'client-1', { zone: 'Barcelona' })

    expect(geocodeAddress).toHaveBeenCalledWith({
      address: 'Carrer Major 1',
      zone: 'Barcelona',
      countryCode: 'ES',
    })
    expect(clientModel.updateClientById).toHaveBeenCalledWith('client-1', {
      zone: 'Barcelona',
      latitude: 41.38,
      longitude: 2.17,
    })
  })

  // Given a client
  // When its address changes
  // Then the new address is geocoded with the current zone
  it('recalculates the coordinates when the address changes', async () => {
    vi.mocked(geocodeAddress).mockResolvedValue({ latitude: 41.5, longitude: 2.1 })

    await updateClient('business-1', 'client-1', { address: 'Carrer Nou 5' })

    expect(geocodeAddress).toHaveBeenCalledWith(
      expect.objectContaining({ address: 'Carrer Nou 5', zone: 'Sabadell' }),
    )
  })

  // Given a client
  // When the update sends the same address and zone, or neither
  // Then nothing is geocoded and no coordinates are written
  it('does not geocode when the address and zone are unchanged', async () => {
    await updateClient('business-1', 'client-1', {
      name: 'Ana',
      address: 'Carrer Major 1',
      zone: 'Sabadell',
    })

    expect(geocodeAddress).not.toHaveBeenCalled()
    expect(clientModel.updateClientById).toHaveBeenCalledWith('client-1', {
      name: 'Ana',
      address: 'Carrer Major 1',
      zone: 'Sabadell',
    })
  })

  // Given the update brings its own coordinates (e.g. picked on the map)
  // When the zone changes too
  // Then the given coordinates are kept and nothing is geocoded
  it('keeps the given coordinates without geocoding', async () => {
    await updateClient('business-1', 'client-1', {
      zone: 'Barcelona',
      latitude: 41.1,
      longitude: 2.2,
    })

    expect(geocodeAddress).not.toHaveBeenCalled()
    expect(clientModel.updateClientById).toHaveBeenCalledWith('client-1', {
      zone: 'Barcelona',
      latitude: 41.1,
      longitude: 2.2,
    })
  })

  // Given the geocoder finds nothing
  // When the zone changes
  // Then the change is saved and the old coordinates are left untouched
  it('saves the change without touching the coordinates when geocoding fails', async () => {
    vi.mocked(geocodeAddress).mockResolvedValue(null)

    await updateClient('business-1', 'client-1', { zone: 'Barcelona' })

    expect(clientModel.updateClientById).toHaveBeenCalledWith('client-1', { zone: 'Barcelona' })
  })

  // Given a client with an address and a zone
  // When both are cleared
  // Then there is nothing to geocode
  it('does not geocode when both address and zone are cleared', async () => {
    await updateClient('business-1', 'client-1', { address: null, zone: null })

    expect(geocodeAddress).not.toHaveBeenCalled()
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
