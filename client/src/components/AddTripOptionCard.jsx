import { useParams } from 'react-router';
import './Card.css'


const AddTripOptionCard = (props) =>  {
  const {destination_id} = useParams();

  // Links one destination to one trip by inserting a row in the join table.
  // props.id is the trip this card shows; destination_id comes from the URL
  // (/destinations/add/:destination_id). The server answers 201 for a new link
  // and 200 if the pair was already linked (ON CONFLICT DO NOTHING).
  const addToTrip = async (event) => {
    event.preventDefault();

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ trip_id: props.id, destination_id: destination_id })
    }

    await fetch('/api/trips-destinations', options)
    window.location.href = '/trip/get/' + props.id
  }

  return (
      <div className="Card" style={{ backgroundImage:`url(${props.img_url})`}} >
        <div className="card-info">
          <h2 className="title">{props.title}</h2>
          <p className="description">{props.description}</p>
          <button className="addToTrip" onClick={addToTrip}>+ Add to Trip</button>
        </div>
      </div>
  );
};

export default AddTripOptionCard;