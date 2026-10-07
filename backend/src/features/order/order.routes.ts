import { Router } from 'express'
import { create, list, getById, update, remove } from './order.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.post('/orders', verifyAuth, create)
router.get('/orders', verifyAuth, list)
router.get('/orders/:id', verifyAuth, getById)
router.patch('/orders/:id', verifyAuth, update)
router.delete('/orders/:id', verifyAuth, remove)

export default router
