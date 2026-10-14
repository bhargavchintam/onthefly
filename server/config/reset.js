// Rebuilds every On the Fly table and loads the seed data. Run on purpose with
// `npm run reset`. It is never part of `npm start`, because it wipes saved data.
import { pool } from './database.js'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import fs from 'fs'

// ES modules have no __dirname, so build the path to data.json from this file's URL.
const currentPath = fileURLToPath(import.meta.url)
const dataFile = fs.readFileSync(path.join(dirname(currentPath), 'data', 'data.json'))
const data = JSON.parse(dataFile)

// Tables that reference others through foreign keys must be dropped first.
// DROP TABLE IF EXISTS is safe for a table that was never created.
const dropAllTables = async () => {
    await pool.query(`
        DROP TABLE IF EXISTS trips_users;
        DROP TABLE IF EXISTS trips_destinations;
        DROP TABLE IF EXISTS activities;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS destinations;
        DROP TABLE IF EXISTS trips;
    `)
    console.log('✔️ all tables dropped')
}

const createTripsTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS trips (
            id serial PRIMARY KEY,
            title varchar(100) NOT NULL,
            description varchar(500) NOT NULL,
            img_url text NOT NULL,
            num_days integer NOT NULL,
            start_date date NOT NULL,
            end_date date NOT NULL,
            total_cost money NOT NULL
        )
    `)
    console.log('🎉 trips table created')
}

const createDestinationsTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS destinations (
            id serial PRIMARY KEY,
            destination varchar(100) NOT NULL,
            description varchar(500) NOT NULL,
            city varchar(100) NOT NULL,
            country varchar(100) NOT NULL,
            img_url text NOT NULL,
            flag_img_url text NOT NULL
        )
    `)
    console.log('🎉 destinations table created')
}

// One trip has many activities (one-to-many). ON DELETE CASCADE removes a trip's
// activities when the trip is deleted, so no orphan rows are left behind.
const createActivitiesTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS activities (
            id serial PRIMARY KEY,
            trip_id int NOT NULL,
            activity varchar(100) NOT NULL,
            num_votes integer DEFAULT 0,
            FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
        )
    `)
    console.log('🎉 activities table created')
}

// Join table: a trip visits many destinations and a destination belongs to many trips
// (many-to-many). The composite primary key means a pair can only appear once.
const createTripsDestinationsTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS trips_destinations (
            trip_id int NOT NULL,
            destination_id int NOT NULL,
            PRIMARY KEY (trip_id, destination_id),
            FOREIGN KEY (trip_id) REFERENCES trips(id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (destination_id) REFERENCES destinations(id) ON UPDATE CASCADE ON DELETE CASCADE
        )
    `)
    console.log('🎉 trips_destinations table created')
}

// Filled in during the Unit 8 lab when GitHub login is added.
const createUsersTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id serial PRIMARY KEY,
            githubid integer NOT NULL,
            username varchar(100) NOT NULL,
            avatarurl varchar(500) NOT NULL,
            accesstoken varchar(500) NOT NULL
        )
    `)
    console.log('🎉 users table created')
}

const createTripsUsersTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS trips_users (
            trip_id int NOT NULL,
            user_id int NOT NULL,
            PRIMARY KEY (trip_id, user_id),
            FOREIGN KEY (trip_id) REFERENCES trips(id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
        )
    `)
    console.log('🎉 trips_users table created')
}

// Seeding returns id maps so the join rows and activities can point at the right parents.
const seedTrips = async () => {
    const ids = {}
    for (const trip of data.trips) {
        const result = await pool.query(
            `INSERT INTO trips (title, description, img_url, num_days, start_date, end_date, total_cost)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [trip.title, trip.description, trip.img_url, trip.num_days, trip.start_date, trip.end_date, trip.total_cost]
        )
        ids[trip.title] = result.rows[0].id
        console.log(`✅ ${trip.title} added`)
    }
    return ids
}

const seedDestinations = async () => {
    const ids = {}
    for (const place of data.destinations) {
        const result = await pool.query(
            `INSERT INTO destinations (destination, description, city, country, img_url, flag_img_url)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [place.destination, place.description, place.city, place.country, place.img_url, place.flag_img_url]
        )
        ids[place.destination] = result.rows[0].id
        console.log(`✅ ${place.destination} added`)
    }
    return ids
}

const seedActivities = async (tripIds) => {
    for (const item of data.activities) {
        await pool.query(
            'INSERT INTO activities (trip_id, activity, num_votes) VALUES ($1, $2, $3)',
            [tripIds[item.trip], item.activity, item.num_votes]
        )
    }
    console.log(`✅ ${data.activities.length} activities added`)
}

const seedTripsDestinations = async (tripIds, destinationIds) => {
    for (const link of data.trips_destinations) {
        await pool.query(
            'INSERT INTO trips_destinations (trip_id, destination_id) VALUES ($1, $2)',
            [tripIds[link.trip], destinationIds[link.destination]]
        )
    }
    console.log(`✅ ${data.trips_destinations.length} trip-destination links added`)
}

// Every step is awaited in order: parents before children, tables before rows.
const resetDatabase = async () => {
    try {
        await dropAllTables()
        await createTripsTable()
        await createDestinationsTable()
        await createActivitiesTable()
        await createTripsDestinationsTable()
        await createUsersTable()
        await createTripsUsersTable()
        const tripIds = await seedTrips()
        const destinationIds = await seedDestinations()
        await seedActivities(tripIds)
        await seedTripsDestinations(tripIds, destinationIds)
    } catch (error) {
        console.error('⚠️ reset failed:', error)
        process.exitCode = 1
    } finally {
        await pool.end()
    }
}

resetDatabase()
