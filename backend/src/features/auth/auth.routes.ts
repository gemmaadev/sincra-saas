import { Router } from 'express'
import {
  login,
  register,
  getMyBusinesses,
  selectBusiness,
  switchBusiness,
  logout,
  me,
  loginWithGoogle,
  completeOnboarding,
  startMicrosoftAuth,
  microsoftCallback,
  forgotPassword,
  resetPasswordHandler,
} from './auth.controller'
import { verifyAuth } from '../../middleware/verifyAuth'
import { verifyPendingAuth } from '../../middleware/verifyPendingAuth'
import { authRateLimit } from '../../middleware/rateLimit'

const router = Router()

router.post('/auth/register', authRateLimit, register)
router.post('/auth/login', authRateLimit, login)
router.post('/auth/logout', logout)
router.get('/auth/me', verifyAuth, me)
router.get('/users/me/businesses', verifyPendingAuth, getMyBusinesses)
router.get('/auth/me/businesses', verifyAuth, getMyBusinesses)
router.post('/auth/select-business', selectBusiness)
router.post('/auth/switch-business', verifyAuth, switchBusiness)

router.post('/auth/google', loginWithGoogle)
router.get('/auth/microsoft/start', startMicrosoftAuth)
router.get('/auth/microsoft/callback', microsoftCallback)
router.post('/onboarding/complete', completeOnboarding)

router.post('/auth/forgot-password', authRateLimit, forgotPassword)
router.post('/auth/reset-password', resetPasswordHandler)

export default router
