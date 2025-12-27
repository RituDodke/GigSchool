import { Job } from '@/api/jobs'
import { Calendar, Tag, User, ArrowRight } from 'lucide-react'

interface JobCardProps {
    job: Job
    onApply: (jobId: string) => void
}

export function JobCard({ job, onApply }: JobCardProps) {
    const statusStyles: Record<string, string> = {
        'OPEN': 'tag-orange',
        'IN_PROGRESS': 'bg-blue-50 text-blue-700',
        'COMPLETED': 'bg-green-50 text-green-700',
    }

    return (
        <div className="card p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer group">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {job.title}
                </h3>
                <span className={`tag flex-shrink-0 ml-2 ${statusStyles[job.status] || 'tag'}`}>
                    {job.status}
                </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {job.description}
            </p>

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
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(job.created_at).toLocaleDateString()}
                </div>

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
            </div>
        </div>
    )
}
