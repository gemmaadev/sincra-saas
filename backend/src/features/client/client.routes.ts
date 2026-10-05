import { Router } from 'express'
import { create, list, getById, update, remove, assignTag, removeTag } from './client.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.post('/clients', verifyAuth, create)
router.get('/clients', verifyAuth, list)
router.get('/clients/:id', verifyAuth, getById)
router.patch('/clients/:id', verifyAuth, update)
router.delete('/clients/:id', verifyAuth, remove)
router.post('/clients/:id/tags', verifyAuth, assignTag)
router.delete('/clients/:id/tags/:tagId', verifyAuth, removeTag)

export default router
