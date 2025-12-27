import { api } from './client'
import { User } from '@supabase/supabase-js'

export const authApi = {
    syncUser: async (user: User) => {
        // Transform Supabase User to Backend UserCreate schema
        const payload = {
            email: user.email!,
            id: user.id,
            metadata: user.user_metadata || {}
        }
        const res = await api.post('/auth/sync', payload)
        return res.data
    },

    getMe: async () => {
        const res = await api.get('/auth/me')
        return res.data
    }
}
