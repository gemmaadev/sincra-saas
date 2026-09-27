import { Router } from 'express'
import {
  login,
  register,
  getMyBusinesses,
  selectBusiness,
  logout,
  me,
  loginWithGoogle,
  loginWithMicrosoft,
  completeOnboarding,
} from './auth.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.post('/auth/register', register)
router.post('/auth/login', login)
router.post('/auth/logout', logout)
router.get('/auth/me', verifyAuth, me)
router.get('/users/me/businesses', verifyAuth, getMyBusinesses)
router.post('/auth/select-business', selectBusiness)

router.post('/auth/google', loginWithGoogle)
router.post('/auth/microsoft', loginWithMicrosoft)
router.post('/onboarding/complete', completeOnboarding)

export default router
