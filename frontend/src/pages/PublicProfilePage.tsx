import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/api/users'
import { reviewsApi } from '@/api/reviews'
import { portfolioApi } from '@/api/portfolio'
import { chatApi } from '@/api/chat'
import { useAuthStore } from '@/stores/authStore'
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid'
import { ReviewList } from '@/components/reviews/ReviewList'
import { StarRating } from '@/components/reviews/StarRating'
import { Loader2, Calendar, AlertCircle, MessageCircle } from 'lucide-react'

export default function PublicProfilePage() {
    const { userId } = useParams<{ userId: string }>()
    const navigate = useNavigate()
    const { user: currentUser } = useAuthStore()
    const [isStartingChat, setIsStartingChat] = useState(false)

    const handleMessage = async () => {
        if (!currentUser || !userId) return
        setIsStartingChat(true)
        try {
            await chatApi.getOrCreateConversation(currentUser.id, userId)
            navigate('/chat')
        } catch (error) {
            console.error('Failed to start chat:', error)
            alert('Failed to start chat')
        } finally {
            setIsStartingChat(false)
        }
    }

    const { data: userProfile, isLoading, error } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => usersApi.getUser(userId!),
        enabled: !!userId,
    })

    const { data: stats } = useQuery({
        queryKey: ['userStats', userId],
        queryFn: () => reviewsApi.getUserStats(userId!),
        enabled: !!userId,
    })

    const { data: reviews = [] } = useQuery({
        queryKey: ['userReviews', userId],
        queryFn: () => reviewsApi.getUserReviews(userId!),
        enabled: !!userId,
    })

    const { data: portfolio = [] } = useQuery({
        queryKey: ['userPortfolio', userId],
        queryFn: () => portfolioApi.getUserPortfolio(userId!),
        enabled: !!userId,
    })

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (error || !userProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
                <p className="text-lg font-medium">User not found</p>
                <p className="text-sm">The user you are looking for does not exist.</p>
            </div>
        )
    }

    const displayName = userProfile.username || userProfile.email.split('@')[0] || 'User'

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="card p-8">
                <div className="flex flex-col md:flex-row gap-6 md:items-start">
                    {userProfile.avatar_url ? (
                        <img
                            src={userProfile.avatar_url}
                            alt={displayName}
                            className="w-32 h-32 rounded-full object-cover shrink-0 border-4 border-white dark:border-gray-800 shadow-sm"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-4xl font-bold shadow-sm shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{displayName}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                {stats && (
                                    <>
                                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full border border-yellow-100 dark:border-yellow-800/50">
                                            <StarRating rating={Math.round(stats.average_rating)} size={14} className="mr-1" />
                                            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-500">{stats.average_rating || 'New'}</span>
                                        </div>
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{stats.total_reviews} reviews</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {userProfile.bio && (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
                                {userProfile.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-4 pt-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {new Date(userProfile.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {currentUser?.id !== userProfile.id && (
                            <div className="pt-2">
                                <button
                                    onClick={handleMessage}
                                    disabled={isStartingChat}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {isStartingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                                    Message
                                </button>
                            </div>
                        )}

                        {userProfile.skills && userProfile.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {userProfile.skills.map((skill, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Portfolio Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white px-1">Portfolio</h2>
                {portfolio.length > 0 ? (
                    <PortfolioGrid items={portfolio} isOwner={false} />
                ) : (
                    <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
                        <p>No portfolio items to display.</p>
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white px-1">Reviews</h2>
                <ReviewList reviews={reviews} />
            </div>
        </div>
    )
}
