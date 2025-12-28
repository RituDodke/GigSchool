import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { authApi } from '@/api/auth'

interface AuthState {
    session: Session | null
    user: User | null
    loading: boolean
    initialize: () => Promise<void>
    signInWithGoogle: () => Promise<void>
    signInWithEmail: (email: string, pass: string) => Promise<void>
    signUpWithEmail: (email: string, pass: string) => Promise<void>
    signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
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
                } catch (e) { console.error(e) }
            }
            set({ session, user: session?.user ?? null, loading: false })
        })

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

    signUpWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ session: null, user: null })
    }
}))
