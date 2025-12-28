import { useState } from 'react'
import { StarRating } from './StarRating'
import { Loader2, X } from 'lucide-react'
import { reviewsApi } from '@/api/reviews'

interface CreateReviewModalProps {
    jobId: string
    revieweeId: string
    revieweeName: string
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateReviewModal({ jobId, revieweeId, revieweeName, isOpen, onClose, onSuccess }: CreateReviewModalProps) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            setError('Please select a rating')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            await reviewsApi.createReview({
                job_id: jobId,
                reviewee_id: revieweeId,
                rating,
                comment: comment.trim() || ''
            })
            onSuccess()
            onClose()
        } catch (err: any) {
            if (err.response?.data?.detail) {
                setError(err.response.data.detail)
            } else {
                setError('Failed to submit review')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Review {revieweeName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    How was your experience working with {revieweeName}?
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                        <StarRating
                            rating={rating}
                            maxRating={5}
                            size={32}
                            interactive={true}
                            onRatingChange={setRating}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Comment (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="input-primary min-h-[100px] resize-none"
                            placeholder="Share details about your experience..."
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1 flex justify-center items-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Submit Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
