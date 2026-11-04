// Passport's GitHub strategy (Unit 8 lab). Passport is Express middleware for
// logging in; a strategy is one way of doing it. GitHub's OAuth flow: the browser
// is sent to GitHub, the user approves, GitHub sends the browser back to our
// callback URL with a code, and the strategy swaps that code for an access token
// and the user's public profile. Our verify() then finds or creates the matching
// row in the users table, and that row becomes req.user.
// https://www.passportjs.org/packages/passport-github2/
import { Strategy as GitHubStrategy } from 'passport-github2'
import { pool } from './database.js'

const options = {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    // GitHub sends the user back here after they approve. It must match the
    // "Authorization callback URL" on the OAuth app exactly. On Render it is the
    // service URL plus /auth/github/callback.
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/auth/github/callback',
    // The automated test points these three at a stand-in GitHub; real runs never set them.
    ...(process.env.GITHUB_AUTHORIZATION_URL && {
        authorizationURL: process.env.GITHUB_AUTHORIZATION_URL,
        tokenURL: process.env.GITHUB_TOKEN_URL,
        userProfileURL: process.env.GITHUB_USER_PROFILE_URL
    })
}

// Called once per login with the token and the GitHub profile. The fourth
// argument tells Passport whether the login worked: callback(null, user) for
// yes, callback(error) for a problem.
const verify = async (accessToken, refreshToken, profile, callback) => {
    const { _json: { id, login, avatar_url } } = profile
    const userData = { githubId: id, username: login, avatarUrl: avatar_url, accessToken }

    try {
        const results = await pool.query('SELECT * FROM users WHERE githubid = $1', [userData.githubId])
        const user = results.rows[0]

        if (!user) {
            const inserted = await pool.query(
                `INSERT INTO users (githubid, username, avatarurl, accesstoken)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [userData.githubId, userData.username, userData.avatarUrl, userData.accessToken]
            )
            return callback(null, inserted.rows[0])
        }

        // Same GitHub account, possibly a new username or picture: keep the row current.
        const updated = await pool.query(
            `UPDATE users SET username = $1, avatarurl = $2, accesstoken = $3
             WHERE id = $4
             RETURNING *`,
            [userData.username, userData.avatarUrl, userData.accessToken, user.id]
        )
        return callback(null, updated.rows[0])
    } catch (error) {
        return callback(error)
    }
}

export const GitHub = new GitHubStrategy(options, verify)
