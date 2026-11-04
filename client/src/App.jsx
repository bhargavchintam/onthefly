import './App.css';
import { useState, useEffect } from 'react';
import { Link, useRoutes } from 'react-router'
import { request } from './api'
import ReadTrips from './pages/ReadTrips'
import CreateTrip from './pages/CreateTrip'
import EditTrip from './pages/EditTrip'
import CreateDestination from './pages/CreateDestination';
import ReadDestinations from './pages/ReadDestinations'
import TripDetails from './pages/TripDetails'
import CreateActivity from './pages/CreateActivity';
import AddToTrip from './pages/AddToTrip';
import AddUserToTrip from './pages/AddUserToTrip';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Avatar from './components/Avatar';


const App = () => {

  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  // Who is signed in (Unit 8 lab). null means nobody; undefined means we have
  // not heard back from the server yet, so the page shows nothing instead of
  // flashing the login screen at a signed-in user.
  const [user, setUser] = useState(undefined);

  // Runs once after the first render (empty dependency list). Both lists are
  // loaded here, at the top of the app, and handed down to the pages as props.
  // Every call goes through request() in api.js, which adds the server address
  // and sends the session cookie. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  useEffect(() => {
    let ignore = false

    // Asks the server who the session cookie belongs to. 401 means nobody.
    const getUser = async () => {
      try {
        const json = await request('/auth/login/success')
        if (!ignore) setUser(json.user)
      } catch (error) {
        if (!ignore) setUser(null)
        if (error.status !== 401) console.error('getUser', error)
      }
    }

    const fetchTrips = async () => {
      try {
        const data = await request('/api/trips')
        if (!ignore) setTrips(data)
      } catch (error) {
        console.error('fetchTrips', error)
      }
    }

    const fetchDestinations = async () => {
      try {
        const data = await request('/api/destinations')
        if (!ignore) setDestinations(data)
      } catch (error) {
        console.error('fetchDestinations', error)
      }
    }

    getUser()
    fetchTrips()
    fetchDestinations()
    // The cleanup flips ignore so a late answer cannot set state after the
    // component is gone (grader feedback from Project 3).
    return () => { ignore = true }
  }, []);

  // Ends the session on the server, then reloads from the root so every piece
  // of state starts over as a visitor.
  const logout = async () => {
    try {
      await request('/auth/logout')
    } catch (error) {
      console.error('logout', error)
    }
    window.location.href = '/'
  }

  const signedIn = Boolean(user && user.id)
  // Every page is behind the login. A visitor sees the landing page whatever
  // the URL, and gets the page they asked for once they are signed in.
  const guard = (page) => (signedIn ? page : <Login />)

  // Sets up routes
  let element = useRoutes([
    {
      path: "/",
      element: guard(<ReadTrips data={trips} />)
    },
    {
      path: "/trip/new",
      element: guard(<CreateTrip user={user} />)
    },
    {
      path: "/edit/:id",
      element: guard(<EditTrip data={trips} />)
    },
    {
      path: "/destinations",
      element: guard(<ReadDestinations data={destinations} />)
    },
    {
      path: "/trip/get/:id",
      element: guard(<TripDetails data={trips} user={user} />)
    },
    {
      path: "/destination/new",
      element: guard(<CreateDestination />)
    },
    {
      path: "/activity/create/:trip_id",
      element: guard(<CreateActivity />)
    },
    {
      path: "/destinations/add/:destination_id",
      element: guard(<AddToTrip data={trips} />)
    },
    {
      path: "/users/add/:trip_id",
      element: guard(<AddUserToTrip data={trips} />)
    },
    {
      path: "/profile",
      element: guard(<Profile user={user} onSaved={setUser} />)
    }
  ]);

  // Nothing until the server has said who is signed in.
  if (user === undefined) return <div className="App" />

  return (

    <div className="App">

      {signedIn ? (
        <div className="header">
          <h1>On The Fly ✈️</h1>
          <Link to="/"><button className="headerBtn">Explore Trips</button></Link>
          <Link to="/destinations"><button className="headerBtn">Explore Destinations</button></Link>
          <Link to="/trip/new"><button className="headerBtn"> + Add Trip </button></Link>
          <Link to="/destination/new"><button className="headerBtn"> + Add Destination </button></Link>
          <button onClick={logout} className="headerBtn">Logout</button>
          <Avatar user={user} />
        </div>
      ) : null}
      {element}
    </div>

  );
}

export default App;
