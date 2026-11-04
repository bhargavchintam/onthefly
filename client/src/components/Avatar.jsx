import { Link } from 'react-router'
import './Avatar.css'

// The signed-in user's GitHub picture in the header. It links to their own
// page, and the alt text carries the username for screen readers.
const Avatar = ({ user }) => (
    <Link to="/profile" className="Avatar" title={`Signed in as ${user.username}`}>
        <img className="user-img" src={user.avatarurl} alt={user.username} />
        <span className="user-name">{user.username}</span>
    </Link>
)

export default Avatar
