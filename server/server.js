import express from 'express'
import cors from 'cors'
import passport from 'passport'
import session from 'express-session'

import { GitHub } from './config/auth.js'
import authRoutes from './routes/auth.js'
import tripRoutes from './routes/trips.js'
import activityRoutes from './routes/activities.js'
import destinationRoutes from './routes/destinations.js'
import tripDestinationRoutes from './routes/tripsDestinations.js'
import usersTripsRoutes from './routes/usersTrips.js'
import userRoutes from './routes/users.js'

// server/.env is loaded by config/database.js, which the routers import first.
const app = express()

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Unit 9 lab: on Render the client (a static site) and the server (a web
// service) have different addresses, so the browser treats them as two sites.
// A cookie only travels between two sites when it says sameSite: 'none', and
// browsers only accept that on a cookie marked secure (HTTPS). Locally both
// run on localhost over plain HTTP, so the cookie keeps its defaults there.
const crossSite = CLIENT_URL.startsWith('https://')

// Render forwards requests through a proxy over HTTP. This tells Express to
// read the X-Forwarded-Proto header, so req.secure is true and express-session
// agrees to set the secure cookie. https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1)

// Middleware runs on every request before the routes, in this order.
app.use(express.json())

// Sessions (Unit 8 lab). express-session gives every browser a session id in a
// cookie named connect.sid and keeps the session data on the server; Passport
// stores the logged-in user inside that session. resave: false only writes the
// session back when something changed; saveUninitialized: true saves a new
// session even before anything is stored in it, which is what the lab asks for.
// https://github.com/expressjs/session
app.use(session({
    secret: process.env.SESSION_SECRET || 'codepath',
    resave: false,
    saveUninitialized: true,
    cookie: crossSite ? { sameSite: 'none', secure: true } : {}
}))

// CORS with credentials: the React client on another port sends the session
// cookie with fetch(..., { credentials: 'include' }), which the browser only
// allows when the server names that exact origin (not *) and says credentials
// are welcome. https://expressjs.com/en/resources/middleware/cors.html
app.use(cors({
    origin: CLIENT_URL,
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true
}))

// Passport: initialize() wires it into Express, session() reads the user back
// out of the session on each request and sets req.user.
app.use(passport.initialize())
app.use(passport.session())
passport.use(GitHub)

// What goes into the session when someone logs in (everything but the access
// token, which was only needed for the GitHub handshake), and what comes back
// out as req.user on later requests.
passport.serializeUser((user, done) => {
    const { accesstoken, ...sessionUser } = user
    done(null, sessionUser)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

app.get('/', (req, res) => {
    res.status(200).send('<h1 style="text-align: center; margin-top: 50px;">✈️ On the Fly API</h1>')
})

app.use('/auth', authRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/destinations', destinationRoutes)
app.use('/api/trips-destinations', tripDestinationRoutes)
app.use('/api/users-trips', usersTripsRoutes)
app.use('/api/users', userRoutes)

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
