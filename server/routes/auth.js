import express from 'express'
import passport from 'passport'

// Mounted at /auth. Login starts at /auth/github, GitHub sends the browser back
// to /auth/github/callback, and the client asks /auth/login/success on every
// load to learn who is signed in (the session cookie answers that).
const router = express.Router()

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// GET /auth/login/success   { success, user } with 200 when a session exists, 401 when not
router.get('/login/success', (req, res) => {
    if (req.user) {
        return res.status(200).json({ success: true, user: req.user })
    }
    res.status(401).json({ success: false, user: null })
})

// GET /auth/login/failed   where GitHub sends a login that did not go through
router.get('/login/failed', (req, res) => {
    res.status(401).json({ success: false, message: 'failure' })
})

// GET /auth/logout   ends the Passport login, destroys the session, clears the cookie
router.get('/logout', (req, res, next) => {
    req.logout((error) => {
        if (error) return next(error)
        req.session.destroy(() => {
            res.clearCookie('connect.sid')
            res.json({ status: 'logout', user: {} })
        })
    })
})

// GET /auth/github   sends the browser to GitHub's approval page
router.get('/github', passport.authenticate('github', { scope: ['read:user'] }))

// GET /auth/github/callback   GitHub comes back here; Passport finishes the login
// and the browser lands on the client either way.
router.get(
    '/github/callback',
    passport.authenticate('github', {
        successRedirect: CLIENT_URL,
        failureRedirect: `${CLIENT_URL}/?login=failed`
    })
)

export default router
