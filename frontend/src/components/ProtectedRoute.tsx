import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Briefcase } from 'lucide-react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading, initialize } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        initialize()
    }, [initialize])

    useEffect(() => {
        if (!loading && !session) {
            navigate('/auth')
        }
    }, [session, loading, navigate])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Animated background orbs */}
                <div className="absolute top-1/3 -left-32 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Logo and spinner */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-6">
                        {/* Pulsing ring */}
                        <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-orange-500/20 animate-ping" style={{ animationDuration: '1.5s' }} />

                        {/* Glow effect */}
                        <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-orange-500 blur-xl opacity-30" />

                        {/* Logo */}
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                            <Briefcase className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                        GigSchool
                    </h2>

                    {/* Loading dots */}
                    <div className="flex items-center gap-1.5 mt-4">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Loading your workspace...
                    </p>
                </div>
            </div>
        )
    }

    if (!session) return null

    return <>{children}</>
}
