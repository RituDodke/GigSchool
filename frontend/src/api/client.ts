import axios from 'axios'

// Use the same host as the frontend, but port 8000 for the backend
const getBaseUrl = () => {
    const host = window.location.hostname
    return `http://${host}:8000/api/v1`
}

export const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
})

// TODO: Add request interceptor for JWT token
// api.interceptors.request.use((config) => { ... })
