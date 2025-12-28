import { Star } from 'lucide-react'

interface StarRatingProps {
    rating: number
    maxRating?: number
    size?: number
    interactive?: boolean
    onRatingChange?: (rating: number) => void
    className?: string
}

export function StarRating({
    rating,
    maxRating = 5,
    size = 16,
    interactive = false,
    onRatingChange,
    className = ''
}: StarRatingProps) {
    return (
        <div className={`flex items-center gap-0.5 ${className}`}>
            {Array.from({ length: maxRating }).map((_, index) => {
                const isFilled = index < rating
                return (
                    <button
                        key={index}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onRatingChange?.(index + 1)}
                        className={`transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                    >
                        <Star
                            size={size}
                            className={`${isFilled
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-100 text-gray-300 dark:fill-gray-800 dark:text-gray-700'
                                }`}
                        />
                    </button>
                )
            })}
        </div>
    )
}
