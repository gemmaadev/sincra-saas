import { Router } from 'express'
import { invite, accept, listMembers, updateStatus, resend } from './team.controller'
import { verifyAuth } from '../../middleware/verifyAuth'
import { requireRole } from '../../middleware/requireRole'
import { authRateLimit } from '../../middleware/rateLimit'

const router = Router()

router.post('/team/invite', authRateLimit, verifyAuth, requireRole('ADMIN'), invite)
router.post('/team/accept-invite', accept)
router.get('/team', verifyAuth, listMembers)
router.patch('/team/:userId/status', verifyAuth, requireRole('ADMIN'), updateStatus)
router.post(
  '/team/:userId/resend-invite',
  authRateLimit,
  verifyAuth,
  requireRole('ADMIN'),
  resend,
)

export default router
