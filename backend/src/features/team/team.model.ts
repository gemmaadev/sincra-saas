import prisma from '../../config/db'

export async function findMembership(businessId: string, userId: string) {
  return prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId } },
  })
}

export async function insertPendingEmployee(businessId: string, userId: string) {
  return prisma.businessMember.create({
    data: { businessId, userId, role: 'EMPLOYEE', status: 'PENDING' },
  })
}

export async function setInvitationCode(userId: string, invitationCode: string) {
  return prisma.user.update({ where: { id: userId }, data: { invitationCode } })
}

export async function activateInvitedMember(
  userId: string,
  businessId: string,
  passwordHash?: string,
) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { invitationCode: null, ...(passwordHash && { passwordHash }) },
    }),
    prisma.businessMember.update({
      where: { businessId_userId: { businessId, userId } },
      data: { status: 'ACTIVE' },
    }),
  ])
}

export async function findMembersWithUser(businessId: string) {
  return prisma.businessMember.findMany({
    where: { businessId },
    include: { user: true },
  })
}

export async function countAdminMembers(businessId: string) {
  return prisma.businessMember.count({ where: { businessId, role: 'ADMIN' } })
}

export async function updateMemberStatus(
  businessId: string,
  userId: string,
  status: 'ACTIVE' | 'INACTIVE',
) {
  return prisma.businessMember.update({
    where: { businessId_userId: { businessId, userId } },
    data: { status },
  })
}
