import { pool } from '../config/database.js'
import { handleError, notFound, badRequest, parseId } from '../utils/errors.js'

// Who is on a trip (Unit 8 lab, stretch). trips_users is the join table from
// Part 1: (trip_id, user_id) with a composite primary key, so a user can be on
// a trip once. Travelers are added by GitHub username; the username must belong
// to someone who has signed in to On the Fly at least once, because that is
// when their users row is created.

// Only the columns the client should see: never the access token.
const USER_SELECT = 'u.id, u.githubid, u.username, u.avatarurl, u.bio, u.location'

// POST /api/users-trips/create/:trip_id   body: { username }
const createTripUser = async (req, res) => {
    try {
        const tripId = parseId(req.params.trip_id)
        if (tripId === null) return notFound(res, 'That trip')
        const username = String(req.body.username ?? '').trim()
        if (!username) return badRequest(res, 'Enter a GitHub username.')

        const trip = await pool.query('SELECT id FROM trips WHERE id = $1', [tripId])
        if (trip.rows.length === 0) return notFound(res, 'That trip')

        const user = await pool.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username])
        if (user.rows.length === 0) {
            return res.status(404).json({ error: `${username} has not signed in to On the Fly yet. Ask them to log in once, then add them.` })
        }

        const already = await pool.query('SELECT 1 FROM trips_users WHERE trip_id = $1 AND user_id = $2', [tripId, user.rows[0].id])
        if (already.rows.length > 0) {
            return res.status(409).json({ error: `${username} is already on this trip.` })
        }

        await pool.query('INSERT INTO trips_users (trip_id, user_id) VALUES ($1, $2)', [tripId, user.rows[0].id])
        const added = await pool.query(`SELECT ${USER_SELECT} FROM users u WHERE u.id = $1`, [user.rows[0].id])
        res.status(201).json(added.rows[0])
    } catch (error) {
        handleError(res, error, 'createTripUser')
    }
}

// GET /api/users-trips/users/:trip_id   the travelers on a trip
const getTripUsers = async (req, res) => {
    try {
        const tripId = parseId(req.params.trip_id)
        if (tripId === null) return notFound(res, 'That trip')
        const results = await pool.query(
            `SELECT ${USER_SELECT}
             FROM trips_users tu JOIN users u ON u.id = tu.user_id
             WHERE tu.trip_id = $1
             ORDER BY u.username`,
            [tripId]
        )
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error, 'getTripUsers')
    }
}

// GET /api/users-trips/trips/:username   the trips a user has been added to
const getUserTrips = async (req, res) => {
    try {
        const results = await pool.query(
            `SELECT t.*
             FROM trips_users tu
             JOIN users u ON u.id = tu.user_id
             JOIN trips t ON t.id = tu.trip_id
             WHERE LOWER(u.username) = LOWER($1)
             ORDER BY t.start_date`,
            [req.params.username]
        )
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error, 'getUserTrips')
    }
}

// DELETE /api/users-trips/:trip_id/:user_id   take a traveler off a trip
const deleteTripUser = async (req, res) => {
    try {
        const tripId = parseId(req.params.trip_id)
        const userId = parseId(req.params.user_id)
        if (tripId === null || userId === null) return notFound(res, 'That traveler')
        const results = await pool.query('DELETE FROM trips_users WHERE trip_id = $1 AND user_id = $2 RETURNING *', [tripId, userId])
        if (results.rows.length === 0) return notFound(res, 'That traveler')
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'deleteTripUser')
    }
}

export default { createTripUser, getTripUsers, getUserTrips, deleteTripUser }
