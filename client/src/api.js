// One place for the server's address and one fetch helper for every call.
//
// Unit 8 lab: the client now talks to the server directly (no Vite proxy) so
// the session cookie travels with each request. credentials: 'include' is what
// makes the browser send the connect.sid cookie to another origin, and the
// server's CORS setup names this origin and allows credentials for it.
// When the app is deployed, VITE_API_URL points at the Render service and
// nothing else changes.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Prefixes the path, sends the cookie, parses JSON, and turns a non-2xx answer
// into a thrown Error with the server's message (grader feedback from Project 2:
// check response.ok before trusting the body).
export async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { credentials: 'include', ...options })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error((data && data.error) || `Request failed (${response.status}).`)
    error.status = response.status
    throw error
  }
  return data
}
