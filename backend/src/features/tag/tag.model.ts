import prisma from '../../config/db'

export async function findTagsByBusiness(businessId: string) {
  return prisma.tag.findMany({
    where: { businessId },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })
}
