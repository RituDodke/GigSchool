import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { authApi } from '@/api/auth'
import { usersApi, UserProfile } from '@/api/users'

interface AuthState {
    session: Session | null
    user: User | null
    profile: UserProfile | null
    loading: boolean
    initialize: () => Promise<void>
    signInWithGoogle: () => Promise<void>
    signInWithEmail: (email: string, pass: string) => Promise<void>
    signUpWithEmail: (email: string, pass: string, username?: string) => Promise<void>
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    profile: null,
    loading: true,

    initialize: async () => {
        set({ loading: true })

        // Check active session
        const { data: { session } } = await supabase.auth.getSession()

        // Listen for changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user && _event === 'SIGNED_IN') {
                // Sync with backend on login
                try {
                    await authApi.syncUser(session.user)
                    const profile = await usersApi.getUser(session.user.id)
                    set({ profile })
                } catch (e) { console.error(e) }
            }
            set({ session, user: session?.user ?? null, loading: false })
        })

        // Load profile if session exists
        if (session?.user) {
            try {
                const profile = await usersApi.getUser(session.user.id)
                set({ profile })
            } catch (e) { console.error(e) }
        }

        set({ session, user: session?.user ?? null, loading: false })
    },

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`
            }
        })
        if (error) throw error
    },

    signInWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
    },

    signUpWithEmail: async (email, password, username) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        })
        if (error) throw error

        // After signup, sync with backend including username
        if (data.user) {
            try {
                await usersApi.syncUser({
                    id: data.user.id,
                    email: data.user.email!,
                    username
                })
            } catch (e) { console.error(e) }
        }
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ session: null, user: null, profile: null })
    },

    refreshProfile: async () => {
        const user = get().user
        if (user) {
            try {
                const profile = await usersApi.getUser(user.id)
                set({ profile })
            } catch (e) { console.error(e) }
        }
    }
}))

