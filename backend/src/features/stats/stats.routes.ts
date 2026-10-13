import { Router } from 'express'
import { dashboard } from './stats.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.get('/stats/dashboard', verifyAuth, dashboard)

export default router
