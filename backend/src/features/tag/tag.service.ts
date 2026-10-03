import { findTagsByBusiness } from './tag.model'

export async function listTags(businessId: string) {
  return findTagsByBusiness(businessId)
}
