import { Router } from 'express'
import { overview } from './stats.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.get('/stats/overview', verifyAuth, overview)

export default router
