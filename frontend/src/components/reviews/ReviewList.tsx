import { Review } from '@/api/reviews'
import { StarRating } from '@/components/reviews/StarRating'
import { User, MessageSquare } from 'lucide-react'

interface ReviewListProps {
    reviews: Review[]
    showEmpty?: boolean
}

// Helper function for relative date formatting
function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ReviewList({ reviews, showEmpty = true }: ReviewListProps) {
    if (reviews.length === 0 && showEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h4 className="text-gray-700 dark:text-gray-300 font-medium mb-1">No reviews yet</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    Reviews will appear here once the job is completed
                </p>
            </div>
        )
    }

    if (reviews.length === 0) return null

    return (
        <div className="space-y-3">
            {reviews.map((review, index) => (
                <div
                    key={review.id}
                    className="
                        p-4 bg-white dark:bg-gray-800/50 rounded-xl 
                        border border-gray-100 dark:border-gray-700/50
                        shadow-sm hover:shadow-md
                        transition-all duration-200 ease-out
                        animate-fade-in
                    "
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    {/* Header: Avatar, Rating, Date */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <StarRating rating={review.rating} size={16} />
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {formatRelativeDate(review.created_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                {review.rating}.0
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                        <div className="relative pl-4 ml-1">
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-orange-300 to-orange-100 dark:from-orange-600 dark:to-orange-900/50" />
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                {review.comment}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
