import axios from 'axios'

export const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
})

// TODO: Add request interceptor for JWT token
// api.interceptors.request.use((config) => { ... })
