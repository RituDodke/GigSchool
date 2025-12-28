import { Review } from '@/api/reviews'
import { StarRating } from '@/components/reviews/StarRating'
import { User } from 'lucide-react'

interface ReviewListProps {
    reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No reviews yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 text-sm font-semibold">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <StarRating rating={review.rating} size={14} />
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    {review.comment && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 pl-10">
                            "{review.comment}"
                        </p>
                    )}
                </div>
            ))}
        </div>
    )
}
