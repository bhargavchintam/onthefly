import express from 'express'
import UsersController from '../controllers/users.js'
import { requireLogin } from '../middleware/auth.js'

// Mounted at /api/users
const router = express.Router()

router.get('/me', requireLogin, UsersController.getMe)
router.patch('/me', requireLogin, UsersController.updateMe)

export default router
