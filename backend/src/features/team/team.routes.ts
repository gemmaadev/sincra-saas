import { Router } from 'express'
import { invite, accept, listMembers, updateStatus } from './team.controller'
import { verifyAuth } from '../../middleware/verifyAuth'
import { requireRole } from '../../middleware/requireRole'
import { authRateLimit } from '../../middleware/rateLimit'

const router = Router()

router.post('/team/invite', authRateLimit, verifyAuth, requireRole('ADMIN'), invite)
router.post('/team/accept-invite', accept)
router.get('/team', verifyAuth, listMembers)
router.patch('/team/:userId/status', verifyAuth, requireRole('ADMIN'), updateStatus)

export default router
