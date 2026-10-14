# On the Fly

CodePath WEB103 Unit 5 lab (Part 1): the backend for a trip planner. Express API on top of a PostgreSQL database with six tables: `trips`, `destinations`, `activities` (one trip has many activities), `trips_destinations` (join table, many-to-many), `users`, and `trips_users` (join table for the Unit 8 login lab).

## Run it

```
cd server
cp .env.example .env     # fill in the Render PostgreSQL values
npm install
npm run reset            # creates the tables and loads the seed data (run on purpose, never on start)
npm start                # nodemon on http://localhost:3001
```

## Routes

| method and path | what it does |
|---|---|
| GET /api/trips | all trips |
| GET /api/trips/:id | one trip, 404 if missing |
| POST /api/trips | create a trip (201) |
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
