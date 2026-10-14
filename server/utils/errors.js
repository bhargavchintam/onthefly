// Shared response helpers so every controller answers failures the same way.

// Logs the real error on the server and sends the client a generic message.
export const handleError = (res, error, context) => {
    console.error(`[${context}]`, error)
    res.status(500).json({ error: 'Something went wrong on the server. Please try again.' })
}

export const notFound = (res, what = 'That item') => {
    res.status(404).json({ error: `${what} was not found.` })
}

export const badRequest = (res, message) => {
    res.status(400).json({ error: message })
}

// Route params arrive as strings. Returns null for anything that is not a whole number.
export const parseId = (value) => (/^\d+$/.test(value) ? parseInt(value, 10) : null)
