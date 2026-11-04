import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { request } from '../api'
import './CreateActivity.css'
import './Profile.css'

// The signed-in user's own page (Unit 8 lab, stretch): picture and username
// from GitHub, a short bio and a location they can edit (PATCH /api/users/me),
// and the trips they have been added to (GET /api/users-trips/trips/:username).
const Profile = ({ user, onSaved }) => {

    const [form, setForm] = useState({ bio: user.bio || '', location: user.location || '' })
    const [trips, setTrips] = useState([])
    const [status, setStatus] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let ignore = false
        request('/api/users-trips/trips/' + user.username)
            .then((data) => { if (!ignore) setTrips(data) })
            .catch((error) => console.error('Profile trips', error))
        return () => { ignore = true }
    }, [user.username])

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const save = async (event) => {
        event.preventDefault()
        setStatus('')
        setSaving(true)
        try {
            const saved = await request('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            onSaved({ ...user, bio: saved.bio, location: saved.location })
            setStatus('Saved.')
        } catch (e) {
            setStatus(e.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="Profile">
            <div className="profile-card">
                <img className="profile-img" src={user.avatarurl} alt="" />
                <h2>{user.username}</h2>
                {user.location && <p className="profile-location">📍 {user.location}</p>}
                {user.bio && <p className="profile-bio">{user.bio}</p>}
            </div>

            <form onSubmit={save} className="profile-form">
                <label>Short bio</label><br />
                <textarea rows="3" id="bio" name="bio" maxLength={280} value={form.bio} onChange={handleChange} placeholder="Weekend rider, loves coastal routes." />
                <br />
                <label>Location</label><br />
                <input type="text" id="location" name="location" maxLength={80} value={form.location} onChange={handleChange} placeholder="Sunnyvale, CA" /><br />
                <br />
                {status && <p className="profile-status">{status}</p>}
                <input type="submit" value={saving ? 'Saving…' : 'Save'} disabled={saving} />
            </form>

            <div className="profile-trips">
                <h3>My trips</h3>
                {trips.length === 0 ? (
                    <p>You are not on any trip yet. Create one, or ask a friend to add you.</p>
                ) : (
                    <ul>
                        {trips.map((trip) => (
                            <li key={trip.id}>
                                <Link to={'/trip/get/' + trip.id}>{trip.title}</Link>
                                <span> · {String(trip.start_date).slice(0, 10)} · {trip.num_days} days</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default Profile
