import { Router } from 'express'
import { list, create, update, remove } from './tag.controller'
import { verifyAuth } from '../../middleware/verifyAuth'
import { requireRole } from '../../middleware/requireRole'

const router = Router()

router.get('/tags', verifyAuth, list)
router.post('/tags', verifyAuth, create)
router.patch('/tags/:id', verifyAuth, requireRole('ADMIN'), update)
router.delete('/tags/:id', verifyAuth, requireRole('ADMIN'), remove)

export default router
