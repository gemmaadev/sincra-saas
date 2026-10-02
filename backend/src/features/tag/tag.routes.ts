import { Router } from 'express'
import { list } from './tag.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.get('/tags', verifyAuth, list)

export default router
