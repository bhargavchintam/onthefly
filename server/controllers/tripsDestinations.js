import { pool } from '../config/database.js'
import { handleError, notFound, badRequest, parseId } from '../utils/errors.js'

// The join table. Each row says "this trip visits this destination".

// POST /api/trips-destinations   body: { trip_id, destination_id }
const createTripDestination = async (req, res) => {
    try {
        const tripId = Number(req.body.trip_id)
        const destinationId = Number(req.body.destination_id)
        if (!Number.isInteger(tripId) || !Number.isInteger(destinationId)) {
            return badRequest(res, 'trip_id and destination_id must be whole numbers.')
        }
        // Postgres would also refuse a bad id through the foreign keys, but checking first
        // lets us answer with a clear 404 instead of a generic 500.
        const [trip, destination] = await Promise.all([
            pool.query('SELECT id FROM trips WHERE id = $1', [tripId]),
            pool.query('SELECT id FROM destinations WHERE id = $1', [destinationId])
        ])
        if (trip.rows.length === 0) return notFound(res, 'That trip')
        if (destination.rows.length === 0) return notFound(res, 'That destination')

        // ON CONFLICT DO NOTHING: adding the same pair twice is not an error, just a no-op.
        const results = await pool.query(
            `INSERT INTO trips_destinations (trip_id, destination_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING
             RETURNING *`,
            [tripId, destinationId]
        )
        if (results.rows.length === 0) return res.status(200).json({ trip_id: tripId, destination_id: destinationId, note: 'already linked' })
        res.status(201).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'createTripDestination')
    }
}

// GET /api/trips-destinations
const getTripsDestinations = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM trips_destinations ORDER BY trip_id, destination_id')
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error, 'getTripsDestinations')
    }
}

// GET /api/trips-destinations/trips/:destination_id   every trip that visits one destination
const getAllTrips = async (req, res) => {
    try {
        const destinationId = parseId(req.params.destination_id)
        if (destinationId === null) return notFound(res, 'That destination')
        const results = await pool.query(
            `SELECT t.*
             FROM trips t
             JOIN trips_destinations td ON td.trip_id = t.id
             WHERE td.destination_id = $1
             ORDER BY t.start_date`,
            [destinationId]
        )
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error, 'getAllTrips')
    }
}

// GET /api/trips-destinations/destinations/:trip_id   every destination on one trip
const getAllDestinations = async (req, res) => {
    try {
        const tripId = parseId(req.params.trip_id)
        if (tripId === null) return notFound(res, 'That trip')
        const results = await pool.query(
            `SELECT d.*
             FROM destinations d
             JOIN trips_destinations td ON td.destination_id = d.id
             WHERE td.trip_id = $1
             ORDER BY d.id`,
            [tripId]
        )
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error, 'getAllDestinations')
    }
}

export default { createTripDestination, getTripsDestinations, getAllTrips, getAllDestinations }
