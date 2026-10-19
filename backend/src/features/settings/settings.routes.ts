import { Router } from 'express'
import {
  connect,
  disconnect,
  getBusiness,
  updateBusiness,
  getChannelsStatus,
  deleteAccountHandler,
} from './settings.controller'
import { verifyAuth } from '../../middleware/verifyAuth'
import { requireRole } from '../../middleware/requireRole'

const router = Router()

router.post('/channels/connect', verifyAuth, requireRole('ADMIN'), connect)
router.post('/channels/disconnect', verifyAuth, requireRole('ADMIN'), disconnect)
router.get('/settings/business', verifyAuth, getBusiness)
router.patch('/settings/business', verifyAuth, requireRole('ADMIN'), updateBusiness)
router.get('/settings/channels', verifyAuth, getChannelsStatus)
router.delete('/settings/account', verifyAuth, requireRole('ADMIN'), deleteAccountHandler)

export default router
