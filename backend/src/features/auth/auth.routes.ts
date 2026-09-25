import { Router } from 'express'
import { login, getMyBusinesses, selectBusiness } from './auth.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.post('/auth/login', login)
router.get('/users/me/businesses', verifyAuth, getMyBusinesses)
router.post('/auth/select-business', selectBusiness)

export default router
