import { Router } from 'express'
import { connect, disconnect } from './settings.controller'
import { verifyAuth } from '../../middleware/verifyAuth'
import { requireRole } from '../../middleware/requireRole'

const router = Router()

router.post('/channels/connect', verifyAuth, requireRole('ADMIN'), connect)
router.post('/channels/disconnect', verifyAuth, requireRole('ADMIN'), disconnect)

export default router
