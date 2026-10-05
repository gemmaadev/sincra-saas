import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../config/db'
import {
  findTagsByBusiness,
  findTagById,
  insertTag,
  updateTagById,
  deleteTagById,
} from './tag.model'

vi.mock('../../config/db', () => ({
  default: {
    tag: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('tag model', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business
  // When its tags are listed
  // Then only that business's tags should be requested, default tags first and then by name
  it('lists the tags of the business, default ones first', async () => {
    await findTagsByBusiness('business-1')

    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      where: { businessId: 'business-1' },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    })
  })

  // Given a tag id and a business
  // When the tag is looked up
  // Then it should be filtered by the business too, so another business's tag is never found
  it('finds a tag only inside the business', async () => {
    await findTagById('business-1', 'tag-1')

    expect(prisma.tag.findUnique).toHaveBeenCalledWith({
      where: { id: 'tag-1', businessId: 'business-1' },
    })
  })

  // Given the data of a new tag
  // When it is inserted
  // Then it should be created with exactly that data
  it('creates a tag with the given data', async () => {
    const data = { businessId: 'business-1', name: 'VIP', color: '#112233', createdBy: 'user-1' }

    await insertTag(data)

    expect(prisma.tag.create).toHaveBeenCalledWith({ data })
  })

  // Given a tag id
  // When it is updated or deleted
  // Then the operation should target that id
  it('updates and deletes a tag by id', async () => {
    await updateTagById('tag-1', { name: 'Nuevo' })
    await deleteTagById('tag-1')

    expect(prisma.tag.update).toHaveBeenCalledWith({
      where: { id: 'tag-1' },
      data: { name: 'Nuevo' },
    })
    expect(prisma.tag.delete).toHaveBeenCalledWith({ where: { id: 'tag-1' } })
  })
})
