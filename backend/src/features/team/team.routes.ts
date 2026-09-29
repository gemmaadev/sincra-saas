import { Router } from 'express'
import { invite, accept, listMembers } from './team.controller'
import { verifyAuth } from '../../middleware/verifyAuth'
import { requireRole } from '../../middleware/requireRole'

const router = Router()

router.post('/team/invite', verifyAuth, requireRole('ADMIN'), invite)
router.post('/team/accept-invite', accept)
router.get('/team', verifyAuth, listMembers)

export default router
