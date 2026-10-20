import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import ActivityBtn from '../components/ActivityBtn';
import DestinationBtn from '../components/DestinationBtn';
import './TripDetails.css'

// Shows one trip plus the two lists that belong to it: its activities
// (one-to-many) and its destinations (many-to-many through trips_destinations).
// The trip itself comes from the list App already fetched; the two lists are
// fetched here because they are specific to this trip.
const TripDetails = ({ data }) => {

    const { id } = useParams();
    const [trip, setTrip] = useState({ id: 0, title: "", description: "", img_url: "", num_days: 0, start_date: "", end_date: "", total_cost: 0.0 })
    const [activities, setActivities] = useState([]);
    const [destinations, setDestinations] = useState([]);

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
        const fetchActivities = async () => {
            const response = await fetch('/api/activities/' + id)
            const data = await response.json()
            setActivities(data)
        }

        const fetchDestinations = async () => {
            const response = await fetch('/api/trips-destinations/destinations/' + id)
            const data = await response.json()
            setDestinations(data)
        }

        fetchActivities()
        fetchDestinations()
    }, [id]);

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
