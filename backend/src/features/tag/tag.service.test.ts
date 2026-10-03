import { describe, it, expect, vi } from 'vitest'
import * as tagModel from './tag.model'
import { listTags } from './tag.service'

vi.mock('./tag.model')

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
