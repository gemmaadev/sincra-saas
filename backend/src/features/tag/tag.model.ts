import prisma from '../../config/db'
import type { Prisma } from '../../generated/prisma/client'

export async function findTagsByBusiness(businessId: string) {
  return prisma.tag.findMany({
    where: { businessId },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })
}

export async function findTagById(businessId: string, tagId: string) {
  return prisma.tag.findUnique({ where: { id: tagId, businessId } })
}

export async function insertTag(data: Prisma.TagUncheckedCreateInput) {
  return prisma.tag.create({ data })
}

export async function updateTagById(tagId: string, data: Prisma.TagUpdateInput) {
  return prisma.tag.update({ where: { id: tagId }, data })
}

export async function deleteTagById(tagId: string) {
  await prisma.tag.delete({ where: { id: tagId } })
}
