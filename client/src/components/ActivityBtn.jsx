import {useState} from 'react';
import './ActivityBtn.css'

const ActivityBtn = (props) =>  {

  const [num_votes, setNumVotes] = useState(props.num_votes)

  // One click, two updates: PATCH the new total to the server and bump the local
  // state so the button changes right away without a page reload. The server
  // route is PATCH /api/activities/:id and it expects { num_votes }.
  const updateCount = async () => {
    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ num_votes: num_votes + 1 })
    }

    await fetch('/api/activities/' + props.id, options)
    // Function form of the setter: always works from the latest state value.
    setNumVotes((num_votes) => num_votes + 1)
  }

  return (
    <button className='activityBtn' id={props.id} onClick={updateCount}>
      {props.activity} <br/> {'△ ' + num_votes + ' Upvotes' }
    </button>
  )

}

export default ActivityBtn;
