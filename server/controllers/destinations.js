import { pool } from '../config/database.js'
import { handleError, notFound, badRequest, parseId } from '../utils/errors.js'

const FIELDS = ['destination', 'description', 'city', 'country', 'img_url', 'flag_img_url']

const missingField = (body) => {
    const missing = FIELDS.filter((field) => body[field] === undefined || body[field] === '')
    return missing.length ? `Missing field(s): ${missing.join(', ')}.` : null
}

// POST /api/destinations
const createDestination = async (req, res) => {
    try {
        const problem = missingField(req.body)
        if (problem) return badRequest(res, problem)
        const { destination, description, city, country, img_url, flag_img_url } = req.body
        const results = await pool.query(
            `INSERT INTO destinations (destination, description, city, country, img_url, flag_img_url)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [destination, description, city, country, img_url, flag_img_url]
        )
        res.status(201).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'createDestination')
    }
}

// GET /api/destinations
const getDestinations = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM destinations ORDER BY id ASC')
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error, 'getDestinations')
    }
}

// GET /api/destinations/:id
const getDestination = async (req, res) => {
    try {
        const id = parseId(req.params.id)
        const results = id === null ? { rows: [] } : await pool.query('SELECT * FROM destinations WHERE id = $1', [id])
        if (results.rows.length === 0) return notFound(res, 'That destination')
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'getDestination')
    }
}

// PATCH /api/destinations/:id
const updateDestination = async (req, res) => {
    try {
        const id = parseId(req.params.id)
        if (id === null) return notFound(res, 'That destination')
        const problem = missingField(req.body)
        if (problem) return badRequest(res, problem)
        const { destination, description, city, country, img_url, flag_img_url } = req.body
        const results = await pool.query(
            `UPDATE destinations
             SET destination = $1, description = $2, city = $3, country = $4, img_url = $5, flag_img_url = $6
             WHERE id = $7
             RETURNING *`,
            [destination, description, city, country, img_url, flag_img_url, id]
        )
        if (results.rows.length === 0) return notFound(res, 'That destination')
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'updateDestination')
    }
}

// DELETE /api/destinations/:id   (its trips_destinations rows cascade)
const deleteDestination = async (req, res) => {
    try {
        const id = parseId(req.params.id)
        const results = id === null ? { rows: [] } : await pool.query('DELETE FROM destinations WHERE id = $1 RETURNING *', [id])
        if (results.rows.length === 0) return notFound(res, 'That destination')
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error, 'deleteDestination')
    }
}

export default { createDestination, getDestinations, getDestination, updateDestination, deleteDestination }
