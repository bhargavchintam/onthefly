import express from 'express'
import ActivitiesController from '../controllers/activities.js'

// Mounted at /api/activities. Note the two meanings of the second path segment,
// which follow the lab: GET and POST take a trip id, PATCH and DELETE take an activity id.
const router = express.Router()

router.get('/', ActivitiesController.getActivities)
router.get('/:trip_id', ActivitiesController.getTripActivities)
router.post('/:trip_id', ActivitiesController.createActivity)
router.patch('/:id', ActivitiesController.updateActivityLikes)
router.delete('/:id', ActivitiesController.deleteActivity)

export default router
