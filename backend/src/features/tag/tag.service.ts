import { AppError } from '../../shared/AppError'
import { getUniqueViolationFields } from '../../shared/utils/prismaErrors'
import {
  findTagsByBusiness,
  findTagById,
  insertTag,
  updateTagById,
  deleteTagById,
} from './tag.model'
import type { CreateTagInput, UpdateTagInput } from './tag.types'

async function rejectDuplicateName<T>(save: () => Promise<T>): Promise<T> {
  try {
    return await save()
  } catch (error) {
    if (getUniqueViolationFields(error)) {
      throw new AppError('Ya existe una etiqueta con ese nombre', 409, 'DUPLICATE_TAG')
    }

    throw error
  }
}

async function assertTagExists(businessId: string, tagId: string) {
  const existing = await findTagById(businessId, tagId)

  if (!existing) {
    throw new AppError('Etiqueta no encontrada', 404, 'TAG_NOT_FOUND')
  }
}

export async function listTags(businessId: string) {
  return findTagsByBusiness(businessId)
}

export async function createTag(businessId: string, createdBy: string, input: CreateTagInput) {
  return rejectDuplicateName(() =>
    insertTag({
      businessId,
      createdBy,
      name: input.name,
      color: input.color,
      priority: input.priority,
    }),
  )
}

export async function updateTag(businessId: string, tagId: string, input: UpdateTagInput) {
  await assertTagExists(businessId, tagId)

  return rejectDuplicateName(() => updateTagById(tagId, input))
}

export async function deleteTag(businessId: string, tagId: string) {
  await assertTagExists(businessId, tagId)

  await deleteTagById(tagId)
}
