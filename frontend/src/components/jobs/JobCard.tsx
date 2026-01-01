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

const categoryColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string; icon: string }> = {
    'general': { bg: 'bg-slate-100', text: 'text-slate-700', darkBg: 'dark:bg-slate-700/50', darkText: 'dark:text-slate-300', icon: '📋' },
    'tutoring': { bg: 'bg-blue-50', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/40', darkText: 'dark:text-blue-300', icon: '📚' },
    'design': { bg: 'bg-purple-50', text: 'text-purple-700', darkBg: 'dark:bg-purple-900/40', darkText: 'dark:text-purple-300', icon: '🎨' },
    'coding': { bg: 'bg-emerald-50', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/40', darkText: 'dark:text-emerald-300', icon: '💻' },
    'writing': { bg: 'bg-amber-50', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/40', darkText: 'dark:text-amber-300', icon: '✍️' },
    'other': { bg: 'bg-rose-50', text: 'text-rose-700', darkBg: 'dark:bg-rose-900/40', darkText: 'dark:text-rose-300', icon: '✨' },
}

const statusConfig: Record<string, { classes: string; dot: string }> = {
    'OPEN': {
        classes: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200/50 dark:from-orange-900/30 dark:to-amber-900/30 dark:text-orange-300 dark:border-orange-700/50',
        dot: 'bg-orange-500'
    },
    'CLOSED': {
        classes: 'bg-gray-100 text-gray-600 border border-gray-200/50 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600/50',
        dot: 'bg-gray-400'
    },
    'IN_PROGRESS': {
        classes: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 dark:border-blue-700/50',
        dot: 'bg-blue-500 animate-pulse'
    },
    'COMPLETED': {
        classes: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/50 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-700/50',
        dot: 'bg-green-500'
    },
}

export function JobCard({ job, onApply, onClick, hasApplied, isBookmarked, onBookmark }: JobCardProps) {
    const creatorName = job.creator?.username || job.creator?.email?.split('@')[0] || 'Anonymous'
    const category = categoryColors[job.category] || categoryColors.general
    const status = statusConfig[job.status] || statusConfig.OPEN

    // Format relative time
    const getRelativeTime = (date: string) => {
        const now = new Date()
        const posted = new Date(date)
        const diffMs = now.getTime() - posted.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays}d ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    return (
        <div
            className="job-card group relative bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/5 dark:hover:shadow-orange-500/10 hover:border-orange-200/50 dark:hover:border-orange-600/30"
            onClick={() => onClick?.(job)}
        >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/0 to-amber-500/0 group-hover:from-orange-500/[0.02] group-hover:to-amber-500/[0.02] dark:group-hover:from-orange-500/[0.05] dark:group-hover:to-amber-500/[0.05] transition-all duration-300 pointer-events-none" />

            {/* Header */}
            <div className="relative flex justify-between items-start gap-3 mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-lg leading-tight line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">
                        {job.title}
                    </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {onBookmark && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onBookmark(job.id)
                            }}
                            className={`bookmark-btn p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${isBookmarked
                                ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50'
                                : 'text-gray-400 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                        >
                            <Bookmark
                                className={`w-4 h-4 transition-transform duration-200 ${isBookmarked ? 'fill-current scale-110' : ''}`}
                            />
                        </button>
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {job.status.replace('_', ' ')}
                    </span>
                </div>
            </div>

            {/* Creator & Category Row */}
            <div className="relative flex items-center gap-3 mb-4">
                <Link
                    to={`/profile/${job.creator_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-2 py-1 -ml-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                    {job.creator?.avatar_url ? (
                        <img
                            src={job.creator.avatar_url}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center ring-2 ring-white dark:ring-gray-800 shadow-sm">
                            <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        </div>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        {creatorName}
                    </span>
                </Link>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${category.bg} ${category.text} ${category.darkBg} ${category.darkText}`}>
                    <span className="text-[10px]">{category.icon}</span>
                    {job.category}
                </span>
            </div>

            {/* Description */}
            <div className="relative text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_*]:text-inherit">
                <ReactMarkdown>{job.description}</ReactMarkdown>
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
                <div className="relative flex flex-wrap gap-1.5 mb-4">
                    {job.tags.slice(0, 3).map(tag => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-700/70 dark:text-gray-300 border border-gray-100 dark:border-gray-600/50 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Tag className="w-2.5 h-2.5 opacity-50" />
                            {tag}
                        </span>
                    ))}
                    {job.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
                            +{job.tags.length - 3} more
                        </span>
                    )}
                </div>
            )}


            {/* Footer */}
            <div className="relative flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{getRelativeTime(job.created_at)}</span>
                </div>

                {hasApplied ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                        <Check className="w-4 h-4" />
                        Applied
                    </span>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onApply(job.id)
                        }}
                        className="apply-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm hover:shadow-md hover:shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] group/btn"
                    >
                        Apply Now
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </button>
                )}
            </div>
        </div>
    )
}
