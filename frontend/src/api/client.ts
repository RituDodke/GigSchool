import axios from 'axios'
import { supabase } from '@/lib/supabase'

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
    timeout: 30000, // 30 second timeout
})

// Cache the token to avoid blocking every request
let cachedToken: string | null = null

// Update cached token when auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
    cachedToken = session?.access_token || null
})

// Initialize token from existing session
supabase.auth.getSession().then(({ data }) => {
    cachedToken = data.session?.access_token || null
})

// Add request interceptor for JWT token (synchronous now)
api.interceptors.request.use((config) => {
    if (cachedToken) {
        config.headers.Authorization = `Bearer ${cachedToken}`
    }
    return config
})
