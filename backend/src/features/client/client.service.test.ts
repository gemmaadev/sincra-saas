import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppError } from '../../shared/AppError'
import * as clientModel from './client.model'
import { listClients, createClient, updateClient, deleteClient } from './client.service'

vi.mock('./client.model')

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
    vi.mocked(clientModel.getUniqueViolationFields).mockReturnValue(['businessId', 'email'])

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
    vi.mocked(clientModel.getUniqueViolationFields).mockReturnValue(['businessId', 'phone'])

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
    vi.mocked(clientModel.getUniqueViolationFields).mockReturnValue(null)

    await expect(createClient('business-1', { name: 'Ana' })).rejects.toBe(databaseError)
  })
})
