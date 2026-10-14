import { pool } from '../config/database.js'
import { handleError, notFound, badRequest, parseId } from '../utils/errors.js'

// POST /api/activities/:trip_id   body: { activity, num_votes? }
const createActivity = async (req, res) => {
    try {
        const tripId = parseId(req.params.trip_id)
        if (tripId === null) return notFound(res, 'That trip')
        const { activity, num_votes = 0 } = req.body
        if (!activity) return badRequest(res, 'An activity name is required.')

        const trip = await pool.query('SELECT id FROM trips WHERE id = $1', [tripId])
        if (trip.rows.length === 0) return notFound(res, 'That trip')

        const results = await pool.query(
            'INSERT INTO activities (trip_id, activity, num_votes) VALUES ($1, $2, $3) RETURNING *',
            [tripId, activity, num_votes]
        )
        res.status(201).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'createActivity')
    }
}

// GET /api/activities
const getActivities = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM activities ORDER BY id ASC')
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error, 'getActivities')
    }
}

// GET /api/activities/:trip_id   every activity for one trip
const getTripActivities = async (req, res) => {
    try {
        const tripId = parseId(req.params.trip_id)
        if (tripId === null) return notFound(res, 'That trip')
        const results = await pool.query(
            'SELECT * FROM activities WHERE trip_id = $1 ORDER BY num_votes DESC, id ASC',
            [tripId]
        )
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error, 'getTripActivities')
    }
}

// PATCH /api/activities/:id   body: { num_votes }
const updateActivityLikes = async (req, res) => {
    try {
        const id = parseId(req.params.id)
        if (id === null) return notFound(res, 'That activity')
        const votes = Number(req.body.num_votes)
        if (!Number.isInteger(votes) || votes < 0) return badRequest(res, 'num_votes must be a whole number of zero or more.')

        const results = await pool.query(
            'UPDATE activities SET num_votes = $1 WHERE id = $2 RETURNING *',
            [votes, id]
        )
        if (results.rows.length === 0) return notFound(res, 'That activity')
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'updateActivityLikes')
    }
}

// DELETE /api/activities/:id
const deleteActivity = async (req, res) => {
    try {
        const id = parseId(req.params.id)
        const results = id === null ? { rows: [] } : await pool.query('DELETE FROM activities WHERE id = $1 RETURNING *', [id])
        if (results.rows.length === 0) return notFound(res, 'That activity')
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'deleteActivity')
    }
}

export default { createActivity, getActivities, getTripActivities, updateActivityLikes, deleteActivity }
