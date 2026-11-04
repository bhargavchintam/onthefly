// Passport sets req.user from the session cookie on every request. Routes that
// change data for a person use this to refuse visitors with a 401 instead of
// letting a missing user crash the controller.
export const requireLogin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Log in to do that.' })
    next()
}
