import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Loader2 } from 'lucide-react'

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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!session) return null

    return <>{children}</>
}
