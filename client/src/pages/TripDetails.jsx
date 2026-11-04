import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { request } from '../api'
import ActivityBtn from '../components/ActivityBtn';
import DestinationBtn from '../components/DestinationBtn';
import './TripDetails.css'

// Shows one trip plus the lists that belong to it: its activities
// (one-to-many), its destinations (many-to-many through trips_destinations),
// and its travelers (many-to-many through trips_users, Unit 8 lab). The trip
// itself comes from the list App already fetched; the lists are fetched here
// because they are specific to this trip. Only a traveler on the trip sees the
// page; anyone else gets a short note instead (stretch feature).
const TripDetails = ({ data, user }) => {

    const { id } = useParams();
    const [trip, setTrip] = useState({ id: 0, title: "", description: "", img_url: "", num_days: 0, start_date: "", end_date: "", total_cost: 0.0 })
    const [activities, setActivities] = useState([]);
    const [destinations, setDestinations] = useState([]);
    // null until the travelers have loaded, so the gate below does not refuse too early.
    const [travelers, setTravelers] = useState(null);

    // Pick this trip out of the list that App passed down. Guarded, because the
    // list is empty until App's fetch has finished.
    useEffect(() => {
        const result = data.filter(item => item.id === parseInt(id))[0];
        if (result) {
            setTrip({ id: parseInt(result.id), title: result.title, description: result.description, img_url: result.img_url, num_days: parseInt(result.num_days), start_date: result.start_date.slice(0, 10), end_date: result.end_date.slice(0, 10), total_cost: result.total_cost });
        }
    }, [data, id]);

    // Two GET requests for this trip's related rows. Both routes take the trip id
    // in the URL: GET /api/activities/:trip_id and
    // GET /api/trips-destinations/destinations/:trip_id (the join-table read).
    useEffect(() => {
        let ignore = false

        const fetchActivities = async () => {
            const data = await request('/api/activities/' + id)
            if (!ignore) setActivities(data)
        }

        const fetchDestinations = async () => {
            const data = await request('/api/trips-destinations/destinations/' + id)
            if (!ignore) setDestinations(data)
        }

        // GET /api/users-trips/users/:trip_id reads the trips_users join table.
        const fetchTravelers = async () => {
            const data = await request('/api/users-trips/users/' + id)
            if (!ignore) setTravelers(data)
        }

        Promise.all([fetchActivities(), fetchDestinations(), fetchTravelers()])
            .catch((error) => console.error('TripDetails', error))
        return () => { ignore = true }
    }, [id]);

    const isTraveler = travelers !== null && travelers.some((t) => t.id === user.id)

    if (travelers !== null && !isTraveler) {
        return (
            <div className="TripDetails">
                <div className="locked">
                    <h3>{trip.title || 'This trip'} is private</h3>
                    <p>Only travelers who were added to this trip can see its page. Ask the person who created it to add <strong>{user.username}</strong>.</p>
                    <Link to="/"><button className="headerBtn">Back to trips</button></Link>
                </div>
            </div>
        )
    }

    return (
        <div className="TripDetails">
            <div className="flex-container">
                <div className="left-side">
                    <h3>{trip.title}</h3>
                    <p>{'🗓️ Duration: ' + trip.num_days + ' days'}</p>
                    <p>{'🛫 Depart: ' + trip.start_date}</p>
                    <p>{'🛬 Return: ' + trip.end_date}</p>
                    <p>{trip.description}</p>
                </div>

                <div className="right-side" style={{ backgroundImage: `url(${trip.img_url})` }}>
                </div>
            </div>

            <div className="flex-container">
                <div className="travelers">
                    {
                        travelers && travelers.length > 0 ?
                        travelers.map((traveler) =>
                            <p key={traveler.id} className="traveler">
                                <img className="traveler-img" src={traveler.avatarurl} alt="" />
                                {traveler.username}{traveler.id === user.id ? ' (you)' : ''}
                            </p>
                        ) : <p>No travelers yet</p>
                    }
                    <br />
                    <Link to={'/users/add/' + id}><button className="addActivityBtn">+ Add Traveler</button></Link>
                </div>

                <div className="activities">
                    {
                        activities && activities.length > 0 ?
                        activities.map((activity) =>
                            <ActivityBtn key={activity.id}
                                id={activity.id}
                                activity={activity.activity}
                                num_votes={activity.num_votes} />
                        ) : <p>No activities yet</p>
                    }
                    <br />
                    <Link to={'/activity/create/' + id}><button className="addActivityBtn">+ Add Activity</button></Link>
                </div>

                <div className="destinations">
                    {
                        destinations && destinations.length > 0 ?
                        destinations.map((destination) =>
                            <DestinationBtn key={destination.id}
                                id={destination.id}
                                destination={destination.destination} />
                        ) : <p>No destinations yet</p>
                    }
                    <br />
                    <Link to="/destinations"><button className="addDestinationBtn">+ Add Destination</button></Link>
                </div>
            </div>
        </div>
    )
}

export default TripDetails
