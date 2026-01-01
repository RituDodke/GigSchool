import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
    rating: number
    maxRating?: number
    size?: number
    interactive?: boolean
    onRatingChange?: (rating: number) => void
    className?: string
    showLabel?: boolean
}

export function StarRating({
    rating,
    maxRating = 5,
    size = 16,
    interactive = false,
    onRatingChange,
    className = '',
    showLabel = false
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0)

    // Determine which stars to fill: hover preview takes priority in interactive mode
    const displayRating = interactive && hoverRating > 0 ? hoverRating : rating

    // Calculate minimum tap target size (44px for mobile accessibility)
    const buttonSize = Math.max(size + 12, 44)

    return (
        <div className={`flex flex-col items-center gap-1 ${className}`}>
            <div
                className="flex items-center gap-0.5"
                onMouseLeave={() => interactive && setHoverRating(0)}
            >
                {Array.from({ length: maxRating }).map((_, index) => {
                    const starNumber = index + 1
                    const isFilled = index < displayRating
                    const isHovered = interactive && hoverRating > 0 && index < hoverRating

                    return (
                        <button
                            key={index}
                            type="button"
                            disabled={!interactive}
                            onClick={() => interactive && onRatingChange?.(starNumber)}
                            onMouseEnter={() => interactive && setHoverRating(starNumber)}
                            style={{
                                width: interactive ? buttonSize : 'auto',
                                height: interactive ? buttonSize : 'auto'
                            }}
                            className={`
                                flex items-center justify-center
                                transition-all duration-150 ease-out
                                ${interactive
                                    ? 'cursor-pointer hover:scale-110 active:scale-95'
                                    : 'cursor-default'
                                }
                                ${interactive ? 'rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : ''}
                            `}
                        >
                            <Star
                                size={size}
                                className={`
                                    transition-all duration-150 ease-out
                                    ${isFilled || isHovered
                                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                                        : 'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600'
                                    }
                                    ${isHovered && !isFilled ? 'fill-yellow-300 text-yellow-300' : ''}
                                `}
                            />
                        </button>
                    )
                })}
            </div>
            {showLabel && interactive && (
                <span className="text-xs text-gray-500 dark:text-gray-400 h-4">
                    {displayRating > 0 ? `${displayRating} of ${maxRating} stars` : 'Select a rating'}
                </span>
            )}
        </div>
    )
}
