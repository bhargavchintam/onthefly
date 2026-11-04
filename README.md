# On the Fly

CodePath WEB103 lab, Parts 1 to 3: a trip planner with an Express API (`server/`) and a React client (`client/`). The PostgreSQL database has six tables: `trips`, `destinations`, `activities` (one trip has many activities), `trips_destinations` (join table, many-to-many), `users` (one row per GitHub account that has signed in), and `trips_users` (join table: who is traveling on which trip).

## Part 3 walkthrough (Unit 8): login with GitHub

Required: sign in with GitHub, see the username and picture in the header, see the trips dashboard when signed in and the landing page when signed out, log out. Stretch: add a friend to a trip by GitHub username and see them on the trip page, only travelers on a trip can open its page, a user page with the trips you were added to and a short bio and location.

![On the Fly Part 3 walkthrough](walkthrough-part3.gif)

How the login works. The Login page's button is a plain link to `GET /auth/github` on the server. Passport's GitHub strategy (`server/config/auth.js`) sends the browser to GitHub, GitHub asks the user to approve, and sends the browser back to `GET /auth/github/callback` with a code. The strategy swaps the code for an access token and the public profile, and `verify()` finds the matching row in `users` by GitHub id or inserts one. express-session then stores that user in a server-side session and gives the browser a `connect.sid` cookie; `serializeUser` drops the access token first, so the token never leaves the server. On every later request `passport.session()` turns the cookie back into `req.user`. The client asks `GET /auth/login/success` on load to learn who is signed in (200 with the user, 401 when nobody), and `GET /auth/logout` ends the session and clears the cookie.

The client calls the server by its full address (`client/src/api.js`, `API_URL`) with `credentials: 'include'`, so the cookie travels with each request; the server's CORS setup names the client origin and allows credentials. Every page is behind the login in `App.jsx`: a visitor sees the landing page whatever the URL. `VITE_API_URL` is the one value to change when the client is deployed.

Stretch routes: `POST /api/users-trips/create/:trip_id` adds a traveler by GitHub username (the friend must have signed in once, so their `users` row exists; 404 says so, 409 for a duplicate), `GET /api/users-trips/users/:trip_id` lists the travelers on a trip, `GET /api/users-trips/trips/:username` lists the trips a user is on, and `DELETE /api/users-trips/:trip_id/:user_id` removes one. Creating a trip while signed in adds the creator as the first traveler. `GET` and `PATCH /api/users/me` read and update the signed-in user's bio and location; the writes need a session (401 otherwise).

## Part 2 walkthrough (Unit 6)

Explore trips, open a trip with its activities and destinations, upvote an activity, add an activity, add a destination to a trip, create a trip, edit it, delete it, and create a destination.

![On the Fly Part 2 walkthrough](walkthrough.gif)

## Run it

Two terminals. The React code calls the server at `API_URL` (`client/src/api.js`, `http://localhost:3001` unless `VITE_API_URL` is set).

GitHub OAuth app (once): on GitHub, Settings, Developer settings, OAuth Apps, New OAuth App. Application name On The Fly, Homepage URL `http://localhost:5173`, Authorization callback URL `http://localhost:3001/auth/github/callback`. Copy the client id into `server/.env` as `GITHUB_CLIENT_ID`, generate a client secret and copy it as `GITHUB_CLIENT_SECRET`, and set `SESSION_SECRET` to any long random string. The secret is never committed.

```
cd server
cp .env.example .env     # fill in the Render PostgreSQL values and the GitHub OAuth values
npm install
npm run reset            # creates the tables and loads the seed data (run on purpose, never on start)
npm start                # nodemon on http://localhost:3001
```

```
cd client
npm install
npm run dev              # Vite on http://localhost:5173
```

## Client pages (Part 2)

| path | page | what it calls |
|---|---|---|
| / | all trips, or the login page when signed out | GET /api/trips (fetched once in App.jsx), GET /auth/login/success |
| /profile | the signed-in user's page: bio, location, trips they are on | GET /api/users-trips/trips/:username, PATCH /api/users/me |
| /users/add/:trip_id | add a traveler to a trip by GitHub username | POST /api/users-trips/create/:trip_id |
| /trip/new | create a trip | POST /api/trips |
| /edit/:id | edit or delete a trip | PATCH and DELETE /api/trips/:id |
| /trip/get/:id | trip details with travelers, activities, and destinations (travelers only) | GET /api/users-trips/users/:id, GET /api/activities/:id, GET /api/trips-destinations/destinations/:id |
| /activity/create/:trip_id | add an activity | POST /api/activities/:trip_id |
| /destinations | all destinations | GET /api/destinations (fetched once in App.jsx) |
| /destination/new | create a destination | POST /api/destinations |
| /destinations/add/:destination_id | pick the trip to add a destination to | POST /api/trips-destinations |

The upvote button on an activity sends PATCH /api/activities/:id with the new count and updates its own state without a reload.

## Routes

| method and path | what it does |
|---|---|
| GET /auth/github | start the GitHub login |
| GET /auth/github/callback | where GitHub sends the browser back; ends on the client |
| GET /auth/login/success | the signed-in user (200) or 401 |
| GET /auth/logout | end the session and clear the cookie |
| GET /api/users/me, PATCH /api/users/me | the signed-in user's bio and location |
| POST /api/users-trips/create/:trip_id | add a traveler by GitHub username |
| GET /api/users-trips/users/:trip_id | travelers on a trip |
| GET /api/users-trips/trips/:username | trips a user is on |
| DELETE /api/users-trips/:trip_id/:user_id | remove a traveler |
| GET /api/trips | all trips |
| GET /api/trips/:id | one trip, 404 if missing |
| POST /api/trips | create a trip (201); the signed-in user becomes its first traveler |
| PATCH /api/trips/:id | update a trip |
| DELETE /api/trips/:id | delete a trip and, through ON DELETE CASCADE, its activities and join rows |
| GET /api/activities | all activities |
| GET /api/activities/:trip_id | activities for one trip, most votes first |
| POST /api/activities/:trip_id | add an activity to a trip |
| PATCH /api/activities/:id | update the vote count |
| DELETE /api/activities/:id | delete an activity |
| GET /api/destinations | all destinations |
| GET /api/destinations/:id | one destination |
| POST /api/destinations | create a destination |
| PATCH /api/destinations/:id | update a destination |
| DELETE /api/destinations/:id | delete a destination |
| GET /api/trips-destinations | every trip-destination link |
| GET /api/trips-destinations/trips/:destination_id | trips that visit a destination |
| GET /api/trips-destinations/destinations/:trip_id | destinations on a trip |
| POST /api/trips-destinations | link a trip to a destination |

Bad ids return 404 JSON, missing fields return 400 with the field names, a body that is not valid JSON returns 400, and anything unexpected returns a generic 500 while the real error is logged on the server.

Seed data is made up for the lab. Images are Wikimedia Commons thumbnails.
