import { pool } from '../config/database.js'
import { handleError, badRequest } from '../utils/errors.js'

// The signed-in user's own page (Unit 8 lab, stretch): a short bio and a
// location. Both routes read the user from the session, so nobody can edit
// anyone else's row, and neither answer includes the access token.

const LIMITS = { bio: 280, location: 80 }

// GET /api/users/me
const getMe = async (req, res) => {
    try {
        const results = await pool.query(
            'SELECT id, githubid, username, avatarurl, bio, location FROM users WHERE id = $1',
            [req.user.id]
        )
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'getMe')
    }
}

// PATCH /api/users/me   body: { bio, location }
const updateMe = async (req, res) => {
    try {
        const bio = String(req.body.bio ?? '').trim()
        const location = String(req.body.location ?? '').trim()
        if (bio.length > LIMITS.bio) return badRequest(res, `The bio can be at most ${LIMITS.bio} characters.`)
        if (location.length > LIMITS.location) return badRequest(res, `The location can be at most ${LIMITS.location} characters.`)

        const results = await pool.query(
            `UPDATE users SET bio = $1, location = $2 WHERE id = $3
             RETURNING id, githubid, username, avatarurl, bio, location`,
            [bio, location, req.user.id]
        )
        // Keep the session copy in step so the header and the page agree without a new login.
        req.session.passport.user = { ...req.session.passport.user, bio, location }
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'updateMe')
    }
}

export default { getMe, updateMe }
