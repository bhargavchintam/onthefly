import { pool } from '../config/database.js'
import { handleError, notFound, badRequest, parseId } from '../utils/errors.js'

const TRIP_FIELDS = ['title', 'description', 'img_url', 'num_days', 'start_date', 'end_date', 'total_cost']

// Checks that every trip field is present. Returns a message or null.
const missingField = (body) => {
    const missing = TRIP_FIELDS.filter((field) => body[field] === undefined || body[field] === '')
    return missing.length ? `Missing field(s): ${missing.join(', ')}.` : null
}

// POST /api/trips
const createTrip = async (req, res) => {
    try {
        const problem = missingField(req.body)
        if (problem) return badRequest(res, problem)

        const { title, description, img_url, num_days, start_date, end_date, total_cost } = req.body
        const results = await pool.query(
            `INSERT INTO trips (title, description, img_url, num_days, start_date, end_date, total_cost)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [title, description, img_url, num_days, start_date, end_date, total_cost]
        )
        // Unit 8 lab: whoever is logged in becomes the first traveler on their own trip.
        if (req.user) {
            await pool.query('INSERT INTO trips_users (trip_id, user_id) VALUES ($1, $2)', [results.rows[0].id, req.user.id])
        }
        res.status(201).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'createTrip')
    }
}

// GET /api/trips
const getTrips = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM trips ORDER BY id ASC')
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error, 'getTrips')
    }
}

// GET /api/trips/:id
const getTrip = async (req, res) => {
    try {
        const id = parseId(req.params.id)
        const results = id === null ? { rows: [] } : await pool.query('SELECT * FROM trips WHERE id = $1', [id])
        if (results.rows.length === 0) return notFound(res, 'That trip')
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'getTrip')
    }
}

// PATCH /api/trips/:id  (every field is sent, as in the lab)
const updateTrip = async (req, res) => {
    try {
        const id = parseId(req.params.id)
        if (id === null) return notFound(res, 'That trip')
        const problem = missingField(req.body)
        if (problem) return badRequest(res, problem)

        const { title, description, img_url, num_days, start_date, end_date, total_cost } = req.body
        const results = await pool.query(
            `UPDATE trips
             SET title = $1, description = $2, img_url = $3, num_days = $4, start_date = $5, end_date = $6, total_cost = $7
             WHERE id = $8
             RETURNING *`,
            [title, description, img_url, num_days, start_date, end_date, total_cost, id]
        )
        if (results.rows.length === 0) return notFound(res, 'That trip')
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'updateTrip')
    }
}

// DELETE /api/trips/:id
// The activities, trips_destinations, and trips_users rows for this trip are removed by
// the ON DELETE CASCADE rules in reset.js, so one DELETE is enough.
const deleteTrip = async (req, res) => {
    try {
        const id = parseId(req.params.id)
        const results = id === null ? { rows: [] } : await pool.query('DELETE FROM trips WHERE id = $1 RETURNING *', [id])
        if (results.rows.length === 0) return notFound(res, 'That trip')
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'deleteTrip')
    }
}

export default { createTrip, getTrips, getTrip, updateTrip, deleteTrip }
