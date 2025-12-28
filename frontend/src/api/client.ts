import axios from 'axios'

// Use environment variable if set, otherwise use Render backend URL
const getBaseUrl = () => {
    // In production (Vercel), use the Render backend
    // In development, use localhost
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL
    }

    // Check if we're in production (deployed)
    if (window.location.hostname !== 'localhost') {
        return 'https://gigschool.onrender.com/api/v1'
    }

    // Local development
    return 'http://localhost:8000/api/v1'
}

export const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
})

// TODO: Add request interceptor for JWT token
// api.interceptors.request.use((config) => { ... })

