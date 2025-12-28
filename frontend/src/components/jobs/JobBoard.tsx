import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { jobsApi, Job } from '@/api/jobs'
import { JobCard } from './JobCard'
import { CreateJobModal } from './CreateJobModal'
import { JobDetailModal } from './JobDetailModal'
import { Loader2, Plus, Search, Briefcase } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export function JobBoard() {
    const { user } = useAuthStore()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [search, setSearch] = useState('')

    const { data: jobs, isLoading, error } = useQuery<Job[]>({
        queryKey: ['jobs'],
        queryFn: () => jobsApi.getAll()
    })

    // Get user's applications to check which jobs they've applied to
    const { data: userApplications } = useQuery({
        queryKey: ['myApplications', user?.id],
        queryFn: () => jobsApi.getUserApplications(user!.id),
        enabled: !!user,
    })

    const appliedJobIds = new Set(userApplications?.map(app => app.job_id) || [])

    const filteredJobs = jobs?.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    )

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="mt-4 text-gray-500">Loading gigs...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="card p-8 text-center">
                <p className="text-red-600">Error loading jobs. Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search gigs..."
                        className="input-clean pl-10"
                    />
                </div>

                {/* CTA Button */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Post a Gig
                </button>
            </div>

            {/* Grid */}
            {filteredJobs && filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredJobs.map((job, index) => (
                        <div
                            key={job.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <JobCard
                                job={job}
                                onApply={() => setSelectedJob(job)}
                                onClick={(job) => setSelectedJob(job)}
                                hasApplied={appliedJobIds.has(job.id)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card p-12 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        We couldn't find any gigs. Be the first to post one!
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Post the First Gig
                    </button>
                </div>
            )}

            <CreateJobModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <JobDetailModal
                job={selectedJob}
                isOpen={!!selectedJob}
                onClose={() => setSelectedJob(null)}
            />
        </div>
    )
}

