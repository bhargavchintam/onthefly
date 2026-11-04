import { useState } from 'react';
import { useParams } from 'react-router';
import { request } from '../api'
import './CreateActivity.css'

// Adds a traveler to a trip by GitHub username (Unit 8 lab, stretch). The
// server looks the username up in the users table, so the friend must have
// signed in to On the Fly once; otherwise the message under the form says so.
const AddUserToTrip = ({ data }) => {

    const { trip_id } = useParams();
    const trip = data.find((item) => item.id === parseInt(trip_id))
    const [username, setUsername] = useState({ username: '' })
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target
        setUsername((prev) => ({ ...prev, [name]: value }))
    }

    // POST /api/users-trips/create/:trip_id with { username }. On success the
    // trip page shows the new traveler; on 404 or 409 the server's message
    // stays on this page.
    const addUserToTrip = async (event) => {
        event.preventDefault()
        setError('')
        setSaving(true)
        try {
            await request('/api/users-trips/create/' + trip_id, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(username)
            })
            window.location.href = '/trip/get/' + trip_id
        } catch (e) {
            setError(e.message)
            setSaving(false)
        }
    }

    return (
        <div>
            <center><h3>Add a Traveler to {trip ? trip.title : 'this trip'}</h3></center>
            <form onSubmit={addUserToTrip}>
                <label>Enter GitHub Username:</label><br />
                <input type="text" id="username" name="username" value={username.username} onChange={handleChange} autoComplete="off" /><br />
                <br />

                <label>Trip ID</label><br />
                <input type="number" id="trip_id" name="trip_id" value={trip_id} readOnly /><br />
                <br />

                {error && <p style={{ color: '#b00020', fontSize: 18 }}>{error}</p>}

                <input type="submit" value={saving ? 'Adding…' : 'Submit'} disabled={saving || username.username.trim() === ''} />
            </form>
        </div>
    )
}

export default AddUserToTrip
