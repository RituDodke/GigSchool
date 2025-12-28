import { Job } from '@/api/jobs'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Calendar, Tag, ArrowRight, User, Check, Bookmark } from 'lucide-react'

interface JobCardProps {
    job: Job
    onApply: (jobId: string) => void
    onClick?: (job: Job) => void
    hasApplied?: boolean
    isBookmarked?: boolean
    onBookmark?: (jobId: string) => void
}

const categoryColors: Record<string, string> = {
    'general': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'tutoring': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'design': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'coding': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'writing': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'other': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

export function JobCard({ job, onApply, onClick, hasApplied, isBookmarked, onBookmark }: JobCardProps) {
    const statusStyles: Record<string, string> = {
        'OPEN': 'tag-orange',
        'CLOSED': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        'COMPLETED': 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    }

    const creatorName = job.creator?.username || job.creator?.email?.split('@')[0] || 'Anonymous'

    return (
        <div
            className="card p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            onClick={() => onClick?.(job)}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {job.title}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {onBookmark && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onBookmark(job.id)
                            }}
                            className={`p-1 rounded transition-colors ${isBookmarked
                                ? 'text-orange-500 hover:text-orange-600'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                        >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                    )}
                    <span className={`tag ${statusStyles[job.status] || 'tag'}`}>
                        {job.status}
                    </span>
                </div>
            </div>

            {/* Creator Info */}
            <div
                className="flex items-center gap-2 mb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1 py-0.5 -ml-1 transition-colors w-fit"
                onClick={(e) => {
                    e.stopPropagation()
                    // If we have a creator ID, navigate to profile. 
                    // Note: We need to use window.location or useNavigate from react-router. 
                    // Since this is a presentational component, ideally we'd use Link but we are inside a clickable card.
                    // Let's use window.location for simplicity or better yet, stopPropagation for a Link.
                }}
            >
                <Link to={`/profile/${job.creator_id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                    {job.creator?.avatar_url ? (
                        <img src={job.creator.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        </div>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium hover:text-orange-600 hover:underline">
                        {creatorName}
                    </span>
                </Link>
                <span className={`tag text-xs ${categoryColors[job.category] || categoryColors.general}`}>
                    {job.category}
                </span>
            </div>

            {/* Description */}
            {/* Description */}
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 prose dark:prose-invert max-w-none">
                <ReactMarkdown>{job.description}</ReactMarkdown>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {job.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">
                        <Tag className="w-3 h-3" />
                        {tag}
                    </span>
                ))}
                {job.tags.length > 3 && (
                    <span className="text-xs text-gray-400">+{job.tags.length - 3}</span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(job.created_at).toLocaleDateString()}
                </div>

                {hasApplied ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4" />
                        Applied
                    </span>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onApply(job.id)
                        }}
                        className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors group/btn"
                    >
                        Apply
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    )
}
