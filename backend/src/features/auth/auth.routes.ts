import { Router } from 'express'
import { login, register, getMyBusinesses, selectBusiness, logout, me } from './auth.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.post('/auth/register', register)
router.post('/auth/login', login)
router.post('/auth/logout', logout)
router.get('/auth/me', verifyAuth, me)
router.get('/users/me/businesses', verifyAuth, getMyBusinesses)
router.post('/auth/select-business', selectBusiness)

export default router
