import { Resend } from 'resend'
import prisma from '../../config/db'
import { AppError } from '../../shared/AppError'
import { hashPassword } from '../../shared/hash'
import { signInvitationToken, verifyInvitationToken } from '../../shared/jwt'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function inviteMember(businessId: string, email: string, name: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    const existingMembership = await prisma.businessMember.findUnique({
      where: { businessId_userId: { businessId, userId: existingUser.id } },
    })

    if (existingMembership) {
      throw new AppError('Este usuario ya pertenece a este negocio', 409, 'ALREADY_MEMBER')
    }
  }

  const user = existingUser ?? (await prisma.user.create({ data: { name, email } }))

  await prisma.businessMember.create({
    data: { businessId, userId: user.id, role: 'EMPLOYEE', status: 'PENDING' },
  })

  const invitationToken = signInvitationToken({ userId: user.id, businessId, invite: true })
  await prisma.user.update({ where: { id: user.id }, data: { invitationCode: invitationToken } })

  const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${invitationToken}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Te han invitado a un equipo en Sincra',
    html: `
      <p>Hola${name ? ` ${name}` : ''},</p>
      <p>Te han invitado a unirte a un equipo en Sincra. Este enlace caduca en 7 días:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
    `,
  })
}

export async function acceptInvite(token: string, newPassword?: string) {
  let payload
  try {
    payload = verifyInvitationToken(token)
  } catch {
    throw new AppError('La invitación no es válida o ha caducado', 401, 'INVALID_TOKEN')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })

  if (!user || user.invitationCode !== token) {
    throw new AppError('La invitación no es válida o ha caducado', 401, 'INVALID_TOKEN')
  }

  const passwordHash = newPassword ? await hashPassword(newPassword) : undefined

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { invitationCode: null, ...(passwordHash && { passwordHash }) },
    }),
    prisma.businessMember.update({
      where: { businessId_userId: { businessId: payload.businessId, userId: user.id } },
      data: { status: 'ACTIVE' },
    }),
  ])
}

export async function listBusinessMembers(businessId: string) {
  const memberships = await prisma.businessMember.findMany({
    where: { businessId },
    include: { user: true },
  })

  return memberships.map((membership) => ({
    id: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    role: membership.role,
    status: membership.status,
  }))
}
