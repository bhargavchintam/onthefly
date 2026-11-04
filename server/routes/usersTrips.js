import express from 'express'
import UsersTripsController from '../controllers/usersTrips.js'
import { requireLogin } from '../middleware/auth.js'

// Mounted at /api/users-trips
const router = express.Router()

router.get('/users/:trip_id', UsersTripsController.getTripUsers)
router.get('/trips/:username', UsersTripsController.getUserTrips)
router.post('/create/:trip_id', requireLogin, UsersTripsController.createTripUser)
router.delete('/:trip_id/:user_id', requireLogin, UsersTripsController.deleteTripUser)

export default router
