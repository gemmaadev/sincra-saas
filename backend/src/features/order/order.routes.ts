import { Router } from 'express'
import { create, list, getById, update, remove, assignTag, removeTag } from './order.controller'
import { getMap } from './map/order-map.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.post('/orders', verifyAuth, create)
router.get('/orders', verifyAuth, list)
router.get('/orders/map', verifyAuth, getMap)
router.get('/orders/:id', verifyAuth, getById)
router.patch('/orders/:id', verifyAuth, update)
router.delete('/orders/:id', verifyAuth, remove)
router.post('/orders/:id/tags', verifyAuth, assignTag)
router.delete('/orders/:id/tags/:tagId', verifyAuth, removeTag)

export default router
