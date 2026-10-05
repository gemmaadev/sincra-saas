import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as tagModel from './tag.model'
import { getUniqueViolationFields } from '../../shared/utils/prismaErrors'
import { listTags, createTag, updateTag, deleteTag } from './tag.service'

vi.mock('./tag.model')
vi.mock('../../shared/utils/prismaErrors')

beforeEach(() => vi.resetAllMocks())

describe('listTags', () => {
  // Given a business with tags
  // When listTags is called
  // Then it returns what the model finds for that business
  it('returns the tags of the business', async () => {
    const tags = [{ id: 'tag-1', name: 'VIP' }]
    vi.mocked(tagModel.findTagsByBusiness).mockResolvedValue(tags as never)

    expect(await listTags('business-1')).toEqual(tags)
    expect(tagModel.findTagsByBusiness).toHaveBeenCalledWith('business-1')
  })
})

describe('createTag', () => {
  // Given valid data and the user who creates the tag
  // When createTag is called
  // Then it is inserted for that business and records who created it
  it('creates the tag for the business with its creator', async () => {
    await createTag('business-1', 'user-1', { name: 'Mayorista', color: '#112233' })

    expect(tagModel.insertTag).toHaveBeenCalledWith({
      businessId: 'business-1',
      createdBy: 'user-1',
      name: 'Mayorista',
      color: '#112233',
      priority: undefined,
    })
  })

  // Given the business already has a tag with that name
  // When createTag is called
  // Then a 409 DUPLICATE_TAG error is thrown
  it('rejects a duplicated name', async () => {
    vi.mocked(tagModel.insertTag).mockRejectedValue(new Error('unique'))
    vi.mocked(getUniqueViolationFields).mockReturnValue(['businessId', 'name'])

    await expect(
      createTag('business-1', 'user-1', { name: 'VIP', color: '#112233' }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'DUPLICATE_TAG' })
  })

  // Given a failure that is not a unique violation
  // When createTag is called
  // Then the original error is rethrown
  it('rethrows errors that are not duplicates', async () => {
    const databaseError = new Error('connection lost')
    vi.mocked(tagModel.insertTag).mockRejectedValue(databaseError)
    vi.mocked(getUniqueViolationFields).mockReturnValue(null)

    await expect(createTag('business-1', 'user-1', { name: 'VIP', color: '#112233' })).rejects.toBe(
      databaseError,
    )
  })
})

describe('updateTag', () => {
  // Given a tag that does not belong to the business
  // When updateTag is called
  // Then a 404 TAG_NOT_FOUND error is thrown and nothing is written
  it('throws TAG_NOT_FOUND when the tag is not in the business', async () => {
    vi.mocked(tagModel.findTagById).mockResolvedValue(null)

    await expect(updateTag('business-1', 'tag-1', { name: 'Nuevo' })).rejects.toMatchObject({
      statusCode: 404,
      code: 'TAG_NOT_FOUND',
    })
    expect(tagModel.updateTagById).not.toHaveBeenCalled()
  })

  // Given an existing tag
  // When it is updated
  // Then the model writes the changes by id
  it('updates an existing tag', async () => {
    vi.mocked(tagModel.findTagById).mockResolvedValue({ id: 'tag-1' } as never)

    await updateTag('business-1', 'tag-1', { name: 'Nuevo', color: '#445566' })

    expect(tagModel.updateTagById).toHaveBeenCalledWith('tag-1', {
      name: 'Nuevo',
      color: '#445566',
    })
  })

  // Given the new name is already used by another tag
  // When updateTag is called
  // Then a 409 DUPLICATE_TAG error is thrown
  it('rejects renaming to a name that already exists', async () => {
    vi.mocked(tagModel.findTagById).mockResolvedValue({ id: 'tag-1' } as never)
    vi.mocked(tagModel.updateTagById).mockRejectedValue(new Error('unique'))
    vi.mocked(getUniqueViolationFields).mockReturnValue(['businessId', 'name'])

    await expect(updateTag('business-1', 'tag-1', { name: 'VIP' })).rejects.toMatchObject({
      statusCode: 409,
      code: 'DUPLICATE_TAG',
    })
  })
})

describe('deleteTag', () => {
  // Given a tag that does not belong to the business
  // When deleteTag is called
  // Then a 404 TAG_NOT_FOUND error is thrown and nothing is deleted
  it('throws TAG_NOT_FOUND when the tag is not in the business', async () => {
    vi.mocked(tagModel.findTagById).mockResolvedValue(null)

    await expect(deleteTag('business-1', 'tag-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'TAG_NOT_FOUND',
    })
    expect(tagModel.deleteTagById).not.toHaveBeenCalled()
  })

  // Given an existing tag
  // When it is deleted
  // Then the model deletes it by id
  it('deletes an existing tag', async () => {
    vi.mocked(tagModel.findTagById).mockResolvedValue({ id: 'tag-1' } as never)

    await deleteTag('business-1', 'tag-1')

    expect(tagModel.deleteTagById).toHaveBeenCalledWith('tag-1')
  })
})
