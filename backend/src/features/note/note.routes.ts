import { Router } from 'express'
import { listForClient, createForClient, listForOrder, createForOrder, remove } from './note.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.get('/clients/:clientId/notes', verifyAuth, listForClient)
router.post('/clients/:clientId/notes', verifyAuth, createForClient)
router.get('/orders/:orderId/notes', verifyAuth, listForOrder)
router.post('/orders/:orderId/notes', verifyAuth, createForOrder)
router.delete('/notes/:id', verifyAuth, remove)

export default router
