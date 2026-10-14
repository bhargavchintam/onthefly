import express from 'express'
import cors from 'cors'

import tripRoutes from './routes/trips.js'
import activityRoutes from './routes/activities.js'
import destinationRoutes from './routes/destinations.js'
import tripDestinationRoutes from './routes/tripsDestinations.js'

// server/.env is loaded by config/database.js, which the routers import first.
const app = express()

// Middleware runs on every request before the routes: parse JSON bodies, allow
// cross-origin requests (the React client will run on a different port).
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.status(200).send('<h1 style="text-align: center; margin-top: 50px;">✈️ On the Fly API</h1>')
})

app.use('/api/trips', tripRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/destinations', destinationRoutes)
app.use('/api/trips-destinations', tripDestinationRoutes)

// Any other /api path gets a JSON 404 instead of an HTML page.
app.use('/api', (req, res) => {
    res.status(404).json({ error: `No API route for ${req.method} ${req.originalUrl}` })
})

// Error handler (four arguments). Catches a body that is not valid JSON and anything
// thrown by middleware above. https://expressjs.com/en/guide/error-handling.html
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'The request body is not valid JSON.' })
    }
    console.error('[server]', error)
    res.status(error.status || 500).json({ error: 'Something went wrong on the server. Please try again.' })
})

// Render sets PORT in production; 3001 is for local development.
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})
