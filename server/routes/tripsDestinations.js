import express from 'express'
import TripsDestinationsController from '../controllers/tripsDestinations.js'

// Mounted at /api/trips-destinations
const router = express.Router()

router.get('/', TripsDestinationsController.getTripsDestinations)
router.get('/trips/:destination_id', TripsDestinationsController.getAllTrips)
router.get('/destinations/:trip_id', TripsDestinationsController.getAllDestinations)
router.post('/', TripsDestinationsController.createTripDestination)

export default router
