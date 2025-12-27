import { Job } from '@/api/jobs'
import { Calendar, Tag, User, ArrowRight, Clock } from 'lucide-react'

interface JobCardProps {
    job: Job
    onApply: (jobId: string) => void
}

export function JobCard({ job, onApply }: JobCardProps) {
    const statusColors: Record<string, string> = {
        'OPEN': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'IN_PROGRESS': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        'COMPLETED': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }

    return (
        <div className="group glass-card p-6 hover-lift cursor-pointer overflow-hidden relative">
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Top Border Gradient on Hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

            <div className="relative">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors truncate">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Posted by {job.creator_id.slice(0, 8)}...</span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex-shrink-0 ${statusColors[job.status] || statusColors['OPEN']}`}>
                        {job.status}
                    </span>
                </div>

                {/* Description */}
                <p className="text-slate-400 mb-6 line-clamp-2 text-sm leading-relaxed">
                    {job.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {job.tags.slice(0, 3).map(tag => (
                        <div
                            key={tag}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <Tag className="w-3 h-3" />
                            {tag}
                        </div>
                    ))}
                    {job.tags.length > 3 && (
                        <span className="px-3 py-1.5 text-xs text-slate-500">
                            +{job.tags.length - 3} more
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(job.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onApply(job.id)
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group/btn"
                    >
                        Apply
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    )
}
