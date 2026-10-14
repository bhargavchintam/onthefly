// Loads server/.env before anything else runs. ES module imports are hoisted, so this
// has to be an import rather than a dotenv.config() call lower in server.js.
import 'dotenv/config'
import pg from 'pg'

const config = {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    // Render requires SSL. PGSSL=false turns it off for a local Postgres during development.
    ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false }
}

// Postgres DATE columns come back as plain 'YYYY-MM-DD' strings instead of JavaScript
// Date objects, which would shift by the server's time zone. 1082 is the DATE type id.
// https://node-postgres.com/features/types
pg.types.setTypeParser(1082, (value) => value)

// One pool for the whole server; each query borrows a connection and returns it.
// https://node-postgres.com/apis/pool
export const pool = new pg.Pool(config)
