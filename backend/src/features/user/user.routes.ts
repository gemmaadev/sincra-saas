import { Router } from 'express'
import { getProfile, updateProfile, changePassword } from './user.controller'
import { verifyAuth } from '../../middleware/verifyAuth'

const router = Router()

router.get('/user/profile', verifyAuth, getProfile)
router.patch('/user/profile', verifyAuth, updateProfile)
router.patch('/user/password', verifyAuth, changePassword)

export default router
