import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { jobsApi, Job } from '@/api/jobs'
import { JobCard } from './JobCard'
import { CreateJobModal } from './CreateJobModal'
import { Loader2, Plus, Search, Briefcase } from 'lucide-react'

export function JobBoard() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [search, setSearch] = useState('')

    const { data: jobs, isLoading, error } = useQuery<Job[]>({
        queryKey: ['jobs'],
        queryFn: () => jobsApi.getAll()
    })

    const filteredJobs = jobs?.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    )

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="relative w-12 h-12 text-blue-400 animate-spin" />
                </div>
                <p className="mt-6 text-slate-400 animate-pulse">Loading gigs...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Oops! Something went wrong</h3>
                <p className="text-slate-400">Error loading jobs. Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header / Actions */}
            <div className="glass-card p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    {/* Search */}
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search gigs by title, skills..."
                            className="input-premium pl-12"
                        />
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        Post a Gig
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Gigs', value: jobs?.length || 0, color: 'blue' },
                    { label: 'Open', value: jobs?.filter(j => j.status === 'OPEN').length || 0, color: 'green' },
                    { label: 'In Progress', value: jobs?.filter(j => j.status === 'IN_PROGRESS').length || 0, color: 'yellow' },
                    { label: 'Completed', value: jobs?.filter(j => j.status === 'COMPLETED').length || 0, color: 'purple' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-4 text-center hover-lift">
                        <p className={`text-3xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                        <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Grid */}
            {filteredJobs && filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job, index) => (
                        <div
                            key={job.id}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <JobCard
                                job={job}
                                onApply={(id) => console.log('Apply to', id)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-12 md:p-20 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <Briefcase className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No gigs found</h3>
                    <p className="text-slate-400 max-w-md mx-auto mb-8">
                        We couldn't find any gigs matching your search.
                        Be the first to post a new opportunity!
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Post the First Gig
                    </button>
                </div>
            )}

            <CreateJobModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    )
}
