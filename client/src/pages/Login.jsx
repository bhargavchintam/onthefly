import { API_URL } from '../api'
import './Login.css'

// The logged-out landing page (Unit 8 lab). The button is a plain link to the
// server's /auth/github route: that is a full page navigation, not a fetch,
// because GitHub has to show its own approval page and then send the browser
// back to the server's callback. The session cookie is set on the way back.
const Login = () => {
    const AUTH_URL = `${API_URL}/auth/github`
    const failed = new URLSearchParams(window.location.search).get('login') === 'failed'

    return (
        <div className="Login">
            <h1>On the Fly ✈️</h1>
            <p className="tagline">Plan trips with your friends. Sign in with GitHub to see your trips.</p>
            {failed && <p className="login-error">GitHub did not approve the login. Try again.</p>}
            <a href={AUTH_URL}>
                <button className="headerBtn">🔒 Login via Github</button>
            </a>
        </div>
    )
}

export default Login
