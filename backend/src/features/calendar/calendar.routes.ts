import { Router } from 'express'
import { list, create, update, reschedule, remove } from './calendar.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.get('/calendar', verifyAuth, list)
router.post('/calendar', verifyAuth, create)
router.patch('/calendar/:id', verifyAuth, update)
router.patch('/calendar/:id/reschedule', verifyAuth, reschedule)
router.delete('/calendar/:id', verifyAuth, remove)

export default router
