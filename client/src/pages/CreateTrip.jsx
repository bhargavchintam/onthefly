import { useState } from 'react';
import { request } from '../api'
import './CreateTrip.css'

const CreateTrip = () => {

    const [trip, setTrip] = useState({id: 0, title: "", description: "", img_url: "", num_days: 0, start_date: "", end_date: "", total_cost: 0.0 })
    
    const handleChange = (event) => {
        const {name, value} = event.target;
        setTrip( (prev) => {
            return {
                ...prev,
                [name]:value,
            }
        })
    }
    
    // Sends the form state to the server as a JSON request body.
    // preventDefault stops the browser's own form submit, which would reload the page
    // and drop our fetch. The options object is where the method, headers, and body
    // go; without 'Content-Type: application/json' the server's express.json()
    // middleware ignores the body. https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
    const createTrip = async (event) => {
        event.preventDefault();

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(trip)
        }

        // Wait for the server to answer before leaving the page, so the new trip
        // is already in the database when the home page fetches the list again.
        await request('/api/trips', options)
        window.location.href = '/'
    }


    return (
        <div>
            <center><h3> Create New Trip</h3></center>
            <form>
                <label>Title</label> <br />
                <input type="text" id="title" name="title" value={trip.title} onChange={handleChange}/><br />
                <br/>

                <label>Description</label><br />
                <textarea rows="5" cols="50" id="description" name="description" value={trip.description} onChange={handleChange}>
                </textarea>
                <br/>

                <label>Image URL </label><br />
                <input type="text" id="img_url" name="img_url" value={trip.img_url} onChange={handleChange}/><br />
                <br/>

                <label>Number of Days</label><br />
                <input type="number" id="num_days" name="num_days" value={trip.num_days} onChange={handleChange}/><br />
                <br/>

                <label>Start Date </label><br />
                <input type="text" id="start_date" name="start_date" value={trip.start_date} onChange={handleChange}/><br />
                <br/>

                <label>End Date </label><br />
                <input type="text" id="end_date" name="end_date" value={trip.end_date} onChange={handleChange}/><br />
                <br/>

                <label>Total Cost</label><br />
                <input type="text" id="total_cost" name="total_cost" value={trip.total_cost} onChange={handleChange}/><br />
                <br/>

                <input type="submit" value="Submit" onClick={createTrip} />
            </form>
        </div>
    )
}

export default CreateTrip