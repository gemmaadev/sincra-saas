import prisma from '../../config/db'

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } })
}

export async function insertUser(name: string, email: string) {
  return prisma.user.create({ data: { name, email } })
}
