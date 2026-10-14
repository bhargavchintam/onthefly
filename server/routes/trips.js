import express from 'express'
import TripsController from '../controllers/trips.js'

// Mounted at /api/trips in server.js
const router = express.Router()

router.get('/', TripsController.getTrips)
router.get('/:id', TripsController.getTrip)
router.post('/', TripsController.createTrip)
router.patch('/:id', TripsController.updateTrip)
router.delete('/:id', TripsController.deleteTrip)

export default router
