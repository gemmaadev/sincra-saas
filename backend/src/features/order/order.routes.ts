import { Router } from 'express'
import { create, list, getById, update, remove } from './order.controller'
import { getMap } from './map/order-map.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.post('/orders', verifyAuth, create)
router.get('/orders', verifyAuth, list)
router.get('/orders/map', verifyAuth, getMap)
router.get('/orders/:id', verifyAuth, getById)
router.patch('/orders/:id', verifyAuth, update)
router.delete('/orders/:id', verifyAuth, remove)

export default router
