import { Router } from 'express'
import { list, create, remove } from './note.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.get('/clients/:clientId/notes', verifyAuth, list)
router.post('/clients/:clientId/notes', verifyAuth, create)
router.delete('/notes/:id', verifyAuth, remove)

export default router
