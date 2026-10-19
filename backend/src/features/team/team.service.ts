import { Resend } from 'resend'
import { AppError } from '../../shared/AppError'
import { hashPassword } from '../../shared/hash'
import { signInvitationToken, verifyInvitationToken } from '../../shared/jwt'
import { findUserByEmail, findUserById, insertUser } from '../user/user.model'
import {
  findMembership,
  insertPendingEmployee,
  setInvitationCode,
  activateInvitedMember,
  findMembersWithUser,
  countAdminMembers,
  updateMemberStatus as updateMemberStatusInDb,
} from './team.model'
import type { TeamMember } from './team.types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function inviteMember(businessId: string, email: string, name: string) {
  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    const existingMembership = await findMembership(businessId, existingUser.id)

    if (existingMembership) {
      throw new AppError('Este usuario ya pertenece a este negocio', 409, 'ALREADY_MEMBER')
    }
  }

  const user = existingUser ?? (await insertUser(name, email))

  await insertPendingEmployee(businessId, user.id)

  const invitationToken = signInvitationToken({ userId: user.id, businessId, invite: true })
  await setInvitationCode(user.id, invitationToken)

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

  const user = await findUserById(payload.userId)

  if (!user || user.invitationCode !== token) {
    throw new AppError('La invitación no es válida o ha caducado', 401, 'INVALID_TOKEN')
  }

  const passwordHash = newPassword ? await hashPassword(newPassword) : undefined

  await activateInvitedMember(user.id, payload.businessId, passwordHash)
}

export async function listBusinessMembers(businessId: string): Promise<TeamMember[]> {
  const memberships = await findMembersWithUser(businessId)

  return memberships.map((membership) => ({
    id: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    role: membership.role,
    status: membership.status,
  }))
}

export async function updateMemberStatus(
  businessId: string,
  requestingUserId: string,
  targetUserId: string,
  status: 'ACTIVE' | 'INACTIVE',
) {
  const membership = await findMembership(businessId, targetUserId)

  if (!membership) {
    throw new AppError('Este miembro no pertenece a este negocio', 404, 'TEAM_MEMBER_NOT_FOUND')
  }

  if (status === 'INACTIVE' && targetUserId === requestingUserId && membership.role === 'ADMIN') {
    const adminCount = await countAdminMembers(businessId)

    if (adminCount <= 1) {
      throw new AppError(
        'No puedes desactivar tu propio acceso siendo el único administrador del negocio',
        400,
        'LAST_ADMIN',
      )
    }
  }

  await updateMemberStatusInDb(businessId, targetUserId, status)
}
