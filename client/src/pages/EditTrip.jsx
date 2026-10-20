import {useState, useEffect} from 'react';
import { useParams } from 'react-router';
import './EditTrip.css'

const EditTrip = ({data}) => {

    const {id} = useParams();
    const [post, setPost] = useState({id: 0, title: "", description: "", img_url: "", num_days: 0, start_date: "", end_date: "", total_cost: 0.0 })

    // The trip list arrives from App after its own fetch finishes, so on the first
    // render `data` can still be empty. The `if (result)` guard stops a crash when
    // this page is opened directly by URL before the list has loaded.
    useEffect(() => {
        const result = data.filter(item => item.id === parseInt(id))[0];
        if (result) {
            setPost({id: parseInt(result.id), title: result.title, description: result.description, img_url: result.img_url, num_days: parseInt(result.num_days), start_date: result.start_date.slice(0,10), end_date: result.end_date.slice(0,10), total_cost: result.total_cost});
        }
    }, [data, id]);


    const handleChange = (event) => {
        const {name, value} = event.target;
        setPost( (prev) => {
            return {
                ...prev,
                [name]:value,
            }
        })
    }
    

    // PATCH sends the edited fields to /api/trips/:id. The id is read from the URL
    // with useParams and joined to the path, which is how REST names one record.
    const updateTrip = async (event) => {
        event.preventDefault();

        const options = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        }

        await fetch('/api/trips/' + id, options)
        window.location.href = '/'
    }

    // DELETE needs no body and no headers, only the method and the id in the URL.
    // The server's ON DELETE CASCADE rules remove the trip's activities and join rows.
    const deleteTrip = async (event) => {
        event.preventDefault();

        const options = {
            method: 'DELETE'
        }

        await fetch('/api/trips/' + id, options)
        window.location.href = '/'
    }

    return (
        <div>
            <form>
                <label>Title</label> <br />
                <input type="text" id="title" name="title" value={post.title} onChange={handleChange}/><br />
                <br/>

                <label>Description</label><br />
                <textarea rows="5" cols="50" id="description" name="description" value={post.description} onChange={handleChange}>
                </textarea>
                <br/>

                <label>Image URL </label><br />
                <input type="text" id="img_url" name="img_url" value={post.img_url} onChange={handleChange}/><br />
                <br/>

                <label>Number of Days</label><br />
                <input type="number" id="num_days" name="num_days" value={post.num_days} onChange={handleChange}/><br />
                <br/>

                <label>Start Date </label><br />
                <input type="text" id="start_date" name="start_date" value={post.start_date} onChange={handleChange}/><br />
                <br/>

                <label>End Date </label><br />
                <input type="text" id="end_date" name="end_date" value={post.end_date} onChange={handleChange}/><br />
                <br/>

                <label>Total Cost</label><br />
                <input type="text" id="total_cost" name="total_cost" value={post.total_cost} onChange={handleChange}/><br />
                <br/>


                <input type="submit" value="Submit" onClick={updateTrip}/>
                <button className="deleteButton" onClick={deleteTrip}>Delete</button>
            </form>
        </div>
    )
}

export default EditTrip