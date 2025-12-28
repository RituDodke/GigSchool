import { api } from './client'

export interface UserProfile {
    id: string
    email: string
    username: string | null
    avatar_url: string | null
    metadata: Record<string, any>
    created_at: string
}

export interface UpdateUserData {
    username?: string
    avatar_url?: string
}

export const usersApi = {
    getUser: async (userId: string) => {
        const response = await api.get<UserProfile>(`/auth/${userId}`)
        return response.data
    },

    updateUser: async (userId: string, data: UpdateUserData) => {
        const response = await api.patch<UserProfile>(`/auth/${userId}`, data)
        return response.data
    },

    syncUser: async (user: { id: string; email: string; username?: string }) => {
        const response = await api.post<UserProfile>('/auth/sync', user)
        return response.data
    }
}
